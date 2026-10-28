// Optional JavaScript contract checks. Run with: node tests/test_runtime_contract.js
(async () => {
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const appSource = read('src/app.js');
const catalogSource = read('src/quote-catalog.js');
const calculationsSource = read('src/quote-calculations.js');
const storageSource = read('src/quote-storage.js');
const exportSource = read('src/quote-exports.js');

for (const source of [appSource, catalogSource, calculationsSource, storageSource, exportSource]) new vm.Script(source);

const appSourceWithTestExport = appSource.replace(/\}\)\(\);\s*$/, 'globalThis.qbtEmailCheck = isValidEmail;globalThis.qbtSetLanguage = (value) => { language = value; };globalThis.qbtTranslate = translateValue;globalThis.qbtEnglishKeys = [...english.keys()];})();');
const appElement = { addEventListener() {}, querySelectorAll() { return []; }, focus() {}, innerHTML: '' };
const appSandbox = {
  document: {
    querySelector: (selector) => selector === '#app' ? appElement : { textContent: '', hidden: true, setAttribute() {}, addEventListener() {} },
    querySelectorAll() { return []; }
  },
  window: { QUANTIX_PHONE_COUNTRIES: [], QUANTIX_CALCULATIONS: {}, QUANTIX_QUOTE_CATALOG: [] }
};
vm.runInNewContext(appSourceWithTestExport, appSandbox);

for (const [email, expected] of [
  ['ana@exemple.cm', true],
  ['ANA@exemple.cm', false],
  ['a..b@exemple.cm', false],
  ['a b@exemple.cm', false],
  ['a@-exemple.cm', false],
  ['a@exemple', false],
  ['é@exemple.cm', false],
  [`${'x'.repeat(65)}@exemple.cm`, false]
]) assert.equal(appSandbox.qbtEmailCheck(email), expected, email);
appSandbox.qbtSetLanguage('en');
assert.equal(appSandbox.qbtTranslate('Commencer'), 'Get started');
assert.equal(appSandbox.qbtTranslate('Devis sélectionné : Fondations et infrastructure.'), 'Selected estimate: Foundations and infrastructure.');
assert.equal(appSandbox.qbtTranslate('Unité : camion'), 'Unit: truck');
assert.equal(appSandbox.qbtTranslate('Quantité (brouette)'), 'Quantity (wheelbarrow)');
assert.equal(appSandbox.qbtTranslate('L’étape « Fondations et infrastructure » a-t-elle déjà été réalisée ?'), 'Has the previous stage, “Foundations and infrastructure”, been completed?');
assert.match(appSandbox.qbtTranslate('Indicatif +237 · 9 chiffres pour le numéro national.'), /Calling code \+237 · 9 digits/);
appSandbox.qbtSetLanguage('fr');
assert.equal(appSandbox.qbtTranslate('Commencer'), 'Commencer');

const catalogSandbox = { window: {} };
vm.runInNewContext(catalogSource, catalogSandbox);
const stages = catalogSandbox.window.QUANTIX_QUOTE_CATALOG;
assert.equal(stages.length, 5);
const industrialFloor = stages[1].sections.find((section) => section.id === 'dallage-industriel');
assert.equal(Array.from(industrialFloor.applicable_a).join('|'), 'Entrepôt / bâtiment industriel');
const englishKeys = new Set(appSandbox.qbtEnglishKeys);
for (const stage of stages) {
  for (const label of [stage.stage, ...stage.sections.flatMap(section => [section.title, section.description_technique, ...section.items.map(item => item.designation)]), ...(stage.a_confirmer || [])].filter(Boolean)) {
    assert.ok(englishKeys.has(label), `Missing English translation: ${label}`);
  }
  assert.equal(stage.sections[0].type, 'equipment');
  for (const section of stage.sections) {
    assert.ok(section.items.length > 0, `${stage.stage}/${section.id}`);
    const itemIds = section.items.map((item) => item.id);
    assert.equal(new Set(itemIds).size, itemIds.length, `${stage.stage}/${section.id} item IDs`);
    for (const item of section.items) {
      assert.ok(item.designation && item.unit && Array.isArray(item.applicable_a));
      assert.equal(Object.hasOwn(item, 'quantity'), false, 'No quantity is prefilled');
      assert.equal(Object.hasOwn(item, 'unitPrice'), false, 'No price is prefilled');
    }
    if (section.type === 'equipment') {
      for (const item of section.items) assert.equal(item.statuts_possibles.length, 4);
    }
  }
}

