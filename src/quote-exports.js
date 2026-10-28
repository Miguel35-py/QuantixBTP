(() => {
  'use strict';

  const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  function cellText(value) {
    const text = String(value ?? '');
    return /^[\u0000-\u0020\uFEFF]*[=+@\-]/.test(text) ? `'${text}` : text;
  }

  function csvField(value) {
    return `"${cellText(value).replace(/"/g, '""')}"`;
  }

  function labels(language) {
    return language === 'en'
      ? { contributor:'Prepared by', role:'Role', phone:'Phone', email:'Email', project:'Project', stage:'Stage', currency:'Currency', table:['Description','Quantity','Unit price','Total'], subtotal:'Section subtotal', contingency:'Contingency', totalSection:'Section total', total:'Estimated total', file:'Quantix BTP estimate' }
      : { contributor:'Préparé par', role:'Fonction', phone:'Téléphone', email:'E-mail', project:'Chantier', stage:'Étape', currency:'Devise', table:['Désignation','Quantité','Prix unitaire','Total'], subtotal:'Sous-total de la section', contingency:'Imprévus', totalSection:'Total de la section', total:'Total estimatif', file:'Devis Quantix BTP' };
  }

  const chartColors = ['#df4f96','#3c83b8','#43a581','#d49b35','#7a69bb','#db7254','#338f91','#8a7659','#c05a70','#687d99'];

  function chartGroup(label, sectionKind, language) {
    const value = String(label || '').replace(/\s*\([^()]*\)/g, '').trim();
    const lower = value.toLocaleLowerCase(language === 'en' ? 'en-US' : 'fr-FR');
    if (sectionKind === 'equipment') return language === 'en' ? 'Tools and equipment' : 'Matériel et équipements';
    if (sectionKind === 'labor') return language === 'en' ? 'Labor' : 'Main-d’œuvre';
    if (/ciment|cement/.test(lower)) return language === 'en' ? 'Cement' : 'Ciment';
    if (/sable|sand/.test(lower)) return language === 'en' ? 'Sand' : 'Sable';
    if (/gravier|granulat|gravel|aggregate/.test(lower)) return language === 'en' ? 'Gravel and aggregates' : 'Gravier et granulats';
    if (/bois|planche|chevron|liteau|wood|timber|lumber/.test(lower)) return language === 'en' ? 'Timber' : 'Bois';
    if (/tôle|tuile|couverture|faîtière|gouttière|roof|sheet|tile|gutter/.test(lower)) return language === 'en' ? 'Roofing' : 'Couverture';
    if (/acier|fer à béton|armature|steel|reinforcement/.test(lower)) return language === 'en' ? 'Reinforcement steel' : 'Acier et ferraillage';
    if (/eau|water/.test(lower)) return language === 'en' ? 'Water' : 'Eau';
    if (/carburant|gasoil|fuel|diesel/.test(lower)) return language === 'en' ? 'Fuel' : 'Carburant';
    return value || (language === 'en' ? 'Other resources' : 'Autres ressources');
  }

  function chartData(summary, language = 'fr') {
    const amounts = new Map();
    for (const section of summary.sections || []) {
      const direct = new Map();
      for (const row of section.rows || []) {
        const amount = Number(row.total);
        if (!(amount > 0) || !Number.isFinite(amount)) continue;
        const group = chartGroup(row.designation, section.kind, language);
        direct.set(group, (direct.get(group) || 0) + amount);
      }
      const subtotal = [...direct.values()].reduce((sum, amount) => sum + amount, 0);
      const contingency = Number(section.contingency) || 0;
      for (const [group, amount] of direct) {
        const allocated = subtotal > 0 ? contingency * amount / subtotal : 0;
        amounts.set(group, (amounts.get(group) || 0) + amount + allocated);
      }
    }
    const equipmentLabel = language === 'en' ? 'Tools and equipment' : 'Matériel et équipements';
    const laborLabel = language === 'en' ? 'Labor' : 'Main-d’œuvre';
    const entries = [...amounts.entries()].sort((a, b) => {
      const rank = (label) => label === equipmentLabel ? 0 : label === laborLabel ? 1 : 2;
      return rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0], language === 'en' ? 'en-US' : 'fr-FR');
    });
    return entries.map(([label, value], index) => ({ label, value, color: chartColors[index % chartColors.length] }));
  }

  function exportRows(contributor, project, quote, summary, language='fr') {
    const l=labels(language);
    const rows = [[l.contributor, contributor.name], [l.role, contributor.role === 'Autre' ? contributor.otherRole : contributor.role], [l.phone, `${contributor.dialCode || ''} ${contributor.phone || ''}`.trim()], [l.email, contributor.email], [l.project, project.name], [l.stage, quote.stage], [l.currency, project.currency], [], l.table];
    for (const section of summary.sections) {
      rows.push([section.title, '', '', '']);
      for (const item of section.rows) rows.push([item.designation, `${item.quantity} ${item.unit || ''}`.trim(), item.unitPrice, item.total]);
      rows.push([l.subtotal, '', '', section.subtotal]);
      rows.push([`${l.contingency} (${section.rate} %)`, '', '', section.contingency]);
      rows.push([l.totalSection, '', '', section.total]);
      rows.push([]);
    }
    rows.push([l.total, '', '', summary.total]);
    return rows;
  }

  function buildCsv(contributor, project, quote, summary, language='fr') {
    return `\uFEFF${exportRows(contributor, project, quote, summary, language).map((row) => row.map(csvField).join(';')).join('\r\n')}`;
  }

  function xmlEscape(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function littleEndian(size, values) {
    const bytes = new Uint8Array(size);
    const view = new DataView(bytes.buffer);
    values.forEach(([offset, value, width]) => {
      if (width === 2) view.setUint16(offset, value, true);
      else view.setUint32(offset, value, true);
    });
    return bytes;
  }

  function concatBytes(parts) {
    const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    let offset = 0;
    for (const part of parts) { output.set(part, offset); offset += part.length; }
    return output;
  }

  function zipStore(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    for (const [name, content] of files) {
      const filename = encoder.encode(name);
      const data = encoder.encode(content);
      const crc = crc32(data);
      const local = concatBytes([
        littleEndian(30, [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, 0, 2], [12, 33, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, filename.length, 2], [28, 0, 2]]), filename, data
      ]);
      const central = concatBytes([
        littleEndian(46, [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, 0, 2], [14, 33, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, filename.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, offset, 4]]), filename
      ]);
      localParts.push(local);
      centralParts.push(central);
      offset += local.length;
    }
    const centralDirectory = concatBytes(centralParts);
    const end = littleEndian(22, [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, files.length, 2], [10, files.length, 2], [12, centralDirectory.length, 4], [16, offset, 4], [20, 0, 2]]);
    return concatBytes([...localParts, centralDirectory, end]);
  }

  function buildXlsx(contributor, project, quote, summary, language='fr') {
    const rows = exportRows(contributor, project, quote, summary, language);
    const sheetRows = rows.map((row, rowIndex) => {
      const isHeader = rowIndex === 8;
      const isSection = row.length === 4 && row[0] && row.slice(1).every((value) => value === '');
      const isTotal = row[0] === 'Total estimatif' || row[0] === 'Estimated total' || row[0] === 'Total de la section' || row[0] === 'Section total';
      const style = isHeader ? 1 : isSection ? 2 : isTotal ? 3 : 0;
      const cells = row.map((value, columnIndex) => {
        if (value === '' || value === null || value === undefined) return '';
        const reference = `${String.fromCharCode(65 + columnIndex)}${rowIndex + 1}`;
        if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${reference}" s="${style}"><v>${value}</v></c>`;
        return `<c r="${reference}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(cellText(value))}</t></is></c>`;
      }).join('');
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    }).join('');
    const files = [
      ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
      ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Quantix Estimate" sheetId="1" r:id="rId1"/></sheets></workbook>'],
      ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
      ['xl/worksheets/sheet1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="38" customWidth="1"/><col min="2" max="2" width="24" customWidth="1"/><col min="3" max="4" width="18" customWidth="1"/></cols><sheetData>${sheetRows}</sheetData></worksheet>`],
      ['xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Arial"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF243349"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF0F3F7"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top/><bottom style="thin"><color rgb="FFD9E0E8"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFill="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>']
    ];
    return zipStore(files);
  }


  function pdfEscape(value) {
    return String(value ?? '').replace(/[\\()]/g, '\\$&').replace(/[\u2018\u2019]/g,"'").replace(/[\u2013\u2014]/g,'-').replace(/[^\x20-\xFF]/g,'?');
  }
  function buildPdf(contributor, project, quote, summary, language='fr') {
    const l=labels(language); const pages=[]; let commands=[], y=790;
    const money=(amount)=>`${new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', { maximumFractionDigits: 2 }).format(amount).replace(/[\u00a0\u202f]/g, ' ')} ${project.currency}`;
    const pageStart=()=>{commands=['0.96 0.97 0.99 rg 0 792 595 50 re f','0.90 0.25 0.55 rg 38 754 5 22 re f',`BT /F2 18 Tf 54 760 Td (${pdfEscape(l.file)}) Tj ET`];y=728;};
    const text=(x,yy,size,value,bold=false,color='0.16 0.22 0.31')=>commands.push(`${color} rg BT /${bold?'F2':'F1'} ${size} Tf ${x} ${yy} Td (${pdfEscape(value)}) Tj ET`);
    const rule=(yy)=>commands.push(`0.83 0.86 0.90 RG 38 ${yy} m 557 ${yy} l S`);
    const wrap=(value,limit)=>{const words=String(value??'').split(/\s+/);const lines=[];let current='';for(const word of words){if(!word)continue;const next=current?`${current} ${word}`:word;if(next.length>limit&&current){lines.push(current);current=word;}else current=next;}if(current)lines.push(current);return lines.length?lines:[''];};
    const beginPage=()=>{pageStart();drawTableHeader();};
    const positions=[42,324,412,493], widths=[40,14,13,12];
    const drawTableHeader=()=>{commands.push(`0.14 0.21 0.32 rg 38 ${y-5} 519 24 re f`);l.table.forEach((heading,index)=>text(positions[index],y+3,8,heading,true,'1 1 1'));y-=25;};
    const ensure=(needed)=>{if(y<55+needed){pages.push(commands.join('\n'));beginPage();}};
    const drawCharts=()=>{
      const groups=chartData(summary,language);
      if(!groups.length)return;
      const top=y-7, bottom=top-140, barLeft=38, pieLeft=304, cardW=253;
      commands.push(`0.96 0.97 0.99 rg ${barLeft} ${bottom} ${cardW} 140 re f`,`0.96 0.97 0.99 rg ${pieLeft} ${bottom} ${cardW} 140 re f`);
      text(barLeft+9,top-14,8,language==='en'?'Cost by material':'Coût par matériau',true);
      text(pieLeft+9,top-14,8,language==='en'?'Share of estimate total':'Part du total estimatif',true);
      const baseline=bottom+30, max=Math.max(...groups.map(item=>item.value),1), step=225/groups.length;
      commands.push(`0.72 0.76 0.82 RG ${barLeft+13} ${baseline} m ${barLeft+cardW-8} ${baseline} l S`);
      groups.forEach((item,index)=>{
        const center=barLeft+18+step*(index+.5), h=Math.max(1,item.value/max*76), rgb=hexRgb(item.color);
        commands.push(`${rgb} rg ${center-Math.min(8,step*.3)} ${baseline} ${Math.min(16,step*.6)} ${h} re f`);
        text(center-10,baseline-9,5,item.label.slice(0,13));
      });
      const cx=pieLeft+52,cy=bottom+69,r=37,total=groups.reduce((sum,item)=>sum+item.value,0);let angle=-Math.PI/2;
      groups.forEach(item=>{
        const next=angle+(item.value/total)*Math.PI*2, rgb=hexRgb(item.color), pts=[];const n=Math.max(2,Math.ceil((next-angle)/.1));
        for(let i=0;i<=n;i++){const a=angle+(next-angle)*i/n;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}
        commands.push(`${rgb} rg ${cx} ${cy} m ${pts.map(([x,yy])=>`${x.toFixed(2)} ${yy.toFixed(2)} l`).join(' ')} h f`);angle=next;
      });
      groups.slice(0,7).forEach((item,index)=>{
        const yy=top-31-index*14,rgb=hexRgb(item.color),pct=total?item.value/total*100:0;
        commands.push(`${rgb} rg ${pieLeft+102} ${yy-2} 6 6 re f`);
        text(pieLeft+113,yy,6,`${item.label.slice(0,23)} ${pct.toFixed(1)}%`);
      });
      if(groups.length>7)text(pieLeft+113,top-31-7*14,6,`+ ${groups.length-7} ${language==='en'?'more':'autres'}`);
      y=bottom-13;
    };
    pageStart();
    text(42,y,10,`${l.contributor}: ${contributor.name}`,true);y-=17;
    const contact=wrap(`${l.role}: ${contributor.role==='Autre'?contributor.otherRole:contributor.role}    ${l.phone}: ${contributor.dialCode||''} ${contributor.phone||''}    ${l.email}: ${contributor.email||'—'}`,86);
    for(const line of contact){text(42,y,9,line);y-=14;}
    for(const line of wrap(`${l.project}: ${project.name}    ${l.stage}: ${quote.stage}    ${l.currency}: ${project.currency}`,86)){text(42,y,9,line);y-=14;}
    y-=5;rule(y);y-=13;drawCharts();drawTableHeader();
    for(const section of summary.sections){ensure(40);commands.push(`0.94 0.95 0.97 rg 38 ${y-4} 519 19 re f`);text(42,y,9,section.title,true);y-=21;
      for(const item of section.rows){const cols=[wrap(item.designation,40),wrap(`${item.quantity} ${item.unit||''}`.trim(),14),wrap(money(item.unitPrice),13),wrap(money(item.total),12)];const height=Math.max(...cols.map(col=>col.length))*11+5;ensure(height);for(let row=0;row<Math.max(...cols.map(col=>col.length));row++){cols.forEach((col,index)=>{if(col[row])text(positions[index],y,8,col[row]);});y-=11;}rule(y+4);y-=3;}
      ensure(55);text(324,y,8,l.subtotal);text(493,y,8,money(section.subtotal),true);y-=15;text(324,y,8,`${l.contingency} (${section.rate} %)`);text(493,y,8,money(section.contingency));y-=15;text(324,y,9,l.totalSection,true);text(493,y,9,money(section.total),true);y-=23;
    }
    ensure(35);commands.push(`0.90 0.25 0.55 rg 38 ${y-10} 519 30 re f`);text(324,y,11,l.total,true,'1 1 1');text(468,y,11,money(summary.total),true,'1 1 1');pages.push(commands.join('\n'));
    const objects=[];const add=value=>{objects.push(value);return objects.length;};const catalog=add(''),pagesRef=add(''),font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),bold=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');const pageIds=[];
    for(const content of pages){const streamRef=add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);pageIds.push(add(`<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font} 0 R /F2 ${bold} 0 R >> >> /Contents ${streamRef} 0 R >>`));}
    objects[catalog-1]=`<< /Type /Catalog /Pages ${pagesRef} 0 R >>`;objects[pagesRef-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
    let pdf='%PDF-1.4\n%QuantixBTP\n';const offsets=[0];objects.forEach((object,index)=>{offsets.push(pdf.length);pdf+=`${index+1} 0 obj\n${object}\nendobj\n`;});const xref=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(offset=>`${String(offset).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return Uint8Array.from(pdf,char=>char.charCodeAt(0)&255);
  }

  function hexRgb(color) {
    const value=String(color).replace('#','');
    return [0,2,4].map(index=>(parseInt(value.slice(index,index+2),16)/255).toFixed(3)).join(' ');
  }

  window.QUANTIX_EXPORTS = Object.freeze({ buildCsv, buildXlsx, buildPdf, chartData, mimeXlsx: MIME_XLSX });
})();
