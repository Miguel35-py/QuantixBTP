(() => {
  'use strict';

  const positive = (value, name) => {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) throw new TypeError(`${name} doit être supérieur à zéro.`);
    return number;
  };

  function product(values, name) {
    return values.reduce((total, value, index) => total * positive(value, `${name} ${index + 1}`), 1);
  }

  function concreteVolume(length, width, thickness) {
    return product([length, width, thickness], 'Dimension') ;
  }

  function concreteMaterials(volume, recipe) {
    const quantity = positive(volume, 'Volume de béton');
    return {
      volume: quantity,
      cementKg: quantity * positive(recipe.cementKgPerM3, 'Dosage de ciment'),
      sandM3: quantity * positive(recipe.sandM3PerM3, 'Dosage de sable'),
      gravelM3: quantity * positive(recipe.gravelM3PerM3, 'Dosage de gravier'),
      waterL: quantity * positive(recipe.waterLPerM3, 'Dosage d’eau')
    };
  }

  function masonryBlockCount(length, height, openingsArea, blockLength, blockHeight) {
    const wallArea = product([length, height], 'Dimension du mur');
    const openings = Number(openingsArea);
    if (!Number.isFinite(openings) || openings < 0 || openings >= wallArea) {
      throw new TypeError('La surface des ouvertures doit être positive ou nulle et inférieure à celle du mur.');
    }
    return Math.ceil((wallArea - openings) / product([blockLength, blockHeight], 'Dimension du bloc'));
  }

  function lineTotal(quantity, unitPrice) {
    const amount = Number(quantity);
    const price = Number(unitPrice);
    if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(price) || price < 0) return 0;
    return amount * price;
  }

  function sectionTotals(items, contingencyPercent) {
    const rate = Number(contingencyPercent);
    if (!Number.isFinite(rate) || rate <= 0 || rate > 50) {
      throw new TypeError('Le taux d’imprévus doit être supérieur à 0 % et inférieur ou égal à 50 %.');
    }
    const subtotal = items.reduce((sum, item) => sum + lineTotal(item.quantity, item.unitPrice), 0);
    const contingency = subtotal * rate / 100;
    return { subtotal, contingency, total: subtotal + contingency };
  }

  function validateQuote(sections) {
    const number = (value) => String(value ?? '').trim() === '' ? NaN : Number(value);
    for (const [sectionIndex, section] of sections.entries()) {
      if (!String(section.title || '').trim()) return { sectionIndex, selector: '[data-section-field="title"]', message: 'Donnez un nom à chaque section du devis.' };
      const rate = number(section.contingency);
      if (!Number.isFinite(rate) || rate <= 0 || rate > 50) return { sectionIndex, selector: '[data-section-field="contingency"]', message: 'Le taux d’imprévus doit être supérieur à 0 % et ne pas dépasser 50 %.' };
      for (const equipment of section.equipmentItems || []) {
        if (!equipment.status) return { sectionIndex, selector: '[data-equipment-field="status"]', message: 'Choisissez un statut pour chaque équipement applicable.' };
        if (equipment.status === 'purchase' || equipment.status === 'rent') {
          const amount = number(equipment.status === 'rent' ? equipment.duration : equipment.quantity);
          const price = number(equipment.unitPrice);
          if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(price) || price < 0) {
            const amountField = equipment.status === 'rent' ? 'duration' : 'quantity';
            const key = !Number.isFinite(amount) || amount <= 0 ? amountField : 'unitPrice';
            return { sectionIndex, selector: `[data-equipment-index="${equipment.index ?? section.equipmentItems.indexOf(equipment)}"] [data-equipment-field="${key}"]`, message: 'Complétez la quantité ou la durée et le prix unitaire de chaque équipement à acheter ou à louer.' };
          }
        }
      }
      for (const line of section.materialItems || []) {
        const empty = !String(line.quantity).trim() && !String(line.unitPrice).trim();
        if (!empty && (!String(line.designation || '').trim() || !Number.isFinite(number(line.quantity)) || number(line.quantity) <= 0 || !line.unit || (line.unit === 'custom' && !String(line.customUnit || '').trim()) || !Number.isFinite(number(line.unitPrice)) || number(line.unitPrice) < 0)) {
          const key = !String(line.designation || '').trim() ? 'designation' : !Number.isFinite(number(line.quantity)) || number(line.quantity) <= 0 ? 'quantity' : !line.unit ? 'unit' : line.unit === 'custom' && !String(line.customUnit || '').trim() ? 'customUnit' : 'unitPrice';
          return { sectionIndex, selector: `[data-line-index="${line.index ?? 0}"] [data-line-field="${key}"]`, message: 'Complétez ou supprimez chaque ligne de ressource commencée.' };
        }
      }
    }
    const hasCost = sections.some((section) => (section.lines || []).some((line) => Number.isFinite(number(line.quantity)) && number(line.quantity) > 0 && Number.isFinite(number(line.unitPrice))));
    if (!hasCost) return { sectionIndex: Math.max(0, sections.findIndex((section) => section.canAddLine)), selector: '[data-add-line]', message: 'Ajoutez au moins une ressource chiffrée avec une quantité et un prix unitaire avant de créer la synthèse.' };
    return null;
  }

  window.QUANTIX_CALCULATIONS = Object.freeze({
    concreteVolume,
    concreteMaterials,
    masonryBlockCount,
    lineTotal,
    sectionTotals,
    validateQuote
  });
})();