const appFactorySource = appSource.replace(/\}\)\(\);\s*$/, 'globalThis.qbtCreateQuoteSection = createQuoteSection;globalThis.qbtFillDemoQuote = fillDemoQuote;globalThis.qbtSetDemoConfig = (value) => { demoConfig = value; demoMode = true; };globalThis.qbtSetDemoBuilding = (value) => { project.buildingType = value; };})();');
const inert = { addEventListener() {}, querySelectorAll() { return []; }, querySelector() { return { content: '', setAttribute() {} }; }, setAttribute() {}, focus() {}, innerHTML: '' };
const factorySandbox = { document: { querySelector: (selector) => selector === '#app' ? inert : inert, querySelectorAll() { return []; }, title: '', body: {} }, window: { QUANTIX_PHONE_COUNTRIES: [], QUANTIX_CALCULATIONS: {}, QUANTIX_QUOTE_CATALOG: stages, QUANTIX_STORAGE: {}, QUANTIX_EXPORTS: {} }, Map, WeakMap, Intl, Set, Array, Object, String, Math, Number, RegExp, Boolean, JSON };
factorySandbox.globalThis = factorySandbox;
vm.runInNewContext(appFactorySource, factorySandbox);
for (const stage of stages) {
  const sections = factorySandbox.qbtCreateQuoteSection(stage.stage);
  assert.equal(sections.filter((section) => section.id === 'labor').length, 1, `${stage.stage} gets one labor section`);
  const equipment = sections.find((section) => section.id === 'equipment').equipmentItems;
  assert.ok(equipment.every((item) => !/\bou\b|,/i.test(item.designation)), `${stage.stage} equipment is itemized`);
  const equipmentOnly = /cordeau|piquet d’implantation|chaise d’implantation|\bétais\b|tour d’étaiement|brouette|pelle|pioche|houe|seau|truelle|taloche|platoir|niveau|fil à plomb|règle de maçon|mètre ruban|décamètre|bétonnière|aiguille vibrante|compacteur|échafaudage|plateforme de travail|groupe électrogène|perceuse|visseuse|scie|marteau|pince|harnais antichute|garde-corps provisoire/iu;
  const duplicateMaterial = sections.filter((section) => section.id !== 'equipment' && section.id !== 'labor').flatMap((section) => section.items).filter((item) => equipmentOnly.test(item.designation));
  assert.equal(duplicateMaterial.length, 0, `${stage.stage} equipment is not duplicated as material: ${duplicateMaterial.map((item) => item.designation).join(', ')}`);
}

const demoConfig = { demo: { quantity: '12', unitPrice: '2500', equipmentQuantity: '2', equipmentUnitPrice: '15000', rentalDuration: '3', rentalUnitPrice: '10000', precision: 'Fictional sample data.', laborQuantity: '5', laborUnitPrice: '20000' } };
factorySandbox.qbtSetDemoConfig(demoConfig);
for (const [building] of [['Maison'], ['Duplex'], ['Petit bâtiment commercial'], ['Bâtiment résidentiel'], ['Établissement scolaire'], ['Bâtiment administratif'], ['Entrepôt / bâtiment industriel'], ['Autre']]) {
  factorySandbox.qbtSetDemoBuilding(building);
  for (const stage of stages) {
    const sample = factorySandbox.qbtFillDemoQuote({ stage: stage.stage, sections: factorySandbox.qbtCreateQuoteSection(stage.stage), currentSection: 0, saved: false });
    assert.ok(sample.sections.length > 1, `${building}/${stage.stage} has every applicable section`);
    for (const section of sample.sections) {
      assert.ok(Number(section.contingency) > 0, `${section.title} has a contingency rate`);
      if (section.id === 'equipment') assert.ok(section.equipmentItems.every(item => ['purchase', 'rent'].includes(item.status) && item.unitPrice && (item.status === 'rent' ? item.duration : item.quantity)), `${building}/${stage.stage} equipment is filled`);
      else assert.ok(section.items.every(item => item.quantity && item.unitPrice && item.unit && item.precision), `${building}/${stage.stage}/${section.title} resources are filled`);
    }
  }
}

const calculationSandbox = { window: {} };
vm.runInNewContext(calculationsSource, calculationSandbox);
const math = calculationSandbox.window.QUANTIX_CALCULATIONS;
assert.ok(Math.abs(math.concreteVolume(2, 3, 0.1) - 0.6) < 1e-10);
assert.ok(Math.abs(math.sectionTotals([{ quantity: 10, unitPrice: 2 }], 5).total - 21) < 1e-10);
assert.ok(Math.abs(math.sectionTotals([{ quantity: 2, unitPrice: 100 }], 5).contingency - 10) < 1e-10);

