(() => {
  'use strict';

  const FORMAT = 'quantix-btp-backup';
  const VERSION = 1;
  const ITERATIONS = 310000;
  const STAGES = ['Fondations et infrastructure', 'Soubassement et plancher bas', 'Élévation du rez-de-chaussée', 'Plancher et niveaux supérieurs', 'Charpente et couverture'];
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  function encode64(bytes) {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  function decode64(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  }

  function validateBackup(value) {
    if (!value || value.format !== FORMAT || value.version !== VERSION || !value.data || typeof value.data !== 'object') {
      throw new TypeError('Fichier Quantix BTP invalide ou version non prise en charge.');
    }
    const { contributor, project, quote } = value.data;
    const stringFields = (source, fields) => source && fields.every((field) => typeof source[field] === 'string' && source[field].length <= 500);
    if (!stringFields(contributor, ['name', 'role', 'otherRole', 'phone', 'dialCode', 'email']) ||
        !stringFields(project, ['name', 'buildingType', 'buildingTypeOther', 'location', 'notes', 'currency', 'stage']) ||
        !STAGES.includes(project.stage) || !quote || !STAGES.includes(quote.stage) || !Array.isArray(quote.sections) || !quote.sections.length) {
      throw new TypeError('La sauvegarde ne contient pas les informations attendues pour un devis.');
    }
    const lineKeys = ['designation', 'catalogDesignation', 'quantity', 'unit', 'customUnit', 'unitPrice', 'assisted', 'precision', 'baseQuantity', 'baseUnit', 'acquisition', 'applicable_a'];
    const itemSafe = (item) => {
      if (!item || typeof item !== 'object') throw new TypeError('Une ligne du devis est invalide.');
      const result = {};
      for (const key of lineKeys) if (Object.hasOwn(item, key)) result[key] = item[key];
      if (typeof result.designation !== 'string' || result.designation.length > 500) throw new TypeError('Une désignation de ligne est invalide.');
      for (const key of ['quantity', 'unit', 'customUnit', 'unitPrice', 'precision', 'baseUnit', 'acquisition']) {
        if (Object.hasOwn(result, key) && typeof result[key] !== 'string') throw new TypeError('Une valeur de ligne est invalide.');
      }
      result.applicable_a = Array.isArray(result.applicable_a) ? result.applicable_a.filter((value) => typeof value === 'string').slice(0, 50) : ['tous'];
      result.catalogDesignation = Boolean(result.catalogDesignation);
      result.assisted = Boolean(result.assisted);
      return result;
    };
    const sections = quote.sections.map((section) => {
      if (!section || typeof section.title !== 'string' || section.title.length > 500 || !Array.isArray(section.items) || section.items.length > 1000 || !Array.isArray(section.equipmentItems || []) || (section.equipmentItems || []).length > 1000) {
        throw new TypeError('Une section de devis est invalide.');
      }
      const safe = {};
      for (const key of ['id', 'title', 'catalogTitle', 'description', 'kind', 'workCategory', 'workCategory', 'mode', 'contingency', 'blockType', 'blockTypeOther', 'blockMethod', 'currentSection', 'saved', 'params']) {
        if (Object.hasOwn(section, key)) safe[key] = section[key];
      }
      safe.catalogTitle = Boolean(section.catalogTitle);
      safe.toConfirm = Array.isArray(section.toConfirm) ? section.toConfirm.filter((item) => typeof item === 'string').slice(0, 100) : [];
      safe.params = section.params && typeof section.params === 'object' && !Array.isArray(section.params)
        ? Object.fromEntries(Object.entries(section.params).filter(([, item]) => typeof item === 'string' || typeof item === 'number'))
        : {};
      safe.items = section.items.map(itemSafe);
      safe.equipmentItems = (section.equipmentItems || []).map((item) => {
        if (!item || typeof item.designation !== 'string' || !['', 'available', 'purchase', 'rent', 'unused'].includes(item.status)) throw new TypeError('Une ligne de matériel est invalide.');
        const equipment = {};
        for (const key of ['designation', 'unit', 'rental_unit', 'applicable_a', 'status', 'quantity', 'duration', 'unitPrice', 'custom']) if (Object.hasOwn(item, key)) equipment[key] = item[key];
        equipment.applicable_a = Array.isArray(equipment.applicable_a) ? equipment.applicable_a.filter((value) => typeof value === 'string').slice(0, 50) : ['tous'];
        return equipment;
      });
      if (!Number.isFinite(Number(safe.contingency)) || Number(safe.contingency) <= 0 || Number(safe.contingency) > 50 || !['equipment', 'concrete', 'masonry', 'other'].includes(safe.kind)) {
        throw new TypeError('Les paramètres d’une section sont invalides.');
      }
      return safe;
    });
    return {
      contributor: Object.fromEntries(['name', 'role', 'otherRole', 'phone', 'dialCode', 'email'].map((key) => [key, contributor[key]])),
      project: Object.fromEntries(['name', 'buildingType', 'buildingTypeOther', 'location', 'notes', 'currency', 'stage'].map((key) => [key, project[key]])),
      quote: { stage: quote.stage, sections, currentSection: Number.isInteger(quote.currentSection) ? Math.max(0, Math.min(quote.currentSection, sections.length - 1)) : 0, saved: Boolean(quote.saved) },
      stageChecks: Array.isArray(value.data.stageChecks) ? value.data.stageChecks.slice(0, 5).filter((entry) => Array.isArray(entry) && typeof entry[0] === 'string' && entry[1] && typeof entry[1] === 'object' && typeof entry[1].stage === 'string' && entry[1].answers && typeof entry[1].answers === 'object').map(([key, check]) => [key, { stage: check.stage, answers: Object.fromEntries(Object.entries(check.answers).filter(([answerKey, answer]) => typeof answerKey === 'string' && ['yes', 'no'].includes(answer))) }]) : [],
      exportLanguage: ['fr','en'].includes(value.data.exportLanguage) ? value.data.exportLanguage : 'fr',
      savedAt: typeof value.data.savedAt === 'string' ? value.data.savedAt : ''
    };
  }

  async function deriveKey(password, salt) {
    if (!globalThis.crypto?.subtle) throw new Error('Le chiffrement sécurisé est indisponible dans ce navigateur ou ce contexte.');
    const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function serialize(data, password = '') {
    const payload = { format: FORMAT, version: VERSION, data };
    if (!password) return JSON.stringify(payload, null, 2);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(payload)));
    return JSON.stringify({
      format: FORMAT,
      version: VERSION,
      encrypted: true,
      kdf: 'PBKDF2-SHA-256',
      iterations: ITERATIONS,
      cipher: 'AES-256-GCM',
      salt: encode64(salt),
      iv: encode64(iv),
      ciphertext: encode64(new Uint8Array(encrypted))
    }, null, 2);
  }

  async function deserialize(text, password = '') {
    if (typeof text !== 'string' || text.length > 20_000_000) throw new TypeError('Fichier vide ou trop volumineux.');
    let value;
    try { value = JSON.parse(text); }
    catch { throw new TypeError('Le fichier ne contient pas un JSON valide.'); }
    if (!value || value.format !== FORMAT || value.version !== VERSION) throw new TypeError('Fichier Quantix BTP invalide ou version non prise en charge.');
    if (!value.encrypted) return validateBackup(value);
    if (value.kdf !== 'PBKDF2-SHA-256' || value.cipher !== 'AES-256-GCM' || value.iterations !== ITERATIONS || !password) {
      throw new TypeError('Saisissez le mot de passe de cette sauvegarde protégée.');
    }
    try {
      const key = await deriveKey(password, decode64(value.salt));
      const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode64(value.iv) }, key, decode64(value.ciphertext));
      return validateBackup(JSON.parse(decoder.decode(plain)));
    } catch {
      throw new Error('Mot de passe incorrect ou fichier protégé endommagé.');
    }
  }

  function download(text, filename) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.QUANTIX_STORAGE = Object.freeze({ serialize, deserialize, download, validateBackup, format: FORMAT, version: VERSION });
})();