const quoteForValidation = [{
  title: 'Béton', contingency: 5, equipmentItems: [], materialItems: [{ designation: '', quantity: '', unit: '', unitPrice: '' }], lines: []
}];
assert.equal(math.validateQuote(quoteForValidation).message, 'Ajoutez au moins une ressource chiffrée avec une quantité et un prix unitaire avant de créer la synthèse.');
assert.equal(math.validateQuote([{ title: 'Matériel', contingency: 5, equipmentItems: [], materialItems: [], lines: [], canAddLine: false }, { title: 'Béton', contingency: 5, equipmentItems: [], materialItems: [], lines: [], canAddLine: true }]).sectionIndex, 1);
quoteForValidation[0].materialItems = [];
quoteForValidation[0].lines = [{ quantity: '2', unitPrice: '100' }];
assert.equal(math.validateQuote(quoteForValidation), null);
quoteForValidation[0].equipmentItems = [{ status: '' }];
assert.equal(math.validateQuote(quoteForValidation).message, 'Choisissez un statut pour chaque équipement applicable.');
quoteForValidation[0].equipmentItems = [{ status: 'purchase', quantity: '', unitPrice: '' }];
assert.match(math.validateQuote(quoteForValidation).selector, /data-equipment-field="quantity"/);
quoteForValidation[0].equipmentItems = [];
quoteForValidation[0].materialItems = [{ designation: 'Ciment', quantity: '2', unit: 'sac', unitPrice: '' }];
assert.equal(math.validateQuote(quoteForValidation).message, 'Complétez ou supprimez chaque ligne de ressource commencée.');
assert.match(math.validateQuote(quoteForValidation).selector, /data-line-field="unitPrice"/);

console.log(`OK — 8 cas e-mail, traduction FR/EN et catalogue (tous libellés traduits), ${stages.length} étapes, calculs et validation guidée du devis.`);

const exportSandbox = { window: {}, TextEncoder };
vm.runInNewContext(exportSource, exportSandbox);
const exportApi = exportSandbox.window.QUANTIX_EXPORTS;
const sampleContributor = { name: 'Amina Nguema', role: 'Propriétaire', otherRole: '', phone: '679000030', dialCode: '+237', email: 'amina@example.cm' };
const sampleProject = { name: '=FORMULE', currency: 'XAF' };
const sampleQuote = { stage: 'Fondations' };
const sampleSummary = { sections: [{ title: 'Béton', rate: 5, rows: [{ designation: 'Ciment', quantity: 2, unit: 'sac', unitPrice: 6000, total: 12000 }], subtotal: 12000, contingency: 600, total: 12600 }], total: 12600 };
const csv = exportApi.buildCsv(sampleContributor, sampleProject, sampleQuote, sampleSummary, 'fr');
assert.ok(csv.startsWith('\uFEFF'));
assert.ok(csv.includes("'=FORMULE"), 'CSV text cells protect against spreadsheet formulas');
assert.ok(csv.includes('Imprévus (5 %)'));
assert.ok(csv.includes('Préparé par'));
assert.ok(csv.includes('Ciment'));
assert.ok(!csv.includes('Béton;Ciment'), 'Section name is not repeated on each CSV line');
const englishCsv = exportApi.buildCsv(sampleContributor, sampleProject, sampleQuote, sampleSummary, 'en');
assert.ok(englishCsv.includes('Prepared by') && englishCsv.includes('Section subtotal'));
assert.ok(!englishCsv.includes('Imprévus'));
const pdf = Buffer.from(exportApi.buildPdf(sampleContributor, sampleProject, sampleQuote, sampleSummary, 'fr'));
require('node:fs').writeFileSync('/tmp/quantix-export-validation.pdf', pdf);
assert.equal(pdf.toString('ascii', 0, 8), '%PDF-1.4');
assert.ok(pdf.includes(Buffer.from('Amina Nguema')), 'PDF includes contributor identity');
assert.ok(pdf.includes(Buffer.from('12 000 XAF')), 'PDF currency grouping uses a PDF-safe space character');
assert.ok(pdf.includes(Buffer.from('Section subtotal')) === false, 'French PDF labels remain French');
const longSummary = { sections: [{ title: 'Long section', rate: 5, rows: Array.from({ length: 110 }, (_, index) => ({ designation: `Material line ${index + 1} with a long description that wraps`, quantity: 1, unit: 'piece', unitPrice: 100, total: 100 })), subtotal: 11000, contingency: 550, total: 11550 }], total: 11550 };
const multipagePdf = Buffer.from(exportApi.buildPdf(sampleContributor, sampleProject, sampleQuote, longSummary, 'en')).toString('latin1');
assert.match(multipagePdf, /\/Count [2-9]/, 'Long PDF reports split across pages');
const xlsx = Buffer.from(exportApi.buildXlsx(sampleContributor, sampleProject, sampleQuote, sampleSummary, 'fr'));
assert.equal(xlsx.readUInt32LE(0), 0x04034b50, 'XLSX starts with a ZIP local-file header');
assert.equal(exportApi.mimeXlsx, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
const chartFixture = { total: 770, sections: [
  { kind: 'equipment', rows: [{ designation: 'Mètre ruban', total: 100 }], contingency: 10 },
  { kind: 'materials', rows: [{ designation: 'Ciment pour dalle', total: 200 }, { designation: 'Sable pour dalle', total: 100 }], contingency: 30 },
  { kind: 'materials', rows: [{ designation: 'Ciment pour fondations', total: 300 }], contingency: 30 }
] };
const chartGroups = exportApi.chartData(chartFixture, 'fr');
assert.equal(chartGroups.filter(group => group.label === 'Matériel et équipements').length, 1);
assert.equal(chartGroups.find(group => group.label === 'Ciment').value, 550);
assert.ok(Math.abs(chartGroups.reduce((sum, group) => sum + group.value, 0) - chartFixture.total) < 1e-8, 'Charts include every section contingency and match the estimate total');
assert.ok(exportApi.chartData(chartFixture, 'en').some(group => group.label === 'Tools and equipment'));
require('node:fs').writeFileSync('/tmp/quantix-export-validation.xlsx', xlsx);
console.log('OK — CSV FR/EN, PDF sans impression navigateur, contributeur en tête, XLSX généré.');

async function verifyStorage() {
  const { webcrypto } = require('node:crypto');
  const storageSandbox = { window: {}, crypto: webcrypto, TextEncoder, TextDecoder, btoa, atob };
  vm.runInNewContext(storageSource, storageSandbox);
  const storage = storageSandbox.window.QUANTIX_STORAGE;
  const data = {
    contributor: { name: 'Amina', role: 'Propriétaire', otherRole: '', phone: '679000030', dialCode: '+237', email: '' },
    project: { name: 'Projet test', buildingType: 'Maison', buildingTypeOther: '', location: '', notes: '', currency: 'XAF', stage: 'Fondations et infrastructure' },
    quote: { stage: 'Fondations et infrastructure', currentSection: 0, saved: true, sections: [{ id: 'test', title: 'Béton', catalogTitle: false, description: '', kind: 'concrete', mode: 'manual', contingency: 5, toConfirm: [], items: [{ designation: 'Ciment', catalogDesignation: false, quantity: '4', unit: 'sac', unitPrice: '6000', assisted: false, applicable_a: ['tous'] }], equipmentItems: [], params: {} }] },
    stageChecks: [], exportLanguage: 'fr', savedAt: ''
  };
  const plain = await storage.serialize(data);
  assert.deepEqual(JSON.parse(JSON.stringify(await storage.deserialize(plain))), JSON.parse(JSON.stringify(data)));
  for (const [filename, locale] of [['examples/quantix-exemple-fr.json', 'fr'], ['examples/quantix-example-en.json', 'en']]) {
    const fixture = JSON.parse(read(filename));
    assert.equal(fixture.format, 'quantix-btp-backup');
    assert.equal(fixture.version, 1);
    assert.equal(fixture.locale, locale);
    assert.equal(fixture.data.exportLanguage, locale);
    const importedExample = await storage.deserialize(JSON.stringify({ format: fixture.format, version: fixture.version, data: fixture.data }));
    assert.equal(importedExample.contributor.name, 'Amina Nguema');
    assert.equal(importedExample.quote.stage, fixture.data.project.stage);
  }
  const locked = await storage.serialize(data, 'motdepasse-solide-2026');
  assert.equal((await storage.deserialize(locked, 'motdepasse-solide-2026')).project.name, 'Projet test');
  await assert.rejects(storage.deserialize(locked, 'incorrect'), /Mot de passe incorrect/);
  await assert.rejects(storage.deserialize('{broken'), /JSON valide/);
  await assert.rejects(storage.deserialize(JSON.stringify({ format: 'quantix-btp-backup', version: 1, data: {} })), /informations attendues/);
  console.log('OK — sauvegarde JSON claire/chiffrée, import, mauvais mot de passe et JSON invalide.');
}

await verifyStorage();
})().catch((error) => { console.error(error); throw error; });
