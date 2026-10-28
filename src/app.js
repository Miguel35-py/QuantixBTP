(() => {
  'use strict';

  const app = document.querySelector('#app');
  const avatar = document.querySelector('[data-avatar]');
  const contributorContext = document.querySelector('[data-contributor-context]');
  const contributorName = document.querySelector('[data-contributor-name]');
  const contributorRole = document.querySelector('[data-contributor-role]');
  const contributor = { name: '', role: '', otherRole: '', phone: '', dialCode: '+237', email: '' };
  const project = { name: '', buildingType: '', buildingTypeOther: '', location: '', notes: '', currency: 'XAF', stage: '' };
  let stageCheck = { stage: '', answers: {} };
  const stageChecks = new Map();
  let quote = { stage: '', sections: [], currentSection: 0, saved: false };
  const quotesByStage = new Map();
  let resumeStage = '';
  let detourReturnPending = false;
  let screen = 'home';
  let language = 'fr';
  let darkTheme = false;
  let importText = '';
  let importedBackup = null;
  let saveFeedback = '';
  let pendingHomeImport = false;
  let allowIncompleteQuote = false;
  let demoMode = false;
  let demoConfig = null;
  const storage = window.QUANTIX_STORAGE;
  const exportsApi = window.QUANTIX_EXPORTS;
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  const frenchTitle = document.title;
  const frenchDescription = document.querySelector('meta[name="description"]')?.content || '';

  const english = new Map(Object.entries({
    'Le budget du chantier, en clair.': 'Clear construction budgets.',
    'Quantix BTP — Le budget du chantier, en clair.': 'Quantix BTP — Clear construction budgets',
    'Préparez un devis de gros œuvre, étape par étape, avec Quantix BTP.': 'Prepare a structural work estimate step by step with Quantix BTP.',
    'Illustration d’une maison sur un plan quadrillé': 'Illustration of a house on a grid plan', 'Quantix BTP — Accueil': 'Quantix BTP — Home',
    'Mode local · sans compte': 'Local mode · no account',
    'Progression du devis': 'Estimate progress',
    'Devis de gros œuvre · étape par étape': 'Structural work estimate · step by step',
    'Construire avec un': 'Build with a', 'budget': 'budget', 'plus clair.': 'that is clearer.',
    'Préparez un devis précis, suivez ce qui est déjà réalisé et gardez chaque ressource visible.': 'Prepare a detailed estimate, track completed work and keep every resource visible.',
    'Commencer': 'Get started', 'Importer un devis JSON': 'Import an estimate (JSON)', 'Définissez votre projet': 'Define your project', 'Enregistrer le devis': 'Save estimate', 'Tout marquer « Déjà disponible »': 'Mark all as already available', 'Ajouter un matériel': 'Add equipment', 'Non défini': 'Not set', 'Unité :': 'Unit:', 'Main-d’œuvre': 'Labor', 'Ingénieur': 'Engineer', 'Technicien': 'Technician', 'Ouvrier qualifié': 'Skilled worker', 'Manœuvre': 'Laborer', 'jour-personne': 'person-day', 'Autres travaux / fourniture': 'Other work / supply', 'Structure / armatures': 'Structure / reinforcement', 'Terrassement / couche de forme': 'Earthworks / sub-base', 'Protection / étanchéité': 'Protection / waterproofing', 'Autre fourniture ou prestation': 'Other supply or service', 'Sans compte · conçu pour fonctionner localement': 'No account · designed to work locally',
    'Une estimation explicite': 'A transparent estimate', 'Principes de Quantix BTP': 'Quantix BTP principles',
    'Ressources détaillées': 'Detailed resources', 'Matériaux · main-d’œuvre': 'Materials · labour',
    'Étapes suivies': 'Tracked stages', 'Déjà réalisé = retiré du coût': 'Completed = removed from cost',
    'Sauvegarde réimportable': 'Importable backup', 'Devis JSON local': 'Local JSON estimate',
    'Nouveau devis': 'New estimate', '+ Nouveau devis': '+ New estimate', 'Contributeur': 'Contributor', 'Bâtiment': 'Building', 'Étape': 'Stage', 'Vérification': 'Check', 'Devis': 'Estimate',
    'Demo': 'Demo', 'Exemple illustratif · données fictives': 'Illustrative example · fictional data',
    'Répartition des coûts par matériau': 'Cost breakdown by material', 'Part du total estimatif': 'Share of estimated total',
    'Les imprévus de chaque section sont répartis au prorata entre ses catégories de coût.': 'Each section contingency is allocated proportionally across its cost categories.',
    'Qui prépare ce devis ?': 'Who is preparing this estimate?', 'Ces informations seront reprises dans l’en-tête du devis.': 'This information will appear in the estimate header.',
    'Nom et prénom': 'Full name', 'Fonction': 'Role', 'Facultatif': 'Optional', 'Choisir une fonction': 'Choose a role',
    'Précisez la fonction': 'Specify the role', 'Votre fonction': 'Your role', 'Téléphone': 'Phone', 'Adresse e-mail': 'Email address',
    'Données sur cet appareil': 'Data on this device', 'Aucun compte requis. Les informations sont utilisées localement dans cet appareil.': 'No account required. Information is used locally on this device.',
    'Le numéro est contrôlé selon l’indicatif choisi. L’adresse e-mail est facultative.': 'The number is checked against the selected calling code. Email is optional.',
    'Retour': 'Back', 'Continuer vers le bâtiment': 'Continue to building', 'Continuer vers le choix du bâtiment': 'Continue to building selection', 'Continuer': 'Continue', 'Poursuivre vers le devis': 'Proceed to estimate', 'Continuer vers le contributeur': 'Continue to contributor',
    'Ex. Amina Nguema': 'E.g. Amina Nguema', 'nom@exemple.com': 'name@example.com',
    'Projet': 'Project', 'Quel bâtiment souhaitez-vous chiffrer ?': 'Which building would you like to estimate?',
    'Définissez votre projet': 'Define your project',
    'Nom du chantier': 'Project name', 'Devise': 'Currency', 'Devise utilisée pour les prix de ce devis.': 'Currency used for this estimate.',
    'Localisation du chantier': 'Project location', 'Commentaire sur le chantier': 'Project notes', 'Ville, quartier ou repère': 'City, district or landmark',
    'Une précision utile à conserver': 'A useful note to keep', 'Type de bâtiment': 'Building type', 'Maison': 'House', 'RDC': 'Ground floor',
    'Duplex': 'Duplex', 'Plusieurs niveaux': 'Multiple floors', 'Petit bâtiment commercial': 'Small commercial building',
    'Commerce de proximité': 'Local shop', 'Bâtiment résidentiel': 'Residential building', 'Logements collectifs': 'Multi-unit housing',
    'Établissement scolaire': 'School', 'École / collège': 'School / middle school', 'Bâtiment administratif': 'Administrative building',
    'Bureaux / services': 'Offices / services', 'Entrepôt / bâtiment industriel': 'Warehouse / industrial building',
    'Stockage / activité': 'Storage / industrial use', 'Autre': 'Other', 'Type à préciser': 'Specify type',
    'Précisez le type de bâtiment': 'Specify the building type', 'Modèle de départ': 'Starting template',
    'La structure exacte dépendra des choix et dimensions confirmés pour le projet.': 'The exact structure will depend on the confirmed project choices and dimensions.',
    'Choisir une étape': 'Choose a stage', 'Tout marquer « Déjà disponible »': 'Mark all as already available', 'Choisir une étape de construction': 'Choose a construction stage',
    'Étape à chiffrer': 'Stage to estimate', 'Sur quelle étape porte ce devis ?': 'Which stage does this estimate cover?',
    'Choisissez l’étape des travaux que vous souhaitez estimer.': 'Choose the construction stage you want to estimate.',
    'Fondations et infrastructure': 'Foundations and infrastructure', 'Semelles, radier, longrines': 'Footings, raft, ground beams',
    'Soubassement et plancher bas': 'Substructure and ground floor', 'Murs de soubassement, dallage': 'Substructure walls, floor slab',
    'Élévation du rez-de-chaussée': 'Ground floor structure', 'Murs, poteaux, linteaux': 'Walls, columns, lintels',
    'Plancher et niveaux supérieurs': 'Upper floors and levels', 'Dalles, poutres, escaliers': 'Slabs, beams, stairs',
    'Charpente et couverture': 'Roof structure and covering', 'Structure de toiture, protection': 'Roof structure, weather protection',
    'Vérifier l’étape précédente': 'Check previous stage', 'Avant le devis': 'Before the estimate', 'Vérifions le point de départ.': 'Let’s check the starting point.',
    'Prérequis hors devis': 'Prerequisites excluded from estimate', 'Les études, la préparation générale du terrain et l’installation du chantier ne sont pas chiffrées par Quantix BTP.': 'Studies, general site preparation and site setup are not priced by Quantix BTP.',
    'Ces prérequis sont-ils déjà réalisés ?': 'Have these prerequisites been completed?', 'Indiquez si l’étape précédente a déjà été réalisée.': 'Tell us whether the previous stage has been completed.',
    'Études et plans disponibles': 'Studies and plans available', 'Préparation du terrain terminée': 'General site preparation complete',
    'Installation du chantier réalisée': 'Site setup completed', 'Oui': 'Yes', 'Non': 'No',
    'Souhaitez-vous être dirigé vers le devis de l’étape précédente ?': 'Would you like to open the previous stage estimate?',
    'Aller au devis précédent': 'Open previous estimate', 'Vous pouvez poursuivre. Quantix BTP n’ajoutera pas le coût des prérequis signalés ; prévoyez-les séparément.': 'You can continue. Quantix BTP will not add the reported prerequisite costs; plan for them separately.',
    'Vous pouvez poursuivre. Le devis portera uniquement sur l’étape choisie ; le coût de l’étape précédente n’y sera pas ajouté automatiquement.': 'You can continue. This estimate covers only the selected stage; the previous stage cost will not be added automatically.',
    'Continuer vers le devis': 'Continue to estimate', 'Devis sélectionné :': 'Selected estimate:',
    'Devis détaillé': 'Detailed estimate', 'Détaillez les ressources et les coûts, section par section.': 'Enter resources and costs, section by section.',
    'Liste de contrôle indicative. Adaptez-la aux plans ; les postes non retenus peuvent être supprimés ou laissés sans quantité. Aucun prix ni dosage n’est prérempli.': 'Indicative checklist. Adapt it to the plans; remove unused items or leave quantities blank. No prices or mix ratios are prefilled.',
    'À confirmer pour ce projet': 'To confirm for this project', 'Section': 'Section', 'sur': 'of', 'Nom de la section': 'Section name',
    'Nature des travaux': 'Work type', 'Béton / béton armé': 'Concrete / reinforced concrete', 'Maçonnerie de blocs': 'Block masonry', 'Autre poste': 'Other item',
    'Imprévus de cette section (%)': 'Contingency for this section (%)', 'Calcul assisté': 'Assisted calculation', 'Saisie manuelle': 'Manual entry',
    'Ajouter une ligne manuelle': 'Add a manual line', 'Ajouter une ligne de ressource': 'Add a resource line', 'Ajouter une section': 'Add a section',
    'Unité personnalisée disponible uniquement en saisie manuelle.': 'Custom units are available for manual entry only.',
    'Sous-total de la section': 'Section subtotal', 'Imprévus': 'Contingency', 'Total de la section': 'Section total',
    'Valider le détail': 'Review estimate', 'Synthèse': 'Summary', 'Modifier le devis': 'Edit estimate', 'Continuer vers l’enregistrement': 'Continue to save',
    'Récapitulatif du devis': 'Estimate summary', 'Vérifiez les lignes et les totaux avant l’enregistrement.': 'Review line items and totals before saving.',
    'Donnez un nom à chaque section du devis.': 'Name each estimate section.', 'Le taux d’imprévus doit être supérieur à 0 % et ne pas dépasser 50 %.': 'The contingency rate must be above 0% and no more than 50%.',
    'Choisissez un statut pour chaque équipement applicable.': 'Choose a status for each applicable piece of equipment.', 'Complétez la quantité ou la durée et le prix unitaire de chaque équipement à acheter ou à louer.': 'Enter the quantity or duration and unit price for each item to purchase or rent.',
    'Complétez ou supprimez chaque ligne de ressource commencée.': 'Complete or remove each resource line you started.', 'Ajoutez au moins une ressource chiffrée avec une quantité et un prix unitaire avant de créer la synthèse.': 'Add at least one priced resource with a quantity and unit price before creating the summary.',
    'Exporter le devis': 'Export estimate', 'Les exports de lecture reprennent la langue et les données affichées dans cette estimation.': 'Before exporting a readable copy, download the reimportable JSON backup and confirm that you saved it.',
    'J’ai enregistré la sauvegarde JSON sur mon appareil.': 'I saved the JSON backup on my device.', 'Exporter en CSV': 'Export CSV', 'Exporter en tableur (.xlsx)': 'Export spreadsheet (.xlsx)',
    'Télécharger le PDF': 'Download PDF', 'Les exports CSV, XLSX et PDF sont des fichiers de lecture non chiffrés. Le mot de passe facultatif protège uniquement la sauvegarde JSON.': 'CSV, XLSX and PDF exports are unencrypted readable files. The optional password protects only the JSON backup.',
    'Les formats PDF, CSV et tableur ne sont pas encore disponibles.': 'PDF, CSV and spreadsheet exports are not yet available.',
    'QBT-FLOW-07 · Synthèse': 'QBT-FLOW-07 · Summary', 'QBT-FLOW-08 · Sauvegarde locale': 'QBT-FLOW-08 · Local backup',
    'Total estimatif': 'Estimated total', 'Sous-total': 'Subtotal', 'Total des imprévus': 'Total contingency', 'Aucun coût saisi': 'No costs entered',
    'Enregistrer le devis': 'Save estimate', 'Enregistrement et export': 'Save and export', 'Sauvegardez un fichier JSON réimportable sur votre appareil.': 'Save an importable JSON file to your device.',
    'Protéger le fichier par mot de passe (facultatif)': 'Protect this file with a password (optional)', 'Mot de passe': 'Password',
    'Confirmer le mot de passe': 'Confirm password', 'Télécharger la sauvegarde JSON': 'Download JSON backup', 'Importer une sauvegarde JSON': 'Import a JSON backup',
    'Choisir un fichier JSON': 'Choose a JSON file', 'Enregistrer et télécharger': 'Save and download', 'Le fichier JSON est réimportable dans Quantix BTP.': 'This JSON file can be imported back into Quantix BTP.',
    'Les données restent sur cet appareil. Conservez le fichier téléchargé dans un emplacement sûr.': 'Data stays on this device. Keep the downloaded file somewhere safe.',
    'Les formats PDF, CSV et tableur ne sont pas encore disponibles.': 'PDF, CSV and spreadsheet formats are not available yet.',
    'Appliquer la langue': 'Language', 'Activer le thème sombre': 'Enable dark theme', 'Activer le thème clair': 'Enable light theme',
    'Désignation': 'Description', 'Quantité': 'Quantity', 'Unité': 'Unit', 'Prix unitaire': 'Unit price', 'Calculer les quantités': 'Calculate quantities',
    'Calculer la quantité': 'Calculate quantity', 'Déjà disponible': 'Already available', 'À acheter': 'To purchase', 'À louer': 'To rent',
    'Ne sera pas utilisé': 'Will not be used', 'Choisir': 'Choose', 'Aucun': 'None', 'Aucune': 'None', 'Aucun équipement de cette liste ne s’applique au type de bâtiment choisi.': 'No equipment in this list applies to the selected building type.',
    'Précision technique (facultatif)': 'Technical note (optional)', 'Supprimer cette section': 'Remove this section', 'Supprimer cette ligne': 'Remove this line',
    'Ce détail reste dans la session en cours. L’enregistrement durable et la synthèse seront traités dans leurs étapes dédiées.': 'This detail remains in the current session. Saving and summary are handled in their dedicated steps.',
    'Renseignez la désignation, les quantités, les unités et les prix unitaires.': 'Enter descriptions, quantities, units and unit prices.',
    'Le taux d’imprévus doit être supérieur à 0 % et inférieur ou égal à 50 %.': 'Contingency must be greater than 0% and no more than 50%.',
    'Fichier vide ou trop volumineux.': 'File is empty or too large.', 'Le fichier ne contient pas un JSON valide.': 'The file does not contain valid JSON.',
    'Fichier Quantix BTP invalide ou version non prise en charge.': 'Invalid Quantix BTP file or unsupported version.',
    'La sauvegarde ne contient pas les informations attendues pour un devis.': 'The backup does not contain the expected estimate information.',
    'Le chiffrement sécurisé est indisponible dans ce navigateur ou ce contexte.': 'Secure encryption is unavailable in this browser or context.',
    'Mot de passe incorrect ou fichier protégé endommagé.': 'Incorrect password or damaged protected file.',
    'Saisissez le mot de passe de cette sauvegarde protégée.': 'Enter the password for this protected backup.',
    'Propriétaire': 'Owner', 'Maître d’ouvrage': 'Project owner', 'Ingénieur': 'Engineer', 'Architecte': 'Architect',
    'Conducteur de travaux': 'Site manager', 'Technicien': 'Technician', 'Artisan': 'Tradesperson',
    'FCFA (XAF)': 'CFA franc (XAF)', 'Dollar américain (USD)': 'US dollar (USD)', 'Euro (EUR)': 'Euro (EUR)',
    'Yen japonais (JPY)': 'Japanese yen (JPY)', 'Livre sterling (GBP)': 'Pound sterling (GBP)',
    'Matériel et équipements': 'Tools and equipment', 'Implantation et décapage local de l’emprise': 'Setting out and local removal of topsoil',
    'Fouilles et évacuation des déblais': 'Excavation and spoil removal', 'Béton de propreté (si prévu)': 'Blinding concrete (if specified)',
    'Semelles, puits ou radier (selon plans)': 'Footings, pits or raft (per plans)', 'Longrines (si prévues)': 'Ground beams (if specified)',
    'Murs de soubassement': 'Substructure walls', 'Protection contre l’humidité et drainage (si prévus)': 'Damp protection and drainage (if specified)',
    'Dallage': 'Floor slab', 'Murs, poteaux et chaînages': 'Walls, columns and ring beams', 'Linteaux': 'Lintels',
    'Poutres et dalles en béton armé': 'Reinforced concrete beams and slabs', 'Escaliers en béton armé (si prévus)': 'Reinforced concrete stairs (if specified)',
    'Étaiement et coffrage': 'Shoring and formwork', 'Structure de charpente': 'Roof structure', 'Supports et liteaux': 'Supports and battens',
    'Couverture et évacuation des eaux': 'Roof covering and rainwater drainage',
    'Volume — longueur × largeur × épaisseur': 'Volume — length × width × thickness', 'Surface — longueur × largeur': 'Area — length × width',
    'Longueur': 'Length', 'Nombre d’unités': 'Number of units', 'Type de bloc': 'Block type', 'Mode d’approvisionnement': 'Supply method',
    'Acheté': 'Purchased', 'Fabriqué sur le chantier': 'Made on site', 'Parpaing creux': 'Hollow concrete block',
    'Parpaing plein': 'Solid concrete block', 'Bloc de terre comprimée (BTC)': 'Compressed earth block (CEB)',
    'Ciment': 'Cement', 'Sable': 'Sand', 'Gravier': 'Gravel', 'Eau de gâchage': 'Mixing water',
    'Prix unitaire (': 'Unit price (', 'Quantité calculée': 'Calculated quantity', 'Unité standard': 'Standard unit',
    'Prix de location par ': 'Rental price per ', 'Durée (': 'Duration (', 'Déjà disponible': 'Already available',
    'À acheter': 'To purchase', 'À louer': 'To rent', 'Ne sera pas utilisé': 'Will not be used',
    'Aucun': 'None', 'Aucune': 'None', 'Unité : ': 'Indicative unit: ',
    'Calcul béton': 'Concrete calculation', 'Calcul de maçonnerie': 'Masonry calculation',
    'Renseignez les paramètres et calculez les quantités à partir des plans et du dosage validé.': 'Enter the parameters and calculate quantities from the plans and approved mix design.',
    'Le nombre calculé est une surface nette divisée par la face du bloc, sans joints, pertes, coupes ni réserve. Les matériaux de fabrication utilisent les coefficients saisis.': 'The calculated block count is net wall area divided by block face area, excluding joints, waste, cuts and reserve. Manufacturing materials use the coefficients you enter.',
    'Cette formule calcule une quantité géométrique à partir de vos mesures. Elle ne calcule pas un dosage de matériau ni un dimensionnement structurel.': 'This formula calculates a geometric quantity from your measurements. It does not calculate a material mix design or structural dimensions.',
    'Quantité assistée': 'Assisted quantity', 'Désignation à mesurer': 'Description to measure', 'Méthode de calcul': 'Calculation method',
    'Longueur du mur (m)': 'Wall length (m)', 'Hauteur du mur (m)': 'Wall height (m)', 'Surface des ouvertures à déduire (m²)': 'Area of openings to subtract (m²)',
    'Longueur de face du bloc (m)': 'Block face length (m)', 'Hauteur de face du bloc (m)': 'Block face height (m)',
    'Total estimatif': 'Estimated total', 'Total de la section': 'Section total', 'Les données restent dans cette session sur cet appareil.': 'Data remains in this session on this device.',
    'Langue': 'Language', 'Retour à l’écran précédent': 'Back to previous screen',
    'Saisissez le nom et le prénom du contributeur.': 'Enter the contributor’s full name.',
    'Choisissez la fonction du contributeur.': 'Choose the contributor’s role.',
    'Saisissez une adresse e-mail valide en minuscules (ex. nom@exemple.com).': 'Enter a valid lowercase email address (e.g. name@example.com).',
    'Choisissez un type de bâtiment.': 'Choose a building type.', 'Précisez le type de bâtiment.': 'Specify the building type.',
    'Sélectionnez une étape à chiffrer.': 'Select a stage to estimate.', 'Répondez à chaque question pour continuer.': 'Answer each question to continue.',
    'Indiquez si vous souhaitez ouvrir le devis de l’étape précédente.': 'Choose whether to open the previous stage estimate.',
    'Ajoutez au moins un coût en renseignant une quantité et un prix, et choisissez un statut pour chaque équipement applicable.': 'Add at least one cost by entering a quantity and price, and choose a status for each applicable equipment item.',
    'Complétez les lignes utilisées, les statuts d’équipement et les imprévus (supérieurs à 0 % et au maximum 50 %).': 'Complete used line items, equipment statuses and contingency rates (above 0% and no more than 50%).',
    'Saisissez un mot de passe pour protéger le fichier.': 'Enter a password to protect the file.',
    'Les mots de passe ne correspondent pas.': 'The passwords do not match.',
    'Confirmez le remplacement de la session avant l’import.': 'Confirm replacing the current session before importing.',
    'La sauvegarde JSON a été préparée pour téléchargement.': 'The JSON backup is ready to download.',
    'Les quantités sont calculées à partir des dimensions et coefficients renseignés.': 'Quantities are calculated from the dimensions and coefficients you enter.',
    'Saisissez chaque matériau, quantité, unité et prix unitaire. Les lignes non retenues peuvent rester vides ou être supprimées.': 'Enter each material, quantity, unit and unit price. Unused lines can be left blank or removed.',
    'Pour chaque équipement, indiquez s’il est déjà disponible, à acheter, à louer ou non utilisé.': 'For each equipment item, indicate whether it is available, to purchase, to rent or not used.',
    'Précisez le type et ses dimensions': 'Specify the type and dimensions',
    'Pelles, pioches et houes': 'Shovels, picks and hoes', 'Brouettes': 'Wheelbarrows', 'Seaux et récipients gradués': 'Buckets and graduated containers',
    'Truelles et taloches': 'Trowels and floats', 'Mètre ruban et décamètre': 'Tape measure and long tape',
    'Cordeaux, piquets et chaises d’implantation': 'Lines, stakes and setting-out profiles', 'Niveau à bulle ou niveau optique': 'Spirit level or optical level',
    'Bétonnière': 'Concrete mixer', 'Aiguille vibrante': 'Concrete vibrator', 'Étais et matériel de coffrage': 'Props and formwork equipment',
    'Échafaudage ou plateformes de travail': 'Scaffolding or work platforms', 'Eau de chantier et dispositif de stockage': 'Site water and storage equipment',
    'Alimentation électrique ou groupe électrogène': 'Power supply or generator', 'Engin de terrassement et évacuation': 'Earthmoving and removal equipment',
    'Équipements de protection individuelle': 'Personal protective equipment', 'Piquets d’implantation': 'Setting-out stakes', 'Cordeaux': 'Setting-out lines',
    'Chaux ou poudre de traçage': 'Lime or marking powder', 'Pointes ordinaires': 'Common nails', 'Bois pour chaises d’implantation': 'Timber for setting-out profiles',
    'Carburant pour engin affecté à cette phase': 'Fuel for equipment used in this stage', 'Carburant d’engin de fouille': 'Excavator fuel',
    'Lubrifiant d’engin': 'Equipment lubricant', 'Transport des déblais (unité de chantier à préciser)': 'Spoil transport (site unit to specify)',
    'Matériaux de blindage provisoire si nécessaire': 'Temporary shoring materials, if required', 'Pompage et évacuation d’eau si nécessaire': 'Water pumping and removal, if required',
    'Film de protection ou polyane si prévu': 'Protective sheet or polythene film, if specified',
    'Ciment pour béton de fondation': 'Cement for foundation concrete', 'Sable pour béton de fondation': 'Sand for foundation concrete',
    'Gravier pour béton de fondation': 'Gravel for foundation concrete', 'Barres d’acier à béton (diamètres selon plans)': 'Reinforcing steel bars (diameters per plans)',
    'Fil d’attache recuit': 'Annealed tying wire', 'Cales d’enrobage': 'Concrete cover spacers', 'Planches de coffrage': 'Formwork boards',
    'Chevrons / madriers de coffrage': 'Formwork battens / timber', 'Pointes de coffrage': 'Formwork nails', 'Huile de décoffrage': 'Form-release oil',
    'Produit de cure du béton si prévu': 'Concrete curing compound, if specified', 'Ciment pour béton de longrine': 'Cement for ground-beam concrete',
    'Sable pour béton de longrine': 'Sand for ground-beam concrete', 'Gravier pour béton de longrine': 'Gravel for ground-beam concrete',
    'Bois de coffrage': 'Formwork timber', 'Pointes': 'Nails', 'Produit de cure si prévu': 'Curing compound, if specified',
    'Niveau et règle de maçon': 'Level and mason’s straightedge', 'Dame ou compacteur': 'Hand rammer or compactor', 'Eau de chantier et stockage': 'Site water and storage',
    'Blocs / parpaings (type à choisir)': 'Blocks (type to choose)', 'Ciment de mortier': 'Mortar cement', 'Sable de mortier': 'Mortar sand',
    'Ciment par bloc fabriqué sur chantier': 'Cement per block made on site', 'Sable par bloc fabriqué sur chantier': 'Sand per block made on site',
    'Eau par bloc fabriqué sur chantier': 'Water per block made on site', 'Ciment de béton de remplissage si prévu': 'Infill concrete cement, if specified',
    'Sable de béton si prévu': 'Concrete sand, if specified', 'Gravier de béton si prévu': 'Concrete gravel, if specified',
    'Eau de béton si prévu': 'Concrete water, if specified', 'Barres d’acier selon plans': 'Reinforcing bars per plans', 'Fil d’attache': 'Tying wire',
    'Ciment pour forme ou protection minérale': 'Cement for screed or mineral protection', 'Gravier drainant': 'Drainage gravel', 'Eau': 'Water',
    'Membrane ou film d’étanchéité (nature à confirmer)': 'Waterproofing membrane or film (type to confirm)', 'Granulats filtrants': 'Filter aggregates',
    'Tuyau de drainage (produit manufacturé à confirmer)': 'Drainage pipe (manufactured product to confirm)', 'Matériau de remblai sélectionné': 'Selected backfill material',
    'Sable de réglage': 'Bedding sand', 'Granulats de couche de forme': 'Sub-base aggregates', 'Eau de compactage': 'Compaction water',
    'Carburant de compacteur': 'Compactor fuel', 'Film polyane si prévu': 'Polythene sheet, if specified', 'Ciment pour dalle': 'Slab cement',
    'Sable pour dalle': 'Slab sand', 'Gravier pour dalle': 'Slab gravel', 'Treillis ou barres d’acier selon plans': 'Mesh or reinforcing bars per plans',
    'Bois de coffrage périphérique': 'Perimeter formwork timber', 'Matériau de joint si prévu': 'Joint material, if specified',
    'Ciment pour béton de dallage': 'Floor-slab concrete cement', 'Sable pour béton de dallage': 'Floor-slab concrete sand',
    'Gravier pour béton de dallage': 'Floor-slab concrete gravel', 'Armatures selon plans': 'Reinforcement per plans', 'Produit de cure': 'Curing compound',
    'Matériau de joint de dallage (nature à confirmer)': 'Floor-slab joint material (type to confirm)', 'Truelles, taloches et platoirs': 'Trowels, floats and finishing tools',
    'Pelles et brouettes': 'Shovels and wheelbarrows', 'Seaux gradués': 'Graduated buckets', 'Niveau, fil à plomb et règle': 'Level, plumb line and straightedge',
    'Cordeaux et mètre ruban': 'Setting-out lines and tape measure', 'Étais et coffrage': 'Props and formwork', 'Échafaudage / plateformes de travail': 'Scaffolding / work platforms',
    'Coupe-blocs ou meuleuse': 'Block cutter or angle grinder', 'Blocs / parpaings (creux, plein, BTC ou autre)': 'Blocks (hollow, solid, CEB or other)',
    'Barres d’acier de liaison selon plans': 'Steel connecting bars per plans', 'Ciment pour béton': 'Cement for concrete', 'Sable pour béton': 'Sand for concrete',
    'Gravier pour béton': 'Gravel for concrete', 'Barres d’acier (diamètres et longueurs selon plans)': 'Steel bars (diameters and lengths per plans)',
    'Pelles, brouettes et seaux': 'Shovels, wheelbarrows and buckets', 'Niveau, règle et mètre ruban': 'Level, straightedge and tape measure',
    'Coffrage de dalle et accessoires': 'Slab formwork and accessories', 'Étais et tours d’étaiement': 'Props and shoring towers',
    'Échafaudage / plateformes': 'Scaffolding / platforms', 'Moyen de levage ou transport vertical': 'Lifting or vertical transport equipment',
    'Équipements de protection contre les chutes': 'Fall-protection equipment', 'Chevrons et madriers': 'Battens and timber',
    'Panneaux de coffrage (nature à confirmer)': 'Formwork panels (type to confirm)', 'Étais / tours d’étaiement': 'Props / shoring towers',
    'Cales et accessoires de réglage': 'Spacers and adjustment accessories', 'Barres d’acier (diamètres selon plans)': 'Steel bars (diameters per plans)',
    'Treillis soudé si prévu (produit manufacturé à confirmer)': 'Welded mesh, if specified (manufactured product to confirm)',
    'Carburant du moyen de levage': 'Fuel for lifting equipment', 'Mètre ruban, équerre et cordeau': 'Tape measure, square and chalk line',
    'Scies et outils de coupe': 'Saws and cutting tools', 'Perceuse et visseuse': 'Drill and driver', 'Marteaux et pinces': 'Hammers and pliers',
    'Échelles et échafaudages': 'Ladders and scaffolding', 'Moyen de levage ou manutention': 'Lifting or handling equipment',
    'Eau de chantier et nettoyage': 'Site water and cleaning', 'Bois de charpente (essence et sections selon plans)': 'Roof timber (species and sections per plans)',
    'Éléments métalliques de charpente (profils selon plans)': 'Metal roof members (profiles per plans)',
    'Connecteurs et sabots (produits manufacturés à confirmer)': 'Connectors and joist hangers (manufactured products to confirm)',
    'Boulons et rondelles': 'Bolts and washers', 'Pointes et clous de charpente': 'Roofing nails', 'Vis de fixation': 'Fixing screws',
    'Produit de traitement du bois si prévu': 'Wood treatment, if specified', 'Peinture ou protection anticorrosion si prévue': 'Paint or corrosion protection, if specified',
    'Liteaux ou tasseaux (sections selon plans)': 'Battens or laths (sections per plans)', 'Chevrons ou pannes complémentaires': 'Additional rafters or purlins',
    'Pointes ou vis de fixation': 'Fixing nails or screws', 'Écran ou film sous-toiture (produit manufacturé à confirmer)': 'Roof underlay or membrane (manufactured product to confirm)',
    'Tôles ou éléments de couverture (produit fini à confirmer)': 'Roof sheets or covering elements (finished product to confirm)',
    'Faîtières, rives et closoirs (produits finis à confirmer)': 'Ridge caps, edges and closures (finished products to confirm)',
    'Vis ou pointes de fixation avec accessoires': 'Fixing screws or nails with accessories',
    'Solins et bandes de raccord (produits manufacturés à confirmer)': 'Flashings and joint strips (manufactured products to confirm)',
    'Gouttières et descentes (produits finis à confirmer)': 'Gutters and downpipes (finished products to confirm)',
    'Accessoires de collecte et fixation': 'Drainage and fixing accessories',
    'Implantation des ouvrages et enlèvement des terres impropres dans l’emprise immédiate des fondations. La préparation générale du site reste hors devis.': 'Set out the works and remove unsuitable soil within the immediate foundation footprint. General site preparation remains outside this estimate.',
    'Fouilles aux dimensions indiquées par les plans et gestion des déblais propres aux fondations. Les dimensions et la destination des terres sont à définir pour le chantier.': 'Excavate to the dimensions shown on the plans and manage foundation spoil. Define the dimensions and spoil destination for the site.',
    'Couche de propreté sous les fondations lorsque les plans ou le mode opératoire la prévoient. Les quantités de ciment, sable, gravier et eau sont renseignées séparément, selon le dosage retenu.': 'Blinding layer beneath foundations where shown on the plans or method statement. Enter cement, sand, gravel and water separately using the selected mix design.',
    'Chiffrer uniquement le système de fondation retenu dans les plans. Semelles, puits et radier sont des variantes à confirmer et ne doivent pas être cumulés sans justification.': 'Estimate only the foundation system selected in the plans. Footings, pits and raft foundations are alternatives to confirm and should not be combined without justification.',
    'Éléments de liaison chiffrés séparément des semelles ou du radier. Section, armatures et ancrages proviennent exclusivement des plans validés.': 'Price connecting members separately from footings or the raft. Sections, reinforcement and anchorage must come from approved plans.',
    'Élévation des murs de soubassement selon le système prévu aux plans. Les blocs achetés ou fabriqués sont chiffrés selon le mode retenu ; béton et armatures ne sont pas présumés.': 'Build substructure walls according to the system shown on the plans. Price purchased or site-made blocks according to the selected method; concrete and reinforcement are not assumed.',
    'Dispositifs contre les remontées d’humidité et évacuation des eaux au droit du soubassement lorsque les plans ou prescriptions les prévoient.': 'Damp-proofing and water drainage at the substructure where required by the plans or specifications.',
    'Apport, mise en place et compactage des matériaux sous le plancher bas. Origine et nature des matériaux doivent être renseignées sans assimiler automatiquement les déblais au matériau de remblai.': 'Supply, place and compact material beneath the ground floor. Specify its source and type; excavated spoil is not automatically treated as suitable backfill.',
    'Couches et dalle du plancher bas selon les plans. L’armature, le béton, les joints et les protections ne sont inclus que s’ils sont prévus.': 'Ground-floor layers and slab as shown on the plans. Include reinforcement, concrete, joints and protection only where specified.',
    'Complément de chiffrage pour un dallage soumis à un usage industriel lorsque les plans le prévoient. Les charges, épaisseurs, joints, armatures et spécifications du béton doivent venir des documents validés.': 'Additional estimate for an industrial floor slab where shown on the plans. Loads, thickness, joints, reinforcement and concrete specifications must come from approved documents.',
    'Maçonnerie des murs suivant les plans et le type de bloc choisi. Le choix acheté/fabriqué ouvre le chiffrage correspondant ; aucune résistance ou dimension de bloc n’est présumée.': 'Wall masonry according to the plans and selected block type. The purchased/site-made choice determines the relevant estimate; block strength or dimensions are not assumed.',
    'Éléments en béton armé détaillés selon les plans d’exécution. Les sections, armatures, ancrages et espacements ne sont pas calculés par l’application.': 'Reinforced-concrete members are listed according to the construction drawings. The application does not calculate sections, reinforcement, anchorage or spacing.',
    'Linteaux et appuis au-dessus ou au droit des ouvertures, selon les détails du projet. Les dimensions et armatures sont reprises des plans.': 'Lintels and sills above or beside openings, according to project details. Dimensions and reinforcement are taken from the plans.',
    'Matériaux de coffrage et d’étaiement pour les ouvrages prévus aux plans. Les éléments réutilisables peuvent relever du matériel disponible ou de la location plutôt que d’une consommation intégrale.': 'Formwork and shoring materials for the works shown on the plans. Reusable items may be available equipment or rentals rather than fully consumed materials.',
    'Béton et armatures des ouvrages horizontaux prévus par les plans. Les dimensions, le ferraillage, le phasage et les éventuelles reprises sont à relever sur les documents validés.': 'Concrete and reinforcement for horizontal members shown on the plans. Take dimensions, reinforcement, sequencing and any construction joints from approved documents.',
    'Escaliers et paliers en béton armé uniquement lorsqu’ils appartiennent à cette étape et figurent aux plans. La géométrie et les armatures ne sont jamais déduites du type de bâtiment.': 'Include reinforced-concrete stairs and landings only when they belong to this stage and appear on the plans. Geometry and reinforcement are never inferred from the building type.',
    'Éléments de charpente et assemblages suivant la conception retenue. Le matériau (bois, acier ou autre), les sections et les assemblages proviennent des plans ; aucun dimensionnement n’est effectué.': 'Roof members and connections follow the selected design. Material (timber, steel or other), sections and connections come from the plans; no structural sizing is performed.',
    'Supports de couverture et pièces secondaires selon le matériau et le calepinage prévu. Leur espacement et leur section ne sont pas calculés par l’application.': 'Roof supports and secondary members follow the selected material and layout. The application does not calculate their spacing or sections.',
    'Éléments de couverture et d’évacuation de l’eau selon la solution choisie aux plans. Les tôles, tuiles, faîtières et gouttières sont des produits finis/manufacturés : leur statut est à confirmer avec l’utilisateur.': 'Roof covering and rainwater drainage follow the solution shown on the plans. Sheets, tiles, ridge caps and gutters are finished/manufactured products; confirm their inclusion with the user.',
    'Nature et classe du sol, profondeur et dimensions des fondations selon étude et plans.': 'Soil type and class, foundation depth and dimensions must follow the geotechnical study and plans.',
    'Radier, puits et semelles sont des solutions alternatives selon conception ; ne pas les chiffrer ensemble par défaut.': 'Raft, pit and footing foundations are design alternatives; do not estimate them together by default.',
    'Le transport des déblais et le délimitation entre décapage général exclu et fouille de fondation restent à préciser.': 'Clarify spoil transport and the boundary between excluded general stripping and foundation excavation.',
    'Aciers, bois et produits de cure sont des fournitures manufacturées nécessaires au chantier ; confirmer le niveau de détail attendu pour ces fournitures.': 'Steel, timber and curing compounds are manufactured supplies needed on site; confirm the required level of detail for these items.',
    'La nature du plancher bas (terre-plein, plancher porté ou autre) est déterminée par les plans.': 'The ground-floor type (slab on grade, suspended floor or other) is determined by the plans.',
    'Membranes, drains, treillis et matériaux de joint sont des produits ou assemblages manufacturés : leur inclusion doit être confirmée avec le niveau de détail voulu.': 'Membranes, drains, mesh and joint materials are manufactured products or assemblies; confirm whether they are included and at what level of detail.',
    'Éviter de compter une seconde fois les déblais déjà chiffrés en fondations.': 'Avoid counting spoil already included in the foundation estimate a second time.',
    'Les ouvertures, chaînages, poteaux et linteaux varient selon les plans ; ne pas supposer leurs dimensions ni leur présence.': 'Openings, ring beams, columns and lintels vary by project; do not assume their dimensions or presence.',
    'Portes, fenêtres, blocs préfabriqués spécifiques et autres produits finis ne sont pas des lignes de matières premières dans ce catalogue.': 'Doors, windows, special prefabricated blocks and other finished products are not raw-material line items in this catalogue.',
    'Définir si l’enduit ou les finitions hors gros œuvre sont à exclure du devis de cette étape.': 'Confirm whether plaster and finishes outside the structural work are excluded from this stage estimate.',
    'La présente étape ne comprend pas implicitement l’élévation des murs des niveaux supérieurs, absente de la liste des cinq étapes de la maquette.': 'This stage does not implicitly include upper-floor wall construction, which is absent from the five stages in the mockup.',
    'Les systèmes à poutrelles-hourdis ou composants préfabriqués doivent être confirmés séparément comme produits manufacturés, exclus du catalogue de matières premières.': 'Beam-and-block floor systems and prefabricated components must be confirmed separately as manufactured products, outside the raw-material catalogue.',
    'Le matériel réutilisable et les consommables doivent être distingués selon le statut d’achat/location/disponibilité.': 'Distinguish reusable equipment from consumables using the purchase/rental/available status.',
    'Le type de toiture, la pente, les portées et le matériau de couverture sont décidés par les plans et les choix du projet.': 'Roof type, pitch, spans and covering material are determined by the plans and project choices.',
    'Tôles, tuiles, connecteurs, écrans, faîtières, solins et gouttières sont isolés comme fournitures manufacturées/produits finis à confirmer ; le filtre “matières premières seulement” peut conduire à les exclure.': 'Sheets, tiles, connectors, membranes, ridge caps, flashings and gutters are listed as manufactured/finished products to confirm; a raw-material-only scope may exclude them.',
    'Les sections de bois/profils, fixations et protections sont à déterminer d’après les plans et la spécification du matériau.': 'Timber/metal sections, fixings and protective treatments must be determined from the plans and material specification.',
    'Eau de chantier et stockage': 'Site water and storage', 'Échafaudage / plateformes de travail': 'Scaffolding / work platforms',
    'Brouettes': 'Wheelbarrows', 'Seaux et récipients gradués': 'Buckets and graduated containers', 'Mètre ruban et décamètre': 'Tape measure and long tape',
    'Niveau à bulle ou niveau optique': 'Spirit level or optical level', 'Aiguille vibrante': 'Concrete vibrator', 'Étais et matériel de coffrage': 'Props and formwork equipment',
    'Eau de chantier et dispositif de stockage': 'Site water and storage equipment', 'Engin de terrassement et évacuation': 'Earthmoving and spoil removal equipment',
    'Piquets d’implantation': 'Setting-out stakes', 'Cordeaux': 'Setting-out lines', 'Pointes ordinaires': 'Common nails',
    'Bois pour chaises d’implantation': 'Timber for setting-out profiles', 'Carburant d’engin de fouille': 'Excavator fuel',
    'Transport des déblais (unité de chantier à préciser)': 'Spoil transport (site unit to specify)', 'Pompage et évacuation d’eau si nécessaire': 'Water pumping and removal, if needed',
    'Béton de propreté (si prévu)': 'Blinding concrete (if specified)', 'Sable': 'Sand', 'Gravier': 'Gravel', 'Eau de gâchage': 'Mixing water',
    'Sable pour béton de fondation': 'Sand for foundation concrete', 'Barres d’acier à béton (diamètres selon plans)': 'Reinforcing bars (diameters per plans)',
    'Cales d’enrobage': 'Concrete cover spacers', 'Planches de coffrage': 'Formwork boards', 'Pointes de coffrage': 'Formwork nails',
    'Huile de décoffrage': 'Form-release oil', 'Longrines (si prévues)': 'Ground beams (if specified)', 'Ciment pour béton de longrine': 'Cement for ground-beam concrete',
    'Gravier pour béton de longrine': 'Gravel for ground-beam concrete', 'Pointes': 'Nails', 'Produit de cure si prévu': 'Curing compound, if specified',
    'Dame ou compacteur': 'Hand rammer or compactor', 'Ciment de mortier': 'Mortar cement', 'Sable de mortier': 'Mortar sand',
    'Sable par bloc fabriqué sur chantier': 'Sand per block made on site', 'Ciment de béton de remplissage si prévu': 'Infill concrete cement, if specified',
    'Gravier de béton si prévu': 'Concrete gravel, if specified', 'Barres d’acier selon plans': 'Reinforcing bars per plans', 'Fil d’attache': 'Tying wire',
    'Protection contre l’humidité et drainage (si prévus)': 'Damp protection and drainage (if specified)', 'Gravier drainant': 'Drainage gravel', 'Eau': 'Water',
    'Granulats filtrants': 'Filter aggregates', 'Remblai intérieur et couche de forme': 'Internal backfill and sub-base',
    'Matériau de remblai sélectionné': 'Selected backfill material', 'Granulats de couche de forme': 'Sub-base aggregates', 'Eau de compactage': 'Compaction water',
    'Dallage et plancher bas': 'Floor slab and ground floor', 'Film polyane si prévu': 'Polythene sheet, if specified', 'Ciment pour dalle': 'Slab cement',
    'Gravier pour dalle': 'Slab gravel', 'Treillis ou barres d’acier selon plans': 'Mesh or reinforcing bars per plans', 'Matériau de joint si prévu': 'Joint material, if specified',
    'Dallage pour usage industriel (si prévu)': 'Industrial-use floor slab (if specified)', 'Sable pour béton de dallage': 'Sand for floor-slab concrete',
    'Armatures selon plans': 'Reinforcement per plans', 'Produit de cure': 'Curing compound', 'Truelles, taloches et platoirs': 'Trowels, floats and finishing tools',
    'Seaux gradués': 'Graduated buckets', 'Niveau, fil à plomb et règle': 'Level, plumb line and straightedge', 'Étais et coffrage': 'Props and formwork',
    'Murs et maçonnerie': 'Walls and masonry', 'Blocs / parpaings (creux, plein, BTC ou autre)': 'Blocks (hollow, solid, CEB or other)',
    'Poteaux, chaînages et raidisseurs (selon plans)': 'Columns, ring beams and stiffeners (per plans)', 'Ciment pour béton': 'Cement for concrete',
    'Sable pour béton': 'Sand for concrete', 'Barres d’acier (diamètres et longueurs selon plans)': 'Steel bars (diameters and lengths per plans)',
    'Linteaux et appuis (selon plans)': 'Lintels and sills (per plans)', 'Niveau, règle et mètre ruban': 'Level, straightedge and tape measure',
    'Étais et tours d’étaiement': 'Props and shoring towers', 'Moyen de levage ou transport vertical': 'Lifting or vertical transport equipment',
    'Chevrons et madriers': 'Battens and timber', 'Étais / tours d’étaiement': 'Props / shoring towers', 'Barres d’acier (diamètres selon plans)': 'Steel bars (diameters per plans)',
    'Escaliers en béton armé (si prévus)': 'Reinforced concrete stairs (if specified)', 'Mètre ruban, équerre et cordeau': 'Tape measure, square and chalk line',
    'Perceuse et visseuse': 'Drill and driver', 'Marteaux et pinces': 'Hammers and pliers', 'Moyen de levage ou manutention': 'Lifting or handling equipment',
    'Structure de charpente': 'Roof structure', 'Bois de charpente (essence et sections selon plans)': 'Roof timber (species and sections per plans)',
    'Pointes et clous de charpente': 'Roofing nails', 'Vis de fixation': 'Fixing screws', 'Peinture ou protection anticorrosion si prévue': 'Paint or corrosion protection, if specified',
    'Supports et liteaux': 'Roof supports and battens', 'Chevrons ou pannes complémentaires': 'Additional rafters or purlins',
    'Écran ou film sous-toiture (produit manufacturé à confirmer)': 'Roof underlay or membrane (manufactured product to confirm)',
    'Longueur (m)': 'Length (m)', 'Largeur (m)': 'Width (m)', 'Épaisseur (m)': 'Thickness (m)', 'Largeur / hauteur (m)': 'Width / height (m)',
    'Épaisseur / hauteur (m)': 'Thickness / height (m)', 'Nombre d’unités': 'Number of units',
    'Dosage du béton validé pour ce projet': 'Approved concrete mix design for this project',
    'Renseignez les quantités de composants par m³ selon les plans ou le dosage retenu. Aucun dosage n’est prérempli.': 'Enter component quantities per m³ according to the plans or selected mix design. No mix design is prefilled.',
    'Ciment (kg/m³)': 'Cement (kg/m³)', 'Sable (m³/m³)': 'Sand (m³/m³)', 'Gravier (m³/m³)': 'Gravel (m³/m³)', 'Eau (L/m³)': 'Water (L/m³)',
    'Masse d’un sac de ciment (kg), si l’unité « sac » est choisie': 'Cement bag mass (kg), if the bag unit is selected',
    'À renseigner pour convertir en sacs': 'Enter a value to convert to bags',
    'Le calcul porte sur les dimensions et coefficients saisis, sans marge de perte. Il ne dimensionne pas l’ouvrage et ne choisit pas le dosage.': 'The calculation uses the dimensions and coefficients you enter, with no waste allowance. It does not size the structure or choose the mix design.',
    'Ciment par bloc fabriqué (kg)': 'Cement per block made on site (kg)', 'Sable par bloc fabriqué (m³)': 'Sand per block made on site (m³)',
    'Eau par bloc fabriqué (L)': 'Water per block made on site (L)', 'Longueur du mur (m)': 'Wall length (m)', 'Hauteur du mur (m)': 'Wall height (m)',
    'Surface des ouvertures à déduire (m²)': 'Area of openings to subtract (m²)', 'Longueur de face du bloc (m)': 'Block face length (m)',
    'Hauteur de face du bloc (m)': 'Block face height (m)',
    'Type de bloc': 'Block type', 'Mode d’approvisionnement': 'Supply method', 'Acheté': 'Purchased', 'Fabriqué sur le chantier': 'Made on site',
    'Choisir un type': 'Choose a type', 'Précisez le type et ses dimensions': 'Specify the type and dimensions', 'Type de bloc et format': 'Block type and size',
    'Désignation à mesurer': 'Description to measure', 'Méthode de calcul': 'Calculation method',
    'Volume — longueur × largeur × hauteur': 'Volume — length × width × height', 'Surface — longueur × largeur': 'Area — length × width',
    'Cette formule calcule une quantité géométrique à partir de vos mesures. Elle ne calcule pas un dosage de matériau ni un dimensionnement structurel.': 'This formula calculates a geometric quantity from your measurements. It does not calculate a material mix design or structural dimensions.',
    'Le nombre calculé est une surface nette divisée par la face du bloc, sans joints, pertes, coupes ni réserve. Les matériaux de fabrication utilisent les coefficients saisis.': 'The block count is net wall area divided by block face area, excluding joints, waste, cuts and reserve. Manufacturing materials use the coefficients you enter.',
    'Unité personnalisée disponible uniquement en saisie manuelle.': 'Custom units are available for manual entry only.',
    'Choisissez un mot de passe robuste ; sans lui, le fichier ne pourra pas être déverrouillé.': 'Choose a strong password; without it, the file cannot be unlocked.',
    'Les formats PDF, CSV et tableur ne sont pas encore disponibles.': 'PDF, CSV and spreadsheet formats are not available yet.',
    'Ex. Maison familiale': 'E.g. Family home', 'Ex. Ciment, sable, fer à béton': 'E.g. Cement, sand, reinforcing steel',
    'Ex. béton de propreté': 'E.g. blinding concrete', 'À confirmer pour ce projet': 'To confirm for this project', 'Fichier Quantix BTP invalide ou version non prise en charge.': 'Invalid Quantix BTP file or unsupported version.', 'La sauvegarde ne contient pas les informations attendues pour un devis.': 'The backup is missing required estimate information.', 'Une ligne du devis est invalide.': 'An estimate line is invalid.', 'Une désignation de ligne est invalide.': 'A line description is invalid.', 'Une valeur de ligne est invalide.': 'A line value is invalid.', 'Une section de devis est invalide.': 'An estimate section is invalid.', 'Une ligne de matériel est invalide.': 'An equipment line is invalid.', 'Les paramètres d’une section sont invalides.': 'Section settings are invalid.', 'Fichier vide ou trop volumineux.': 'The file is empty or too large.', 'Le fichier ne contient pas un JSON valide.': 'The file does not contain valid JSON.', 'Saisissez le mot de passe de cette sauvegarde protégée.': 'Enter the password for this protected backup.', 'Mot de passe incorrect ou fichier protégé endommagé.': 'Incorrect password or damaged protected file.', 'Le chiffrement sécurisé est indisponible dans ce navigateur ou ce contexte.': 'Secure encryption is unavailable in this browser or context.', 'Confirmez le remplacement de la session avant l’import.': 'Confirm replacing the session before importing.', 'Saisissez un mot de passe pour protéger le fichier.': 'Enter a password to protect this file.', 'Les mots de passe ne correspondent pas.': 'The passwords do not match.', 'Le numéro de téléphone est invalide pour cet indicatif.': 'The phone number is invalid for this calling code.', 'Répondez à chaque question pour continuer.': 'Answer each question to continue.', 'Sélectionnez une étape à chiffrer.': 'Select a stage to estimate.', 'Donnez un nom à chaque section du devis.': 'Name each estimate section.', 'Le taux d’imprévus doit être supérieur à 0 % et ne pas dépasser 50 %.': 'The contingency rate must be greater than 0% and no more than 50%.', 'Complétez ou supprimez chaque ligne de ressource commencée.': 'Complete or delete every resource line you started.', 'Ajoutez au moins une ressource chiffrée avec une quantité et un prix unitaire avant de créer la synthèse.': 'Add at least one priced resource with a quantity and unit price before creating the summary.', 'Choisissez un statut pour chaque équipement applicable.': 'Choose a status for each applicable piece of equipment.', 'Complétez la quantité ou la durée et le prix unitaire de chaque équipement à acheter ou à louer.': 'Enter the quantity or duration and unit price for each item to purchase or rent.', 'Pelle': 'Shovel', 'Pioche': 'Pickaxe', 'Houe': 'Hoe', 'Seau': 'Bucket', 'Récipient gradué': 'Graduated container', 'Truelle': 'Trowel', 'Taloche': 'Float', 'Platoir': 'Finishing trowel', 'Mètre ruban': 'Tape measure', 'Décamètre': 'Decameter tape', 'Cordeau': 'String line', 'Piquet d’implantation': 'Setting-out stake', 'Chaise d’implantation': 'Setting-out profile board', 'Niveau à bulle': 'Spirit level', 'Niveau optique': 'Optical level', 'Niveau de maçon': 'Mason’s level', 'Niveau': 'Level', 'Règle de maçon': 'Mason’s straightedge', 'Règle': 'Straightedge', 'Fil à plomb': 'Plumb bob', 'Dame manuelle': 'Hand tamper', 'Compacteur': 'Compactor', 'Étais': 'Props', 'Matériel de coffrage': 'Formwork equipment', 'Tours d’étaiement': 'Shoring towers', 'Échafaudage': 'Scaffolding', 'Plateforme de travail': 'Work platform', 'Approvisionnement en eau de chantier': 'Site water supply', 'Dispositif de stockage d’eau': 'Water storage equipment', 'Alimentation électrique': 'Electrical supply', 'Groupe électrogène': 'Generator', 'Engin de terrassement': 'Earthmoving equipment', 'Véhicule d’évacuation': 'Debris haulage vehicle', 'Casque de protection': 'Safety helmet', 'Gants de protection': 'Protective gloves', 'Lunettes de protection': 'Safety glasses', 'Chaussures de sécurité': 'Safety footwear', 'Gilet de haute visibilité': 'High-visibility vest', 'Harnais antichute': 'Fall-arrest harness', 'Longe antichute': 'Fall-arrest lanyard', 'Garde-corps provisoire': 'Temporary guardrail', 'Moyen de levage': 'Lifting equipment', 'Moyen de transport vertical': 'Vertical transport equipment', 'Coupe-blocs': 'Block cutter', 'Meuleuse': 'Angle grinder', 'Équerre': 'Try square', 'Scie': 'Saw', 'Outil de coupe': 'Cutting tool', 'Perceuse': 'Drill', 'Visseuse': 'Screwdriver', 'Marteau': 'Hammer', 'Pince': 'Pliers', 'Matériel de manutention': 'Material handling equipment', 'Matériel de nettoyage': 'Cleaning equipment', 'Brouette': 'Wheelbarrow', 'Tour d’étaiement': 'Shoring tower', 'Échafaudage': 'Scaffolding',
    'L’étape «': 'The stage “', ' » a-t-elle déjà été réalisée ?': '” been completed?', 'Étape précédente :': 'Previous stage:', 'Indiquez si l’étape précédente a déjà été réalisée.': 'Indicate whether the previous stage has been completed.', 'Ces prérequis sont-ils déjà réalisés ?': 'Have these prerequisites been completed?', 'Vérifier l’étape précédente': 'Check previous stage', 'Aucun équipement de cette liste ne s’applique au type de bâtiment choisi.': 'No equipment on this list applies to the selected building type.', 'Ajoutez les matériaux, la main-d’œuvre ou le matériel de cette section.': 'Add materials, labor or equipment to this section.', 'Autre unité manuelle…': 'Other manual unit…', 'Choisir un type': 'Choose a type', 'Nombre d’unités': 'Number of units', 'Saisissez la désignation de la quantité à calculer.': 'Enter the description of the quantity to calculate.', 'Renseignez une quantité de ciment, de sable et d’eau positive par bloc fabriqué.': 'Enter positive cement, sand and water quantities per block made on site.', 'Saisissez la masse d’un sac pour convertir la quantité de ciment.': 'Enter the bag mass to convert the cement quantity.', 'Supprimer cette ligne de matériel ?': 'Delete this equipment line?', 'Remplacer les données actuelles par ce devis importé ?': 'Replace the current session data with this imported estimate?', 'Je confirme le remplacement des données de la session par le devis importé.': 'I confirm replacing the session data with the imported estimate.', 'Le détail des sections est prêt pour la prochaine étape du parcours.': 'The section details are ready for the next step.', 'Devis de l’étape précédente enregistré. Revenir à': 'Previous-stage estimate saved. Return to', 'Revenir à': 'Return to', 'Continuer quand même': 'Continue anyway', 'Autres travaux / fourniture': 'Other work / supply', 'Structure / armatures': 'Structure / reinforcement', 'Terrassement / couche de forme': 'Earthworks / sub-base', 'Protection / étanchéité': 'Protection / waterproofing', 'Autre fourniture ou prestation': 'Other supply or service', 'Béton / béton armé': 'Concrete / reinforced concrete', 'Maçonnerie / blocs': 'Masonry / blocks', 'Imprévus de cette section (%)': 'Section contingency (%)', 'Mode d’approvisionnement': 'Supply method', 'Fabriqué sur le chantier': 'Made on site', 'Acheté': 'Purchased', 'Aucun coût saisi': 'No costs entered', 'Sous-total de la section': 'Section subtotal', 'Total de la section': 'Section total', 'Ajouter une ligne de ressource': 'Add resource line', 'Ajouter une ligne manuelle': 'Add manual line', 'Ajouter une section': 'Add section', 'Supprimer cette section': 'Delete this section', 'Supprimer cette ligne': 'Delete this line', 'Matériel à ajouter': 'Equipment to add', 'Pour chaque équipement, indiquez s’il est déjà disponible, à acheter, à louer ou non utilisé.': 'For each item of equipment, indicate whether it is available, to purchase, to rent or not used.', 'Précision technique (facultatif)': 'Technical note (optional)', 'Dimensions, diamètre, dosage ou référence des plans': 'Dimensions, diameter, mix or drawing reference', 'Une précision utile à conserver': 'A useful note to keep', 'Ville, quartier ou repère': 'City, district or landmark', 'Définissez votre projet': 'Define your project', 'Choisir une étape': 'Choose a stage', 'Sauvegardez un fichier JSON réimportable sur votre appareil.': 'Save an importable JSON file to your device.', 'La sauvegarde JSON a été préparée pour téléchargement.': 'The JSON backup is ready to download.', 'Les exports de lecture reprennent la langue et les données affichées dans cette estimation.': 'Readable exports use the language selected for this estimate.', 'Protéger le fichier par mot de passe (facultatif)': 'Protect this file with a password (optional)', 'Choisissez un fichier JSON': 'Choose a JSON file', 'Importer le devis': 'Import estimate', 'Exporter le devis': 'Export estimate', 'Exporter en CSV': 'Export CSV', 'Exporter en tableur (.xlsx)': 'Export spreadsheet (.xlsx)', 'Imprimer / enregistrer en PDF': 'Download PDF', 'Les exports CSV, XLSX et PDF sont des fichiers de lecture non chiffrés. Le mot de passe facultatif protège uniquement la sauvegarde JSON.': 'CSV, XLSX and PDF are unencrypted readable copies. The optional password protects only the JSON backup.', 'La sauvegarde JSON a été préparée pour téléchargement.': 'The JSON backup is ready to download.', 'Mode de calcul': 'Calculation method', 'Quantité calculée': 'Calculated quantity', 'Unité standard': 'Standard unit', 'Quantité': 'Quantity', 'Désignation': 'Description', 'Prix unitaire': 'Unit price', 'Prix unitaire (': 'Unit price (', 'Durée': 'Duration', 'Statut': 'Status', 'Choisir une fonction': 'Choose a role', 'Précisez la fonction': 'Specify the role', 'Précisez': 'Specify', 'Nom de la section': 'Section name', 'Type de bâtiment': 'Building type', 'Précisez le type de bâtiment': 'Specify the building type', 'Devise': 'Currency', 'Nom du chantier': 'Project name', 'Fonction': 'Role', 'Téléphone': 'Phone', 'Adresse e-mail': 'Email address', 'Non défini': 'Not set', 'Déjà disponible': 'Already available', 'À acheter': 'To purchase', 'À louer': 'To rent', 'Ne sera pas utilisé': 'Will not be used', 'Calcul assisté': 'Assisted calculation', 'Saisie manuelle': 'Manual entry', 'Ajouter un matériel': 'Add equipment', 'Tout marquer « Déjà disponible »': 'Mark all as already available', 'Localisation du chantier': 'Project location', 'Commentaire sur le chantier': 'Project notes', 'Facultatif': 'Optional', 'Détaillez les ressources et les coûts, section par section.': 'Enter resources and costs, section by section.', 'Récapitulatif du devis': 'Estimate summary', 'Enregistrement et export': 'Save and export', 'Continuer vers le choix du bâtiment': 'Continue to building selection', 'Continuer': 'Continue', 'Poursuivre vers le devis': 'Proceed to estimate', 'Synthèse': 'Summary'
  }));

  function translateValue(value) {
    if (language !== 'en' || !value) return value;
    const leading = value.match(/^\s*/)?.[0] || '';
    const trailing = value.match(/\s*$/)?.[0] || '';
    const normalized = value.trim().replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');
    if (english.has(normalized)) return `${leading}${english.get(normalized)}${trailing}`;
    const unitTranslations = { 'm³':'m³', 'm²':'m²', 'kg':'kg', 'g':'g', 't':'tonne', 'L':'L', 'mL':'mL', 'sac':'bag', 'camion':'truck', 'brouette':'wheelbarrow', 'pièce':'piece', 'barre':'bar', 'paquet':'packet', 'jour':'day', 'heure':'hour', 'lot':'lot', 'rouleau':'roll', 'm':'m', 'cm':'cm', 'mm':'mm', 'jour-personne':'person-day', 'mois-personne':'person-month' };
    if (unitTranslations[normalized]) return `${leading}${unitTranslations[normalized]}${trailing}`;
    const selected = normalized.match(/^Devis sélectionné : (.+)\.$/);
    if (selected) return `Selected estimate: ${english.get(selected[1]) || selected[1]}.`;
    const previousStep = normalized.match(/^L’étape « (.+) » a-t-elle déjà été réalisée \?$/);
    if (previousStep) return `Has the previous stage, “${english.get(previousStep[1]) || previousStep[1]}”, been completed?`;
    const previousLabel = normalized.match(/^Étape précédente : (.+)$/);
    if (previousLabel) return `Previous stage: ${english.get(previousLabel[1]) || previousLabel[1]}`;
    const phoneHint = normalized.match(/^Indicatif (\+\d+) · (.+) pour le numéro national\.$/);
    if (phoneHint) return `Calling code ${phoneHint[1]} · ${phoneHint[2].replace('chiffres','digits').replace(' ou ',' or ')} for the national number.`;
    const quoteStage = normalized.match(/^Chiffrez : (.+)$/);
    if (quoteStage) return `Estimate: ${english.get(quoteStage[1]) || quoteStage[1]}`;
    const progress = normalized.match(/^(\d+)\/6 · (.+)$/);
    if (progress) return `${progress[1]}/6 · ${english.get(progress[2]) || progress[2]}`;
    const unitPrice = normalized.match(/^Prix unitaire \(([^)]+)\)$/);
    if (unitPrice) return `Unit price (${unitPrice[1]})`;
    const quantityLabel = normalized.match(/^Quantité \((.+)\)$/);
    if (quantityLabel) return `Quantity (${translateValue(quantityLabel[1])})`;
    const unitLabel = normalized.match(/^Unité : (.+)$/);
    if (unitLabel) return `Unit: ${translateValue(unitLabel[1])}`;
    const rentPrice = normalized.match(/^Prix de location par (.+) \(([^)]+)\)$/);
    if (rentPrice) return `Rental price per ${english.get(rentPrice[1]) || rentPrice[1]} (${rentPrice[2]})`;
    const duration = normalized.match(/^Durée \((.+)s?\)$/);
    if (duration) return `Duration (${english.get(duration[1]) || duration[1]})`;
    const sectionLabel = normalized.match(/^Section (\d+) sur (\d+)$/);
    if (sectionLabel) return `Section ${sectionLabel[1]} of ${sectionLabel[2]}`;
    return value;
  }

  function translateRendered(root = document.body) {
    if (document.documentElement) document.documentElement.lang = language;
    document.title = language === 'en' ? (english.get(frenchTitle) || frenchTitle) : frenchTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = language === 'en' ? (english.get(frenchDescription) || frenchDescription) : frenchDescription;
    if (!document.createTreeWalker || !root?.querySelectorAll) return;
    const walker = document.createTreeWalker(root, globalThis.NodeFilter?.SHOW_TEXT || 4);
    let node;
    while ((node = walker.nextNode())) {
      if (!originalText.has(node)) originalText.set(node, node.nodeValue);
      if (node.parentElement?.closest('[data-user-content]')) continue;
      const source = language === 'fr' ? originalText.get(node) : node.nodeValue;
      const value = language === 'fr' ? source : translateValue(source);
      if (value !== node.nodeValue) node.nodeValue = value;
    }
    for (const element of root.querySelectorAll('[placeholder], [aria-label], [title]')) {
      for (const attribute of ['placeholder', 'aria-label', 'title']) {
        if (element.hasAttribute(attribute)) {
          let saved = originalAttributes.get(element);
          if (!saved) { saved = {}; originalAttributes.set(element, saved); }
          if (!Object.hasOwn(saved, attribute)) saved[attribute] = element.getAttribute(attribute);
          const source = language === 'fr' ? saved[attribute] : element.getAttribute(attribute);
          const value = language === 'fr' ? source : translateValue(source);
          if (value !== element.getAttribute(attribute)) element.setAttribute(attribute, value);
        }
      }
    }
    const themeToggle = document.querySelector('[data-theme-toggle]');
    if (themeToggle) {
      const label = darkTheme ? 'Activer le thème clair' : 'Activer le thème sombre';
      themeToggle.setAttribute('aria-label', language === 'en' ? english.get(label) : label);
      themeToggle.setAttribute('aria-pressed', String(darkTheme));
    }
  }

  function applyTheme() {
    if (document.documentElement) document.documentElement.dataset.theme = darkTheme ? 'dark' : 'light';
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = darkTheme ? '#172333' : '#f4f6fa';
    translateRendered();
  }

  const stages = [
    ['Fondations et infrastructure', 'Semelles, radier, longrines'],
    ['Soubassement et plancher bas', 'Murs de soubassement, dallage'],
    ['Élévation du rez-de-chaussée', 'Murs, poteaux, linteaux'],
    ['Plancher et niveaux supérieurs', 'Dalles, poutres, escaliers'],
    ['Charpente et couverture', 'Structure de toiture, protection']
  ];
  const buildings = [
    ['Maison', 'RDC'],
    ['Duplex', 'Plusieurs niveaux'],
    ['Petit bâtiment commercial', 'Commerce de proximité'],
    ['Bâtiment résidentiel', 'Logements collectifs'],
    ['Établissement scolaire', 'École / collège'],
    ['Bâtiment administratif', 'Bureaux / services'],
    ['Entrepôt / bâtiment industriel', 'Stockage / activité'],
    ['Autre', 'Type à préciser']
  ];

  const houseIllustration = `
    <svg class="house-illustration" viewBox="0 0 360 260" role="img" aria-labelledby="house-title">
      <title id="house-title">Illustration d’une maison sur un plan quadrillé</title>
      <g class="house-grid" aria-hidden="true">
        <path d="M0 20H360M0 60H360M0 100H360M0 140H360M0 180H360M0 220H360" />
        <path d="M20 0V260M60 0V260M100 0V260M140 0V260M180 0V260M220 0V260M260 0V260M300 0V260M340 0V260" />
      </g>
      <path class="house-roof-accent" d="m74 116 106-76 106 76" />
      <path class="house-outline" d="M91 107v111h178V107M74 116l106-76 106 76" />
      <path class="house-outline" d="M119 218v-73h37v73m49 0v-73h37v73" />
      <path class="house-window" d="M163 94h35v31h-35z" />
      <text class="house-window-dollar" x="180.5" y="117" text-anchor="middle">$</text>
      <path class="house-baseline" d="M78 227h204" />
    </svg>`;

  function renderHome() {
    app.innerHTML = `
      <section class="page-shell home-screen" aria-labelledby="home-title">
        <div class="hero-panel">
          <div class="hero-copy">
            <p class="eyebrow">Devis de gros œuvre · étape par étape</p>
            <h1 id="home-title">Construire avec un<br class="desktop-break"> budget <span>plus clair.</span></h1>
            <p class="hero-description">Préparez un devis précis, suivez ce qui est déjà réalisé et gardez chaque ressource visible.</p>
            <div class="hero-actions">
              <button class="button button-primary" type="button" data-start>Commencer <span aria-hidden="true">→</span></button>
              <button class="button button-secondary" type="button" data-home-import>Importer un devis JSON</button>
              <button class="button button-quiet" type="button" data-home-example>Demo</button>
              <span class="hero-note">Sans compte · conçu pour fonctionner localement</span>
            </div>
          </div>
          <div class="hero-art" aria-hidden="false">
            <div class="art-caption">Une estimation explicite</div>
            <div class="art-card">${houseIllustration}</div>
          </div>
        </div>
        <ul class="benefit-list" aria-label="Principes de Quantix BTP">
          <li class="benefit-card"><span class="benefit-number" aria-hidden="true">01</span><span><b>Ressources détaillées</b><small>Matériaux · main-d’œuvre</small></span></li>
          <li class="benefit-card"><span class="benefit-number" aria-hidden="true">02</span><span><b>Étapes suivies</b><small>Déjà réalisé = retiré du coût</small></span></li>
          <li class="benefit-card"><span class="benefit-number" aria-hidden="true">03</span><span><b>Sauvegarde réimportable</b><small>Devis JSON local</small></span></li>
        </ul>
      </section>`;
  }

  function stepProgress(number, label) {
    const percent = Math.max(0, Math.min(100, number / 6 * 100));
    return `<button class="top-back" type="button" data-top-back aria-label="Retour à l’écran précédent"><span aria-hidden="true">←</span><span>Retour</span></button>
      <div class="progress-meta"><span>${number}/6 · ${label}</span><button class="new-estimate-link" type="button" data-new-estimate>${language === 'en' ? '+ New estimate' : '+ Nouveau devis'}</button></div>
      <div class="progress-track" role="progressbar" aria-label="Progression du devis" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${number}"><span style="width:${percent}%"></span></div>${demoMode ? demoNoticeMarkup() : ''}`;
  }

  function localNoticeMarkup(title, detail = '', extraClass = '') {
    return `<aside class="local-notice ${extraClass}" aria-label="${escapeHtml(title)}"><span class="notice-icon" aria-hidden="true">i</span><span><b>${escapeHtml(title)}</b>${detail ? `<small>${escapeHtml(detail)}</small>` : ''}</span></aside>`;
  }

  function demoNoticeMarkup() {
    return localNoticeMarkup(language === 'en' ? 'Illustrative example · fictional data' : 'Exemple illustratif · données fictives', '', 'demo-banner');
  }

  function readDemoConfig(locale = language) {
    const node = document.getElementById(locale === 'en' ? 'quantix-example-en' : 'quantix-example-fr');
    if (!node) throw new Error('Le fichier d’exemple local est indisponible.');
    const example = JSON.parse(node.textContent);
    if (example.format !== 'quantix-btp-backup' || example.version !== 1 || !example.data || !example.demo) {
      throw new Error('Le fichier d’exemple local est invalide.');
    }
    return example;
  }

  function startExample() {
    const example = readDemoConfig(language);
    demoConfig = { demo: example.demo };
    Object.assign(contributor, example.data.contributor);
    Object.assign(project, example.data.project);
    stageChecks.clear();
    stageCheck = { stage: project.stage, answers: { plans: 'yes', sitePrep: 'yes', siteSetup: 'yes' } };
    stageChecks.set(project.stage, stageCheck);
    quotesByStage.clear();
    quote = { stage: '', sections: [], currentSection: 0, saved: false };
    resumeStage = '';
    detourReturnPending = false;
    allowIncompleteQuote = false;
    importedBackup = null;
    demoMode = true;
    contributorName.textContent = contributor.name;
    contributorRole.textContent = contributor.role;
    contributorContext.hidden = false;
    avatar.textContent = initials(contributor.name);
    avatar.hidden = false;
    screen = 'contributor';
    render();
    app.focus();
  }

  function fillDemoQuote(targetQuote) {
    if (!demoMode || !demoConfig) return targetQuote;
    targetQuote.sections.forEach((section) => {
      section.contingency = 5;
      section.mode = 'manual';
      section.items.forEach((item) => {
        item.assisted = false;
        delete item.baseQuantity;
        delete item.baseUnit;
        item.quantity = item.catalogDesignation && /ingénieur|technicien|ouvrier|manœuvre/i.test(item.designation) ? demoConfig.demo.laborQuantity : demoConfig.demo.quantity;
        item.unitPrice = item.catalogDesignation && /ingénieur|technicien|ouvrier|manœuvre/i.test(item.designation) ? demoConfig.demo.laborUnitPrice : demoConfig.demo.unitPrice;
        item.precision = demoConfig.demo.precision;
      });
      section.equipmentItems.forEach((item, index) => {
        item.status = index % 3 === 0 ? 'rent' : 'purchase';
        item.quantity = demoConfig.demo.equipmentQuantity;
        item.duration = demoConfig.demo.rentalDuration;
        item.unitPrice = item.status === 'rent' ? demoConfig.demo.rentalUnitPrice : demoConfig.demo.equipmentUnitPrice;
      });
      delete section.params;
      section.params = {};
    });
    targetQuote.saved = false;
    return targetQuote;
  }

  function switchDemoLocale() {
    if (!demoMode) return;
    const replacement = readDemoConfig(language);
    project.name = replacement.data.project.name;
    project.notes = replacement.data.project.notes;
    if (project.buildingType === 'Autre') project.buildingTypeOther = language === 'en' ? 'Other illustrative building type' : 'Autre type de bâtiment illustratif';
    demoConfig = replacement;
    quotesByStage.forEach((savedQuote) => fillDemoQuote(savedQuote));
    if (quote.stage) fillDemoQuote(quote);
  }

  function startNewEstimate() {
    if (!window.confirm(language === 'en' ? 'Start a new estimate and clear all current estimate data?' : 'Créer un nouveau devis et réinitialiser toutes les données actuelles ?')) return;
    Object.assign(contributor, { name: '', role: '', otherRole: '', phone: '', dialCode: '+237', email: '' });
    Object.assign(project, { name: '', buildingType: '', buildingTypeOther: '', location: '', notes: '', currency: 'XAF', stage: '' });
    stageCheck = { stage: '', answers: {} };
    stageChecks.clear();
    quotesByStage.clear();
    quote = { stage: '', sections: [], currentSection: 0, saved: false };
    resumeStage = '';
    detourReturnPending = false;
    allowIncompleteQuote = false;
    importedBackup = null;
    demoMode = false;
    demoConfig = null;
    contributorContext.hidden = true;
    contributorName.textContent = '';
    contributorRole.textContent = '';
    avatar.hidden = true;
    screen = 'contributor';
    render();
    app.focus();
  }

  function navigateBack(destination) {
    if (screen === 'quote' && resumeStage) resumeStage = '';
    screen = destination;
    render();
    app.focus();
  }

  function heading(eyebrow, title, subtitle) {
    return `<div class="form-heading"><p class="eyebrow">${eyebrow}</p><h1 id="${screen}-title">${title}</h1><p>${subtitle}</p></div>`;
  }

  function footerActions(backLabel, nextLabel) {
    return `<div class="form-actions"><button class="button button-quiet" type="button" data-back>${backLabel}</button><button class="button button-primary" type="submit">${nextLabel} <span aria-hidden="true">→</span></button></div>`;
  }

  function renderContributor() {
    const dialOptions = window.QUANTIX_PHONE_COUNTRIES.map((item) =>
      `<option value="${item.code}" data-lengths="${item.lengths.join(',')}">${item.name} (${item.code})</option>`).join('');
    app.innerHTML = `
      <section class="page-shell form-screen" aria-labelledby="contributor-title" data-flow="QBT-FLOW-02">
        ${stepProgress(1, 'Contributeur')}
        ${heading('Nouveau devis', 'Qui prépare ce devis&nbsp;?', 'Ces informations seront reprises dans l’en-tête du devis.')}
        <form class="form-card contributor-form" novalidate>
          <div class="field-grid">
            <div class="field"><label for="contributor-name">Nom et prénom <span aria-hidden="true">*</span></label><input id="contributor-name" name="name" type="text" autocomplete="name" maxlength="100" required placeholder="Ex. Amina Nguema" aria-describedby="name-error"><span class="field-error" id="name-error" aria-live="polite"></span></div>
            <div class="field"><label for="contributor-role">Fonction <span aria-hidden="true">*</span></label><select id="contributor-role" name="role" required aria-describedby="role-error"><option value="">Choisir une fonction</option><option>Propriétaire</option><option>Maître d’ouvrage</option><option>Ingénieur</option><option>Architecte</option><option>Conducteur de travaux</option><option>Technicien</option><option>Artisan</option><option>Autre</option></select><span class="field-error" id="role-error" aria-live="polite"></span>
              <div class="other-role" data-other-role hidden><label for="contributor-role-other">Précisez la fonction <span class="optional-label">Facultatif</span></label><input id="contributor-role-other" name="roleOther" type="text" maxlength="80" placeholder="Votre fonction"><span class="field-error" id="role-other-error" aria-live="polite"></span></div>
            </div>
            <div class="field"><label for="contributor-phone">Téléphone <span aria-hidden="true">*</span></label><div class="phone-control"><select id="contributor-dial-code" name="dialCode" aria-label="Indicatif téléphonique" required>${dialOptions}</select><input id="contributor-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" required placeholder="679000030" aria-describedby="phone-hint phone-error"></div><small class="field-help" id="phone-hint"></small><span class="field-error" id="phone-error" aria-live="polite"></span></div>
            <div class="field"><label for="contributor-email">Adresse e-mail <span class="optional-label">Facultatif</span></label><input id="contributor-email" name="email" type="email" autocomplete="email" maxlength="254" placeholder="nom@exemple.com" aria-describedby="email-error"><span class="field-error" id="email-error" aria-live="polite"></span></div>
          </div>
          <aside class="local-notice" aria-label="Confidentialité locale"><span class="notice-icon" aria-hidden="true">i</span><span><b>Données sur cet appareil</b><small>Aucun compte requis. Les informations sont utilisées localement dans cet appareil.</small></span></aside>
          <p class="form-hint">Le numéro est contrôlé selon l’indicatif choisi. L’adresse e-mail est facultative.</p>
          <p class="form-feedback" data-feedback role="status" aria-live="polite"></p>
          ${footerActions('Retour', 'Continuer vers le choix du bâtiment')}
        </form>
      </section>`;
    bindContributorForm();
  }

  function bindContributorForm() {
    const form = app.querySelector('.contributor-form');
    const name = form.elements.name;
    const role = form.elements.role;
    const otherRole = form.elements.roleOther;
    const dial = form.elements.dialCode;
    const phone = form.elements.phone;
    const email = form.elements.email;
    const otherWrap = form.querySelector('[data-other-role]');
    const feedback = form.querySelector('[data-feedback]');
    const submit = form.querySelector('[type="submit"]');
    const clearFeedback = () => { feedback.textContent = ''; submit.disabled = false; };

    name.value = contributor.name;
    role.value = contributor.role;
    otherRole.value = contributor.otherRole;
    dial.value = contributor.dialCode;
    phone.value = contributor.phone;
    email.value = contributor.email.toLocaleLowerCase('en-US');
    otherWrap.hidden = role.value !== 'Autre';

    function updatePhoneHint() {
      const option = dial.selectedOptions[0];
      const lengths = option.dataset.lengths.split(',').map(Number);
      const label = lengths.length === 1 ? `${lengths[0]} chiffres` : `${lengths.slice(0, -1).join(', ')} ou ${lengths.at(-1)} chiffres`;
      form.querySelector('#phone-hint').textContent = `Indicatif ${dial.value} · ${label} pour le numéro national.`;
      phone.maxLength = Math.max(...lengths);
      phone.setAttribute('aria-invalid', 'false');
      form.querySelector('#phone-error').textContent = '';
    }
    updatePhoneHint();

    role.addEventListener('change', () => {
      contributor.role = role.value;
      otherWrap.hidden = role.value !== 'Autre';
      form.querySelector('#role-error').textContent = '';
      role.setAttribute('aria-invalid', 'false');
      clearFeedback();
    });
    dial.addEventListener('change', () => { contributor.dialCode = dial.value; phone.value = ''; contributor.phone = ''; updatePhoneHint(); clearFeedback(); });

    for (const [control, key, errorId] of [[name, 'name', 'name-error'], [otherRole, 'otherRole', 'role-other-error'], [phone, 'phone', 'phone-error'], [email, 'email', 'email-error']]) {
      control.addEventListener('input', () => {
        if (key === 'phone') control.value = control.value.replace(/\D/g, '').slice(0, Number(control.maxLength));
        if (key === 'email') control.value = control.value.toLocaleLowerCase('en-US');
        contributor[key] = control.value;
        control.setAttribute('aria-invalid', 'false');
        form.querySelector(`#${errorId}`).textContent = '';
        clearFeedback();
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const nationalPhone = phone.value.replace(/\D/g, '');
      const allowedLengths = dial.selectedOptions[0].dataset.lengths.split(',').map(Number);
      const errors = [];
      if (!name.value.trim()) errors.push([name, 'name-error', 'Saisissez le nom et le prénom du contributeur.']);
      if (!role.value) errors.push([role, 'role-error', 'Choisissez la fonction du contributeur.']);
      if (!allowedLengths.includes(nationalPhone.length)) errors.push([phone, 'phone-error', `Ce numéro doit contenir ${allowedLengths.join(' ou ')} chiffres après ${dial.value}.`]);
      email.value = email.value.trim().toLocaleLowerCase('en-US');
      if (email.value && !isValidEmail(email.value)) errors.push([email, 'email-error', 'Saisissez une adresse e-mail valide en minuscules (ex. nom@exemple.com).']);

      for (const control of [name, role, otherRole, phone, email]) control.setAttribute('aria-invalid', 'false');
      for (const [, errorId] of errors) form.querySelector(`#${errorId}`).textContent = '';
      if (errors.length) {
        const [control, errorId, message] = errors[0];
        control.setAttribute('aria-invalid', 'true');
        form.querySelector(`#${errorId}`).textContent = message;
        feedback.textContent = '';
        control.focus();
        return;
      }

      Object.assign(contributor, { name: name.value.trim(), role: role.value, otherRole: role.value === 'Autre' ? otherRole.value.trim() : '', dialCode: dial.value, phone: nationalPhone, email: email.value.trim() });
      avatar.textContent = initials(contributor.name);
      const roleLabel = role.value === 'Autre' && contributor.otherRole ? contributor.otherRole : role.value;
      avatar.setAttribute('aria-label', `${contributor.name} · ${roleLabel}`);
      contributorName.textContent = contributor.name;
      contributorRole.textContent = roleLabel;
      contributorContext.hidden = false;
      avatar.hidden = false;
      screen = 'building';
      render();
      app.focus();
    });
    bindBack(form, 'home');
  }

  function isValidEmail(value) {
    if (value.length > 254 || /[^\x21-\x7e]/.test(value)) return false;
    const parts = value.split('@');
    if (parts.length !== 2) return false;
    const [local, domain] = parts;
    if (!local || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
    if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false;
    const labels = domain.split('.');
    if (labels.length < 2 || labels.some((label) => !label || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))) return false;
    return true;
  }

  function renderBuilding() {
    const buildingCards = buildings.map(([name, detail]) => `
      <label class="choice-card ${project.buildingType === name ? 'is-selected' : ''}">
        <input type="radio" name="buildingType" value="${name}" ${project.buildingType === name ? 'checked' : ''} required>
        <span class="choice-title">${name}</span><small>${detail}</small>
      </label>`).join('');
    app.innerHTML = `
      <section class="page-shell form-screen" aria-labelledby="building-title" data-flow="QBT-FLOW-03">
        ${stepProgress(2, 'Bâtiment')}
        ${heading('Projet', 'Quel bâtiment souhaitez-vous chiffrer&nbsp;?', 'Définissez votre projet')}
        <form class="form-card building-form" novalidate>
          <div class="field-grid project-fields">
            <div class="field"><label for="project-name">Nom du chantier <span aria-hidden="true">*</span></label><input id="project-name" name="projectName" required maxlength="120" placeholder="Ex. Construction familiale" aria-describedby="project-name-error"><span class="field-error" id="project-name-error" aria-live="polite"></span></div>
            <div class="field"><label for="project-currency">Devise <span aria-hidden="true">*</span></label><select id="project-currency" name="currency" aria-describedby="currency-help"><option value="XAF">FCFA (XAF)</option><option value="USD">Dollar américain (USD)</option><option value="EUR">Euro (EUR)</option><option value="JPY">Yen japonais (JPY)</option><option value="GBP">Livre sterling (GBP)</option></select><small class="field-help" id="currency-help">Devise utilisée pour les prix de ce devis.</small></div>
            <div class="field"><label for="project-location">Localisation du chantier <span class="optional-label">Facultatif</span></label><input id="project-location" name="location" maxlength="160" placeholder="Ville, quartier ou repère"></div>
            <div class="field"><label for="project-notes">Commentaire sur le chantier <span class="optional-label">Facultatif</span></label><textarea id="project-notes" name="notes" rows="2" maxlength="500" placeholder="Une précision utile à conserver"></textarea></div>
          </div>
          <fieldset class="building-choice"><legend>Type de bâtiment <span aria-hidden="true">*</span></legend><div class="choice-grid">${buildingCards}</div><span class="field-error" data-building-error aria-live="polite"></span></fieldset>
          <div class="field other-building-type" data-other-building hidden><label for="project-building-other">Précisez le type de bâtiment <span aria-hidden="true">*</span></label><input id="project-building-other" name="buildingTypeOther" maxlength="100" placeholder="Type de bâtiment"><span class="field-error" id="building-other-error" aria-live="polite"></span></div>
          <p class="form-feedback" data-feedback role="status" aria-live="polite"></p>
          ${footerActions('Retour', 'Choisir une étape')}
        </form>
      </section>`;
    bindBuildingForm();
  }

  function bindBuildingForm() {
    const form = app.querySelector('.building-form');
    const name = form.elements.projectName;
    const currency = form.elements.currency;
    const location = form.elements.location;
    const notes = form.elements.notes;
    const buildingTypeOther = form.elements.buildingTypeOther;
    const otherWrap = form.querySelector('[data-other-building]');
    name.value = project.name;
    currency.value = project.currency;
    location.value = project.location;
    notes.value = project.notes;
    buildingTypeOther.value = project.buildingTypeOther;
    otherWrap.hidden = project.buildingType !== 'Autre';
    buildingTypeOther.addEventListener('input', () => {
      buildingTypeOther.setAttribute('aria-invalid', 'false');
      form.querySelector('#building-other-error').textContent = '';
    });
    for (const input of form.querySelectorAll('input[name="buildingType"]')) input.addEventListener('change', () => {
      project.buildingType = input.value;
      if (demoMode && input.value === 'Autre' && !project.buildingTypeOther) project.buildingTypeOther = language === 'en' ? 'Other illustrative building type' : 'Autre type de bâtiment illustratif';
      if (demoMode) { quotesByStage.clear(); quote = { stage: '', sections: [], currentSection: 0, saved: false }; }
      form.querySelectorAll('.choice-card').forEach((card) => card.classList.toggle('is-selected', card.contains(input) && input.checked));
      form.querySelector('[data-building-error]').textContent = '';
      otherWrap.hidden = input.value !== 'Autre';
      if (input.value !== 'Autre') form.querySelector('#building-other-error').textContent = '';
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const selected = form.querySelector('input[name="buildingType"]:checked');
      if (!name.value.trim()) {
        name.setAttribute('aria-invalid', 'true');
        form.querySelector('#project-name-error').textContent = 'Saisissez le nom du chantier.';
        name.focus();
        return;
      }
      if (!selected) {
        form.querySelector('[data-building-error]').textContent = 'Choisissez un type de bâtiment.';
        form.querySelector('.building-choice').focus();
        return;
      }
      if (selected.value === 'Autre' && !buildingTypeOther.value.trim()) {
        buildingTypeOther.setAttribute('aria-invalid', 'true');
        form.querySelector('#building-other-error').textContent = 'Précisez le type de bâtiment.';
        buildingTypeOther.focus();
        return;
      }
      Object.assign(project, {
        name: name.value.trim(),
        buildingType: selected.value,
        buildingTypeOther: selected.value === 'Autre' ? buildingTypeOther.value.trim() : '',
        location: location.value.trim(),
        notes: notes.value.trim(),
        currency: currency.value
      });
      screen = 'stage';
      render();
      app.focus();
    });
    bindBack(form, 'contributor');
  }

  function renderStage() {
    const cards = stages.map(([title, detail], index) => `
      <label class="stage-option ${project.stage === title ? 'is-selected' : ''}">
        <input type="radio" name="stage" value="${title}" ${project.stage === title ? 'checked' : ''} required>
        <span class="stage-number">${String(index + 1).padStart(2, '0')}</span><span class="stage-copy"><b>${title}</b><small>${detail}</small></span><span class="stage-check" aria-hidden="true">✓</span>
      </label>`).join('');
    app.innerHTML = `
      <section class="page-shell form-screen" aria-labelledby="stage-title" data-flow="QBT-FLOW-04">
        ${stepProgress(3, 'Étape')}
        ${heading('Étape à chiffrer', 'Sur quelle étape porte ce devis&nbsp;?', 'Choisissez l’étape des travaux que vous souhaitez estimer.')}
        <form class="form-card stage-form" novalidate>
          <fieldset class="stage-list"><legend class="sr-only">Étape de construction</legend>${cards}<span class="field-error" data-stage-error aria-live="polite"></span></fieldset>
          <p class="form-feedback" data-feedback role="status" aria-live="polite"></p>
          ${footerActions('Retour', 'Continuer')}
        </form>
      </section>`;
    bindStageForm();
  }

  function bindStageForm() {
    const form = app.querySelector('.stage-form');
    for (const input of form.querySelectorAll('input[name="stage"]')) input.addEventListener('change', () => {
      project.stage = input.value;
      if (stageCheck.stage !== project.stage) stageCheck = stageChecks.get(project.stage) || { stage: project.stage, answers: {} };
      if (demoMode) {
        const selectedIndex = stages.findIndex(([stage]) => stage === project.stage);
        stageCheck = { stage: project.stage, answers: selectedIndex === 0 ? { plans: 'yes', sitePrep: 'yes', siteSetup: 'yes' } : { previousStage: 'yes' } };
        stageChecks.set(project.stage, stageCheck);
      }
      form.querySelectorAll('.stage-option').forEach((card) => card.classList.toggle('is-selected', card.contains(input) && input.checked));
      form.querySelector('[data-stage-error]').textContent = '';
      form.querySelector('[data-feedback]').textContent = '';
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = false;
      submit.innerHTML = 'Vérifier l’étape précédente <span aria-hidden="true">→</span>';
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const selected = form.querySelector('input[name="stage"]:checked');
      if (!selected) {
        form.querySelector('[data-stage-error]').textContent = 'Sélectionnez une étape à chiffrer.';
        return;
      }
      project.stage = selected.value;
      if (stageCheck.stage !== project.stage) stageCheck = stageChecks.get(project.stage) || { stage: project.stage, answers: {} };
      if (demoMode) {
        const selectedIndex = stages.findIndex(([stage]) => stage === project.stage);
        stageCheck = { stage: project.stage, answers: selectedIndex === 0 ? { plans: 'yes', sitePrep: 'yes', siteSetup: 'yes' } : { previousStage: 'yes' } };
        stageChecks.set(project.stage, stageCheck);
      }
      screen = 'verification';
      render();
      app.focus();
    });
    bindBack(form, 'building');
  }

  const previousCheckLabels = [
    ['plans', 'Études et plans disponibles'],
    ['sitePrep', 'Préparation du terrain terminée'],
    ['siteSetup', 'Installation du chantier réalisée']
  ];

  function answerOptions(name, label, answer) {
    return `<div class="answer-options" role="radiogroup" aria-label="${escapeHtml(label)}">
      <label class="answer-choice ${answer === 'yes' ? 'is-selected' : ''}"><input type="radio" name="${name}" value="yes" ${answer === 'yes' ? 'checked' : ''} required><span>Oui</span></label>
      <label class="answer-choice ${answer === 'no' ? 'is-selected' : ''}"><input type="radio" name="${name}" value="no" ${answer === 'no' ? 'checked' : ''} required><span>Non</span></label>
    </div>`;
  }

  function renderVerification() {
    const selectedIndex = stages.findIndex(([title]) => title === project.stage);
    const firstStage = selectedIndex === 0;
    const questions = firstStage
      ? previousCheckLabels.map(([id, label]) => `<div class="status-row"><span>${label}</span>${answerOptions(id, label, stageCheck.answers[id])}</div>`).join('')
      : `<div class="status-row previous-stage-question"><span>L’étape « ${stages[selectedIndex - 1][0]} » a-t-elle déjà été réalisée&nbsp;?</span>${answerOptions('previousStage', `Étape précédente : ${stages[selectedIndex - 1][0]}`, stageCheck.answers.previousStage)}</div>`;
    const missing = Object.values(stageCheck.answers).some((answer) => answer === 'no');
    const missingNotice = firstStage
      ? 'Vous pouvez poursuivre. Quantix BTP n’ajoutera pas le coût des prérequis signalés ; prévoyez-les séparément.'
      : 'Vous pouvez poursuivre. Le devis portera uniquement sur l’étape choisie ; le coût de l’étape précédente n’y sera pas ajouté automatiquement.';
    app.innerHTML = `
      <section class="page-shell form-screen" aria-labelledby="verification-title" data-flow="QBT-FLOW-05">
        ${stepProgress(4, 'Vérification')}
        ${heading('Avant le devis', 'Vérifions le point de départ.', `Devis sélectionné : ${project.stage}.`)}
        <form class="form-card verification-form" novalidate>
      ${firstStage ? `${localNoticeMarkup('Prérequis hors devis', 'Les études, la préparation générale du terrain et l’installation du chantier ne sont pas chiffrées par Quantix BTP.')}
            <p class="verification-prompt">Ces prérequis sont-ils déjà réalisés&nbsp;?</p>` : `<p class="verification-prompt">Indiquez si l’étape précédente a déjà été réalisée.</p>`}
          <div class="status-list">${questions}</div>
          ${!firstStage && stageCheck.answers.previousStage === 'no' ? `<fieldset class="previous-quote-question"><legend>Souhaitez-vous être dirigé vers le devis de l’étape précédente&nbsp;?</legend>${answerOptions('visitPreviousQuote', 'Aller au devis précédent', stageCheck.answers.visitPreviousQuote)}</fieldset>` : ''}
          ${missing ? `<aside class="nonblocking-notice" role="status"><span class="notice-icon" aria-hidden="true">i</span><span>${missingNotice}</span></aside>` : ''}
          <p class="field-error" data-verification-error aria-live="polite"></p>
          ${footerActions('Retour', 'Poursuivre vers le devis')}
        </form>
      </section>`;
    bindVerificationForm();
  }

  function bindVerificationForm() {
    const form = app.querySelector('.verification-form');
    const selectedIndex = stages.findIndex(([title]) => title === project.stage);
    const missingNotice = selectedIndex === 0
      ? 'Vous pouvez poursuivre. Quantix BTP n’ajoutera pas le coût des prérequis signalés ; prévoyez-les séparément.'
      : 'Vous pouvez poursuivre. Le devis portera uniquement sur l’étape choisie ; le coût de l’étape précédente n’y sera pas ajouté automatiquement.';
    const keys = selectedIndex === 0 ? previousCheckLabels.map(([id]) => id) : ['previousStage'];
    for (const input of form.querySelectorAll('input[type="radio"]')) input.addEventListener('change', () => {
      stageCheck.answers[input.name] = input.value;
      stageChecks.set(stageCheck.stage, stageCheck);
      if (input.name === 'previousStage' && input.value === 'yes') delete stageCheck.answers.visitPreviousQuote;
      form.querySelectorAll(`input[name="${input.name}"]`).forEach((radio) => radio.closest('.answer-choice').classList.toggle('is-selected', radio.checked));
      if (input.name === 'previousStage') { renderVerification(); return; }
      form.querySelector('[data-verification-error]').textContent = '';
      const noAnswer = Object.values(stageCheck.answers).some((answer) => answer === 'no');
      let notice = form.querySelector('.nonblocking-notice');
      if (noAnswer && !notice) {
        notice = document.createElement('aside');
        notice.className = 'nonblocking-notice';
        notice.setAttribute('role', 'status');
        notice.innerHTML = `<span class="notice-icon" aria-hidden="true">i</span><span>${missingNotice}</span>`;
        form.querySelector('.status-list').after(notice);
      } else if (!noAnswer && notice) notice.remove();
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (keys.some((key) => !['yes', 'no'].includes(stageCheck.answers[key]))) {
        form.querySelector('[data-verification-error]').textContent = 'Répondez à chaque question pour continuer.';
        return;
      }
      if (selectedIndex > 0 && stageCheck.answers.previousStage === 'no' && !['yes', 'no'].includes(stageCheck.answers.visitPreviousQuote)) {
        form.querySelector('[data-verification-error]').textContent = 'Indiquez si vous souhaitez ouvrir le devis de l’étape précédente.';
        return;
      }
      if (selectedIndex > 0 && stageCheck.answers.previousStage === 'no' && stageCheck.answers.visitPreviousQuote === 'yes') {
        resumeStage = project.stage;
        detourReturnPending = true;
        project.stage = stages[selectedIndex - 1][0];
        stageCheck = stageChecks.get(project.stage) || { stage: project.stage, answers: {} };
        activateQuote(project.stage);
      } else activateQuote(project.stage);
      screen = 'quote';
      render();
      app.focus();
    });
    bindBack(form, 'stage');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function displayDesignation(value) {
    return String(value ?? '').replace(/\s*\([^()]*\)/g, '').replace(/\s{2,}/g, ' ').trim();
  }

  function parseNumber(value) {
    if (typeof value === 'string') value = value.replace(',', '.').trim();
    return value === '' ? NaN : Number(value);
  }

  function formatNumber(value, digits = 3) {
    if (!Number.isFinite(value)) return '—';
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', { maximumFractionDigits: digits }).format(value);
  }

  function formatCurrency(value) {
    if (!Number.isFinite(value)) return '—';
    return `${new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', { maximumFractionDigits: 2 }).format(value)} ${project.currency}`;
  }

  function createQuoteSection(stage) {
    const template = window.QUANTIX_QUOTE_CATALOG.find((entry) => entry.stage === stage);
    const presets = template?.sections || [{ id: 'custom', title: '', type: 'materials', items: [] }];
    const equipmentNames = new Set((presets.find((preset) => preset.type === 'equipment')?.items || []).map((item) => item.designation.trim().toLocaleLowerCase('fr')));
    const equipmentOnlyTerms = /cordeau|piquet d’implantation|chaise d’implantation|\bétais\b|tour d’étaiement|brouette|pelle|pioche|houe|seau|truelle|taloche|platoir|niveau|fil à plomb|règle de maçon|mètre ruban|décamètre|bétonnière|aiguille vibrante|compacteur|échafaudage|plateforme de travail|groupe électrogène|perceuse|visseuse|scie|marteau|pince|harnais antichute|garde-corps provisoire/iu;
    const sections = presets.filter((preset) => !preset.applicable_a || preset.applicable_a.includes('tous') || preset.applicable_a.includes(project.buildingType)).map((preset) => ({
      id: preset.id,
      title: preset.title,
      catalogTitle: true,
      description: preset.description_technique || '',
      toConfirm: preset.id === 'equipment' ? (template?.a_confirmer || []) : [],
      catalogItems: preset.items || [],
      kind: preset.type === 'equipment' ? 'equipment' : ['murs-soubassement', 'maconnerie'].includes(preset.id) ? 'masonry' : ['proprete', 'semelles', 'longrines', 'dallage', 'poteaux-chainages', 'linteaux', 'poutres-dalles', 'escalier'].includes(preset.id) ? 'concrete' : 'other',
      mode: 'manual',
      contingency: 5,
      items: preset.type === 'equipment' ? [] : (preset.items || []).filter((item) => !equipmentNames.has(item.designation.trim().toLocaleLowerCase('fr')) && !equipmentOnlyTerms.test(item.designation)).map((item) => ({
        designation: item.designation, catalogDesignation: true, quantity: '', unit: defaultUnitFor(item.designation, item.unit), customUnit: '', unitPrice: '', assisted: false,
        applicable_a: item.applicable_a || ['tous'], precision: item.precisions || '', acquisition: item.acquisition
      })),
      equipmentItems: preset.type === 'equipment' ? (preset.items || []).map((item) => ({
        designation: item.designation, unit: item.unit, rental_unit: item.rental_unit || 'jour', applicable_a: item.applicable_a || ['tous'], status: '', quantity: '', duration: '', unitPrice: ''
      })) : [],
      blockType: '', blockTypeOther: '', blockMethod: 'purchased',
      params: { cementUnit: 'kg', waterUnit: 'L', cementBagMassKg: '' }
    }));
    sections.push(createLaborSection());
    return sections;
  }

  function createLaborSection() {
    return { id: 'labor', title: 'Main-d’œuvre', catalogTitle: true, description: '', toConfirm: [], catalogItems: [], kind: 'other', mode: 'manual', contingency: 5, items: ['Ingénieur','Technicien','Ouvrier qualifié','Manœuvre'].map((designation) => ({ designation, catalogDesignation: true, quantity: '', unit: 'jour-personne', customUnit: '', unitPrice: '', assisted: false })), equipmentItems: [], blockType: '', blockTypeOther: '', blockMethod: 'purchased', params: {} };
  }

  function ensureLaborSection(targetQuote) {
    if (!targetQuote.sections.some((section) => section.id === 'labor')) targetQuote.sections.push(createLaborSection());
    targetQuote.sections.forEach((section) => {
      section.mode = 'manual';
      section.params = {};
      section.items.forEach((item) => { item.assisted = false; delete item.baseQuantity; delete item.baseUnit; });
    });
    return targetQuote;
  }

  function activateQuote(stage) {
    if (quote.stage) quotesByStage.set(quote.stage, quote);
    quote = quotesByStage.get(stage) || { stage, sections: createQuoteSection(stage), currentSection: 0, saved: false };
    ensureLaborSection(quote);
    fillDemoQuote(quote);
    quotesByStage.set(stage, quote);
  }


  function defaultUnitFor(designation, current = '') {
    const options = manualUnitOptions('', designation); const first = options.match(/<option value="([^"]+)" selected/);
    const values = [...options.matchAll(/<option value="([^"]+)"/g)].map((item) => item[1]);
    return first?.[1] || values[0] || 'pièce';
  }

  function optionsMarkup(options, selected) {
    return options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${selected === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('');
  }

  function manualUnitOptions(selected, designation = '') {
    const name = designation.toLocaleLowerCase('fr');
    let units = [['pièce','pièce'], ['lot','lot']];
    if (/sable|gravier|terre|remblai|latérite/.test(name)) units = [['m³','m³'], ['camion','camion'], ['brouette','brouette'], ['sac','sac'], ['t','t']];
    else if (/ciment/.test(name)) units = [['sac','sac'], ['kg','kg'], ['t','t']];
    else if (/eau|carburant|gasoil|essence/.test(name)) units = [['L','L'], ['m³','m³']];
    else if (/clou|pointe/.test(name)) units = [['paquet','paquet'], ['kg','kg'], ['lot','lot']];
    else if (/bois|planche|chevron|panne|liteau/.test(name)) units = [['pièce','pièce'], ['m','m'], ['m³','m³']];
    else if (/tôle|couverture|surface|peinture|enduit/.test(name)) units = [['m²','m²'], ['rouleau','rouleau'], ['L','L']];
    else if (/fer|acier|armature|barre/.test(name)) units = [['barre','barre'], ['kg','kg'], ['t','t']];
    else if (/heure|journée|main.d.œuvre|salaire|ouvrier|technicien|ingénieur|manœuvre/.test(name)) units = [['heure','heure'], ['jour-personne','jour-personne'], ['mois-personne','mois-personne']];
    else if (/longueur|canalisation|câble/.test(name)) units = [['m','m'], ['pièce','pièce'], ['lot','lot']];
    const selectedUnit = units.some(([value]) => value === selected) ? selected : units[0][0];
    return `${optionsMarkup(units, selectedUnit)}<option value="custom" ${selected === 'custom' ? 'selected' : ''}>Autre unité manuelle…</option>`;
  }

  function assistedUnits(baseUnit) {
    if (baseUnit === 'kg') return [['kg', 'kg'], ['g', 'g'], ['t', 't'], ['sac', 'sac']];
    if (baseUnit === 'm³') return [['m³', 'm³'], ['L', 'L']];
    if (baseUnit === 'L') return [['L', 'L'], ['m³', 'm³']];
    if (baseUnit === 'm²') return [['m²', 'm²'], ['cm²', 'cm²']];
    if (baseUnit === 'm') return [['m', 'm'], ['cm', 'cm'], ['mm', 'mm']];
    return [['pièce', 'pièce']];
  }

  function convertAssistedQuantity(item, targetUnit, bagMassKg) {
    const amount = item.baseQuantity;
    const base = item.baseUnit;
    if (base === 'kg') {
      if (targetUnit === 'kg') return amount;
      if (targetUnit === 'g') return amount * 1000;
      if (targetUnit === 't') return amount / 1000;
      if (targetUnit === 'sac') return amount / parseNumber(bagMassKg);
    }
    if (base === 'm³' && targetUnit === 'L') return amount * 1000;
    if (base === 'L' && targetUnit === 'm³') return amount / 1000;
    if (base === 'm²' && targetUnit === 'cm²') return amount * 10000;
    if (base === 'm' && targetUnit === 'cm') return amount * 100;
    if (base === 'm' && targetUnit === 'mm') return amount * 1000;
    return amount;
  }

  function renderManualItems(section) {
    const items = activeMaterialItems(section);
    if (!items.length) return `<p class="empty-lines">Ajoutez les matériaux, la main-d’œuvre ou le matériel de cette section.</p>`;
    return `<div class="resource-list" aria-label="Ressources de la section">${items.map(([item, index]) => renderManualResourceRow(item, index)).join('')}</div>`;
  }

  function activeMaterialItems(section) {
    return section.items.map((item, index) => [item, index]).filter(([item]) => !item.acquisition || section.kind !== 'masonry' || item.acquisition === section.blockMethod);
  }

  function renderManualResourceRow(item, index) {
    const displayedDesignation = item.catalogDesignation ? displayDesignation(translateValue(item.designation)) : item.designation;
    return `
      <div class="resource-row" data-line-index="${index}">
        <label class="resource-designation"><span>Désignation</span><input data-line-field="designation" value="${escapeHtml(displayedDesignation)}" maxlength="140" placeholder="Ex. Ciment, sable, fer à béton"></label>
        <label><span>Quantité</span><input data-line-field="quantity" data-digits-only type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${escapeHtml(item.quantity)}"></label>
        <label><span>Unité</span><select data-line-field="unit">${manualUnitOptions(item.unit, item.catalogDesignation ? item.designation : displayedDesignation)}</select></label>
        <label class="custom-unit ${item.unit === 'custom' ? '' : 'is-hidden'}"><span>Précisez</span><input data-line-field="customUnit" maxlength="40" value="${escapeHtml(item.customUnit)}" placeholder="Votre unité"></label>
        <label><span>Prix unitaire (${project.currency})</span><input data-line-field="unitPrice" data-digits-only type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${escapeHtml(item.unitPrice)}"></label>
        <output class="resource-total" data-line-total>${lineTotalDisplay(item)}</output>
        <button class="icon-button remove-line" type="button" data-remove-line="${index}" aria-label="Supprimer cette ligne">×</button>
        <label class="resource-specification"><span>Précision technique (facultatif)</span><input data-line-field="precision" maxlength="120" value="${escapeHtml(item.precision || '')}" placeholder="Dimensions, diamètre, dosage ou référence des plans"></label>
      </div>`;
  }

  function renderAssistedItems(section) {
    const items = activeMaterialItems(section);
    if (!items.length) return `<p class="empty-lines">Renseignez les paramètres et calculez les quantités à partir des plans et du dosage validé.</p>`;
    return `<div class="resource-list assisted-resource-list" aria-label="Ressources calculées et saisies">${items.map(([item, index]) => item.assisted ? `
      <div class="resource-row" data-line-index="${index}">
        <label class="resource-designation"><span>Désignation</span><input data-line-field="designation" value="${escapeHtml(item.catalogDesignation ? translateValue(item.designation) : item.designation)}" maxlength="140"></label>
        <label><span>Quantité calculée</span><input data-line-field="quantity" type="number" min="0" step="any" value="${escapeHtml(item.quantity)}" readonly></label>
        <label><span>Unité standard</span><select data-assisted-unit>${optionsMarkup(assistedUnits(item.baseUnit), item.unit)}</select></label>
        <label><span>Prix unitaire (${project.currency})</span><input data-line-field="unitPrice" type="number" min="0" step="any" inputmode="decimal" value="${escapeHtml(item.unitPrice)}"></label>
        <output class="resource-total" data-line-total>${lineTotalDisplay(item)}</output>
        <button class="icon-button remove-line" type="button" data-remove-line="${index}" aria-label="Supprimer cette ligne">×</button>
      </div>` : renderManualResourceRow(item, index)).join('')}</div>`;
  }

  function lineTotalDisplay(item) {
    const quantity = parseNumber(item.quantity);
    const price = parseNumber(item.unitPrice);
    return Number.isFinite(quantity) && quantity > 0 && Number.isFinite(price) && price >= 0
      ? formatCurrency(quoteMath.lineTotal(quantity, price))
      : '';
  }

  const quoteMath = window.QUANTIX_CALCULATIONS;

  function renderConcreteAssistant(section) {
    const params = section.params;
    return `<div class="assistant-panel">
      <div class="field-grid quote-dimensions">
        <div class="field"><label for="concrete-length">Longueur (m) <span aria-hidden="true">*</span></label><input id="concrete-length" data-param="length" type="number" min="0" step="any" inputmode="decimal" value="${escapeHtml(params.length ?? '')}"></div>
        <div class="field"><label for="concrete-width">Largeur (m) <span aria-hidden="true">*</span></label><input id="concrete-width" data-param="width" type="number" min="0" step="any" inputmode="decimal" value="${escapeHtml(params.width ?? '')}"></div>
        <div class="field"><label for="concrete-thickness">Épaisseur (m) <span aria-hidden="true">*</span></label><input id="concrete-thickness" data-param="thickness" type="number" min="0" step="any" inputmode="decimal" value="${escapeHtml(params.thickness ?? '')}"></div>
      </div>
      <fieldset class="recipe-fields"><legend>Dosage du béton validé pour ce projet</legend><p>Renseignez les quantités de composants par m³ selon les plans ou le dosage retenu. Aucun dosage n’est prérempli.</p>
        <div class="field-grid">
          <div class="field"><label for="recipe-cement">Ciment (kg/m³) <span aria-hidden="true">*</span></label><input id="recipe-cement" data-param="cementKgPerM3" type="number" min="0" step="any" inputmode="decimal" value="${escapeHtml(params.cementKgPerM3 ?? '')}"></div>
          <div class="field"><label for="recipe-sand">Sable (m³/m³) <span aria-hidden="true">*</span></label><input id="recipe-sand" data-param="sandM3PerM3" type="number" min="0" step="any" inputmode="decimal" value="${escapeHtml(params.sandM3PerM3 ?? '')}"></div>
          <div class="field"><label for="recipe-gravel">Gravier (m³/m³) <span aria-hidden="true">*</span></label><input id="recipe-gravel" data-param="gravelM3PerM3" type="number" min="0" step="any" inputmode="decimal" value="${escapeHtml(params.gravelM3PerM3 ?? '')}"></div>
          <div class="field"><label for="recipe-water">Eau (L/m³) <span aria-hidden="true">*</span></label><input id="recipe-water" data-param="waterLPerM3" type="number" min="0" step="any" inputmode="decimal" value="${escapeHtml(params.waterLPerM3 ?? '')}"></div>
        </div>
        <div class="field bag-mass-field"><label for="cement-bag-mass">Masse d’un sac de ciment (kg), si l’unité « sac » est choisie</label><input id="cement-bag-mass" data-param="cementBagMassKg" type="number" min="0" step="any" inputmode="decimal" value="${escapeHtml(params.cementBagMassKg ?? '')}" placeholder="À renseigner pour convertir en sacs"></div>
      </fieldset>
      <p class="calculation-note">Le calcul porte sur les dimensions et coefficients saisis, sans marge de perte. Il ne dimensionne pas l’ouvrage et ne choisit pas le dosage.</p>
      <p class="field-error" data-assistant-error aria-live="polite"></p>
      <button class="button button-secondary" type="button" data-calculate-concrete>Calculer les quantités</button>
    </div>`;
  }

  function renderMasonryAssistant(section) {
    const params = section.params;
    const fabricationFields = section.blockMethod === 'fabricated' ? `
      <div class="field-grid">
        <div class="field"><label for="block-cement">Ciment par bloc fabriqué (kg) <span aria-hidden="true">*</span></label><input id="block-cement" data-param="cementKgPerBlock" type="number" min="0" step="any" value="${escapeHtml(params.cementKgPerBlock ?? '')}"></div>
        <div class="field"><label for="block-sand">Sable par bloc fabriqué (m³) <span aria-hidden="true">*</span></label><input id="block-sand" data-param="sandM3PerBlock" type="number" min="0" step="any" value="${escapeHtml(params.sandM3PerBlock ?? '')}"></div>
        <div class="field"><label for="block-water">Eau par bloc fabriqué (L) <span aria-hidden="true">*</span></label><input id="block-water" data-param="waterLPerBlock" type="number" min="0" step="any" value="${escapeHtml(params.waterLPerBlock ?? '')}"></div>
      </div>` : '';
    return `<div class="assistant-panel">
      <div class="field-grid">
        ${renderBlockTypeFields(section, 'block-type', 'block-type-other')}
        <div class="field"><label for="block-method">Mode d’approvisionnement <span aria-hidden="true">*</span></label><select id="block-method" data-section-field="blockMethod"><option value="purchased" ${section.blockMethod === 'purchased' ? 'selected' : ''}>Acheté</option><option value="fabricated" ${section.blockMethod === 'fabricated' ? 'selected' : ''}>Fabriqué sur le chantier</option></select></div>
      </div>
      <div class="field-grid quote-dimensions">
        <div class="field"><label for="wall-length">Longueur du mur (m) <span aria-hidden="true">*</span></label><input id="wall-length" data-param="wallLength" type="number" min="0" step="any" value="${escapeHtml(params.wallLength ?? '')}"></div>
        <div class="field"><label for="wall-height">Hauteur du mur (m) <span aria-hidden="true">*</span></label><input id="wall-height" data-param="wallHeight" type="number" min="0" step="any" value="${escapeHtml(params.wallHeight ?? '')}"></div>
        <div class="field"><label for="openings-area">Surface des ouvertures à déduire (m²)</label><input id="openings-area" data-param="openingsArea" type="number" min="0" step="any" value="${escapeHtml(params.openingsArea ?? '0')}"></div>
        <div class="field"><label for="block-length">Longueur de face du bloc (m) <span aria-hidden="true">*</span></label><input id="block-length" data-param="blockLength" type="number" min="0" step="any" value="${escapeHtml(params.blockLength ?? '')}"></div>
        <div class="field"><label for="block-height-value">Hauteur de face du bloc (m) <span aria-hidden="true">*</span></label><input id="block-height-value" data-param="blockHeight" type="number" min="0" step="any" value="${escapeHtml(params.blockHeight ?? '')}"></div>
      </div>
      ${fabricationFields}
      <p class="calculation-note">Le nombre calculé est une surface nette divisée par la face du bloc, sans joints, pertes, coupes ni réserve. Les matériaux de fabrication utilisent les coefficients saisis.</p>
      <p class="field-error" data-assistant-error aria-live="polite"></p>
      <button class="button button-secondary" type="button" data-calculate-masonry>Calculer les quantités</button>
    </div>`;
  }

  function renderBlockTypeFields(section, selectId, otherId) {
    const options = [
      ['', 'Choisir un type'],
      ['Parpaing creux', 'Parpaing creux'],
      ['Parpaing plein', 'Parpaing plein'],
      ['Bloc de terre comprimée (BTC)', 'Bloc de terre comprimée (BTC)'],
      ['Autre', 'Autre']
    ];
    return `<div class="field"><label for="${selectId}">Type de bloc <span aria-hidden="true">*</span></label><select id="${selectId}" data-section-field="blockType" required>${optionsMarkup(options, section.blockType)}</select></div>
      <div class="field block-type-other" ${section.blockType === 'Autre' ? '' : 'hidden'}><label for="${otherId}">Précisez le type et ses dimensions <span aria-hidden="true">*</span></label><input id="${otherId}" data-section-field="blockTypeOther" value="${escapeHtml(section.blockTypeOther)}" maxlength="120" placeholder="Type de bloc et format"></div>`;
  }

  function renderGeneralAssistant(section) {
    const params = section.params;
    const measure = params.measure || 'volume';
    const dimensions = measure === 'volume'
      ? `<div class="field-grid quote-dimensions"><div class="field"><label for="measure-length">Longueur (m)</label><input id="measure-length" data-param="measureLength" type="number" min="0" step="any" value="${escapeHtml(params.measureLength ?? '')}"></div><div class="field"><label for="measure-width">Largeur (m)</label><input id="measure-width" data-param="measureWidth" type="number" min="0" step="any" value="${escapeHtml(params.measureWidth ?? '')}"></div><div class="field"><label for="measure-height">Épaisseur / hauteur (m)</label><input id="measure-height" data-param="measureHeight" type="number" min="0" step="any" value="${escapeHtml(params.measureHeight ?? '')}"></div></div>`
      : measure === 'area'
        ? `<div class="field-grid quote-dimensions"><div class="field"><label for="measure-length">Longueur (m)</label><input id="measure-length" data-param="measureLength" type="number" min="0" step="any" value="${escapeHtml(params.measureLength ?? '')}"></div><div class="field"><label for="measure-width">Largeur / hauteur (m)</label><input id="measure-width" data-param="measureWidth" type="number" min="0" step="any" value="${escapeHtml(params.measureWidth ?? '')}"></div></div>`
        : `<div class="field-grid quote-dimensions"><div class="field"><label for="measure-value">${measure === 'length' ? 'Longueur (m)' : 'Nombre d’unités'}</label><input id="measure-value" data-param="measureValue" type="number" min="0" step="any" value="${escapeHtml(params.measureValue ?? '')}"></div></div>`;
    return `<div class="assistant-panel">
      <div class="field-grid">
        <div class="field"><label for="measure-designation">Désignation à mesurer</label><input id="measure-designation" data-param="measureDesignation" value="${escapeHtml(params.measureDesignation ?? '')}" placeholder="Ex. béton de propreté"></div>
        <div class="field"><label for="measure-type">Méthode de calcul</label><select id="measure-type" data-param="measure"><option value="volume" ${measure === 'volume' ? 'selected' : ''}>Volume — longueur × largeur × hauteur</option><option value="area" ${measure === 'area' ? 'selected' : ''}>Surface — longueur × largeur</option><option value="length" ${measure === 'length' ? 'selected' : ''}>Longueur</option><option value="count" ${measure === 'count' ? 'selected' : ''}>Nombre d’unités</option></select></div>
      </div>
      ${dimensions}
      <p class="calculation-note">Cette formule calcule une quantité géométrique à partir de vos mesures. Elle ne calcule pas un dosage de matériau ni un dimensionnement structurel.</p>
      <p class="field-error" data-assistant-error aria-live="polite"></p>
      <button class="button button-secondary" type="button" data-calculate-general>Calculer la quantité</button>
    </div>`;
  }

  function renderQuoteSection(section, index) {
    const sectionCount = quote.sections.length;
    const detailForm = section.kind === 'equipment' ? renderEquipmentItems(section) : renderManualItems(section);
    return `<section class="quote-section-card ${section.incompleteHighlight ? 'is-incomplete' : ''}">
      <div class="quote-section-heading"><div><p class="eyebrow">Section ${index + 1} sur ${sectionCount}</p><h2>${escapeHtml(section.title || `Section ${index + 1}`)}</h2></div>
        ${sectionCount > 1 && !['equipment','labor'].includes(section.id) ? `<button class="button button-quiet" type="button" data-remove-section="${index}">Supprimer cette section</button>` : ''}</div>
      <div class="field-grid section-fields">
        <div class="field"><label for="section-title">Nom de la section <span aria-hidden="true">*</span></label><input id="section-title" data-section-field="title" maxlength="120" value="${escapeHtml(section.title)}" placeholder="Ex. Béton armé — semelle filante"></div>
        ${section.kind !== 'equipment' ? `<div class="field"><label for="section-kind">Nature des travaux</label><select id="section-kind" data-section-field="workCategory"><option value="concrete" ${(section.workCategory || section.kind) === 'concrete' ? 'selected' : ''}>Béton / béton armé</option><option value="masonry" ${(section.workCategory || section.kind) === 'masonry' ? 'selected' : ''}>Maçonnerie / blocs</option><option value="structure" ${section.workCategory === 'structure' ? 'selected' : ''}>Structure / armatures</option><option value="earthwork" ${section.workCategory === 'earthwork' ? 'selected' : ''}>Terrassement / couche de forme</option><option value="finishing" ${section.workCategory === 'finishing' ? 'selected' : ''}>Protection / étanchéité</option><option value="other" ${section.workCategory === 'other' ? 'selected' : ''}>Autre fourniture ou prestation</option></select></div>` : ''}
        <div class="field"><label for="section-contingency">Imprévus de cette section (%) <span aria-hidden="true">*</span></label><input id="section-contingency" data-section-field="contingency" type="number" min="0.1" max="50" step="0.1" value="${escapeHtml(section.contingency)}"></div>
      </div>
      ${section.kind !== 'equipment' ? `<div class="mode-switch" role="group" aria-label="Mode de calcul"><button type="button" class="mode-button is-active" data-mode="manual" aria-pressed="true">Saisie manuelle</button></div>
      ${section.kind === 'masonry' ? `<div class="masonry-method">${renderBlockTypeFields(section, 'block-type-manual', 'block-type-other-manual')}<div class="field"><label for="block-method-manual">Mode d’approvisionnement</label><select id="block-method-manual" data-section-field="blockMethod"><option value="purchased" ${section.blockMethod === 'purchased' ? 'selected' : ''}>Acheté</option><option value="fabricated" ${section.blockMethod === 'fabricated' ? 'selected' : ''}>Fabriqué sur le chantier</option></select></div></div>` : ''}` : `<p class="mode-help">Pour chaque équipement, indiquez s’il est déjà disponible, à acheter, à louer ou non utilisé.</p>`}
      ${detailForm}
      ${section.kind !== 'equipment' ? '<button class="button button-secondary add-line" type="button" data-add-line>Ajouter une ligne de ressource</button>' : ''}
      ${section.kind !== 'equipment' ? '<p class="manual-entry-note">Saisissez chaque matériau, quantité, unité et prix unitaire. Les lignes non retenues peuvent rester vides ou être supprimées.</p>' : ''}
      <div class="section-total-panel"><div><span>Sous-total de la section</span><strong data-subtotal>${sectionTotalMarkup(section, 'subtotal')}</strong></div><div><span>Imprévus · ${formatNumber(Number(section.contingency), 1)} %</span><strong data-contingency-total>${sectionTotalMarkup(section, 'contingency')}</strong></div><div class="section-grand-total"><span>Total de la section</span><strong data-section-total>${sectionTotalMarkup(section, 'total')}</strong></div></div>
    </section>`;
  }

  function isApplicable(item) {
    const list = item.applicable_a || ['tous'];
    return list.includes('tous') || list.includes(project.buildingType) || list.includes(project.buildingTypeOther);
  }

  function renderEquipmentItems(section) {
    const items = section.equipmentItems.filter(isApplicable);
    return `<div class="equipment-actions"><button class="button button-secondary" type="button" data-all-available>Tout marquer « Déjà disponible »</button><button class="button button-secondary" type="button" data-add-equipment>Ajouter un matériel</button></div><div class="equipment-list">${items.map((item) => {
      const index = section.equipmentItems.indexOf(item);
      const costFields = item.status === 'purchase' ? `<label><span>Quantité (${escapeHtml(translateValue(item.unit))})</span><input data-equipment-field="quantity" data-digits-only type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${escapeHtml(item.quantity)}"></label><label><span>Prix unitaire (${project.currency})</span><input data-equipment-field="unitPrice" data-digits-only type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${escapeHtml(item.unitPrice)}"></label>`
        : item.status === 'rent' ? `<label><span>Durée (${escapeHtml(translateValue(item.rental_unit || 'jour'))})</span><input data-equipment-field="duration" data-digits-only type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${escapeHtml(item.duration)}"></label><label><span>Prix de location par ${escapeHtml(translateValue(item.rental_unit || 'jour'))} (${project.currency})</span><input data-equipment-field="unitPrice" data-digits-only type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${escapeHtml(item.unitPrice)}"></label>` : '';
      const amount = item.status === 'rent' ? parseNumber(item.duration) : parseNumber(item.quantity);
      const total = Number.isFinite(amount) && Number.isFinite(parseNumber(item.unitPrice)) ? formatCurrency(quoteMath.lineTotal(amount, parseNumber(item.unitPrice))) : '';
      return `<div class="equipment-row" data-equipment-index="${index}"><div>${item.custom ? `<label><span>Désignation</span><input data-equipment-field="designation" value="${escapeHtml(item.designation)}" maxlength="140" placeholder="Matériel à ajouter"></label><label><span>Unité</span><input data-equipment-field="unit" value="${escapeHtml(item.unit)}" maxlength="30" placeholder="pièce, lot, jour…"></label>` : `<b>${escapeHtml(displayDesignation(translateValue(item.designation)))}</b><small>Unité : ${escapeHtml(translateValue(item.unit))}</small>`}</div><label><span>Statut</span><select class="${section.incompleteHighlight && !item.status ? 'is-missing' : ''}" data-equipment-field="status" required><option value="">Non défini</option><option value="available" ${item.status === 'available' ? 'selected' : ''}>Déjà disponible</option><option value="purchase" ${item.status === 'purchase' ? 'selected' : ''}>À acheter</option><option value="rent" ${item.status === 'rent' ? 'selected' : ''}>À louer</option><option value="unused" ${item.status === 'unused' ? 'selected' : ''}>Ne sera pas utilisé</option></select></label>${costFields}<output data-equipment-total>${total}</output>${item.custom ? `<button class="icon-button" type="button" data-remove-equipment="${index}" aria-label="Supprimer ce matériel">×</button>` : ''}</div>`;
    }).join('')}</div>${items.length ? '' : '<p class="empty-lines">Aucun équipement de cette liste ne s’applique au type de bâtiment choisi.</p>'}`;
  }

  function sectionTotalMarkup(section, key) {
    try { return formatCurrency(quoteMath.sectionTotals(sectionLines(section), section.contingency)[key]); }
    catch { return '—'; }
  }

  function sectionLines(section) {
    const materials = activeMaterialItems(section).map(([item]) => item);
    const equipment = (section.equipmentItems || []).filter((item) => item.status === 'purchase' || item.status === 'rent').map((item) => ({
      designation: item.designation,
      catalogDesignation: !item.custom,
      quantity: item.status === 'rent' ? item.duration : item.quantity,
      unit: item.status === 'rent' ? (item.rental_unit || 'jour') : item.unit,
      unitPrice: item.unitPrice
    }));
    return [...materials, ...equipment];
  }

  function renderQuote() {
    if (!quote.sections.length || quote.stage !== project.stage) activateQuote(project.stage);
    quote.currentSection = Math.min(quote.currentSection, quote.sections.length - 1);
    const section = quote.sections[quote.currentSection];
    app.innerHTML = `
      <section class="page-shell form-screen quote-screen" aria-labelledby="quote-title" data-flow="QBT-FLOW-06">
      ${stepProgress(5, 'Devis')}
        ${heading('Devis détaillé', `Chiffrez : ${project.stage}`, 'Détaillez les ressources et les coûts, section par section.')}
        <form class="form-card quote-form" novalidate>
          <div class="quote-context"><b data-user-content>${escapeHtml(project.name)}</b><span>${project.buildingType === 'Autre' ? `<span data-user-content>${escapeHtml(project.buildingTypeOther)}</span>` : escapeHtml(project.buildingType)} · ${project.currency}</span>${project.location ? `<small data-user-content>${escapeHtml(project.location)}</small>` : ''}</div>
          ${detourReturnPending ? `<aside class="resume-quote-notice" role="status"><span>Vous préparez le devis de l’étape précédente avant de revenir à « ${escapeHtml(resumeStage)} » après l’enregistrement.</span></aside>` : ''}
          ${quote.sections[0]?.id === 'equipment' ? '<p class="catalog-intro">Liste de contrôle indicative. Adaptez-la aux plans et supprimez les postes non retenus.</p>' : ''}
          ${quote.sections.length > 1 ? `<nav class="section-tabs" aria-label="Sections du devis">${quote.sections.map((item, index) => `<button type="button" class="section-tab ${index === quote.currentSection ? 'is-active' : ''} ${item.incompleteHighlight ? 'is-incomplete' : ''}" data-section-index="${index}">Section ${index + 1} · ${escapeHtml(item.title || 'À nommer')}</button>`).join('')}</nav>` : ''}
          ${renderQuoteSection(section, quote.currentSection)}
          ${quote.confirmIncomplete ? `<aside class="local-notice incomplete-confirm" role="alert"><span class="notice-icon" aria-hidden="true">i</span><span><b>${language==='en'?'Some sections are unfinished. Their current totals will not include missing costs. Continue to the summary?':'Certaines sections restent incomplètes. Les éléments manquants ne seront pas inclus dans le total actuel. Continuer vers la synthèse ?'}</b></span><span class="incomplete-actions"><button type="button" class="button button-primary" data-continue-incomplete>${language==='en'?'Continue anyway':'Continuer quand même'}</button><button type="button" class="button button-secondary" data-review-incomplete>${language==='en'?'Review sections':'Revoir les sections'}</button></span></aside>` : ''}
          <div class="quote-lower-actions"><button class="button button-secondary" type="button" data-add-section>Ajouter une section</button><span class="field-help">Unité personnalisée disponible uniquement en saisie manuelle.</span></div>
          <p class="form-feedback" data-quote-feedback role="status" aria-live="polite" tabindex="-1">${quote.saved ? 'Le détail des sections est prêt pour la prochaine étape du parcours.' : ''}</p>
          <p class="phase-note">Ce détail reste dans la session en cours. L’enregistrement durable et la synthèse seront traités dans leurs étapes dédiées.</p>
          <div class="form-actions"><button class="button button-quiet" type="button" data-back>Retour</button><button class="button button-primary" type="button" data-save-quote>Synthèse <span aria-hidden="true">→</span></button></div>
        </form>
      </section>`;
    bindQuoteForm();
  }

  function updateAssistedItemQuantity(item, section) {
    const quantity = convertAssistedQuantity(item, item.unit, section.params.cementBagMassKg);
    item.quantity = Number.isFinite(quantity) ? quantity : '';
  }

  function updateQuoteTotals() {
    const section = quote.sections[quote.currentSection];
    if (!section) return;
    let totals;
    try { totals = quoteMath.sectionTotals(sectionLines(section), section.contingency); }
    catch { totals = null; }
    const subtotal = app.querySelector('[data-subtotal]');
    const contingency = app.querySelector('[data-contingency-total]');
    const total = app.querySelector('[data-section-total]');
    if (subtotal) subtotal.textContent = totals ? formatCurrency(totals.subtotal) : '—';
    if (contingency) contingency.textContent = totals ? formatCurrency(totals.contingency) : '—';
    if (total) total.textContent = totals ? formatCurrency(totals.total) : '';
    section.items.forEach((item, index) => {
      const row = app.querySelector(`[data-line-index="${index}"]`);
      const output = row?.querySelector('[data-line-total]');
      if (output) output.textContent = lineTotalDisplay(item);
      const quantity = row?.querySelector('[data-line-field="quantity"]');
      if (quantity?.readOnly) quantity.value = item.quantity === '' ? '' : item.quantity;
    });
    section.equipmentItems.forEach((item, index) => {
      const row = app.querySelector(`[data-equipment-index="${index}"]`);
      const total = row?.querySelector('[data-equipment-total]');
      const amount = item.status === 'rent' ? parseNumber(item.duration) : parseNumber(item.quantity);
      const unitPrice = parseNumber(item.unitPrice);
      if (total) total.textContent = Number.isFinite(amount) && amount > 0 && Number.isFinite(unitPrice) ? formatCurrency(quoteMath.lineTotal(amount, unitPrice)) : '';
    });
  }

  function quoteSummary() {
    const rows = [];
    const sections = [];
    let subtotal = 0;
    let contingency = 0;
    for (const section of quote.sections) {
      const totals = quoteMath.sectionTotals(sectionLines(section), section.contingency);
      subtotal += totals.subtotal;
      contingency += totals.contingency;
      const sectionRows = [];
      const lines = sectionLines(section);
      for (const line of lines) {
        const quantity = parseNumber(line.quantity);
        const unitPrice = parseNumber(line.unitPrice);
        if (!line.designation?.trim?.() || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) continue;
        sectionRows.push({ section: section.title, designation: line.catalogDesignation ? displayDesignation(translateValue(line.designation)) : line.designation, catalogDesignation: Boolean(line.catalogDesignation), quantity, unit: translateValue(line.unit === 'custom' ? line.customUnit : line.unit), unitPrice, total: quoteMath.lineTotal(quantity, unitPrice) });
      }
      rows.push(...sectionRows);
      sections.push({ id: section.id, kind: section.id === 'equipment' ? 'equipment' : section.id === 'labor' ? 'labor' : 'materials', title: section.title, catalogTitle: section.catalogTitle, rows: sectionRows, rate: Number(section.contingency), subtotal: totals.subtotal, contingency: totals.contingency, total: totals.total });
    }
    return { rows, sections, subtotal, contingency, total: subtotal + contingency };
  }

  function renderSummaryCharts(summary) {
    const groups = exportsApi.chartData(summary, language);
    if (!groups.length) return '';
    const maxValue = Math.max(...groups.map((group) => group.value), 1);
    const width = Math.max(560, groups.length * 72);
    const chartHeight = 286;
    const plotTop = 28;
    const baseline = 202;
    const plotHeight = baseline - plotTop;
    const bars = groups.map((group, index) => {
      const center = 48 + index * 72;
      const height = Math.max(2, group.value / maxValue * plotHeight);
      return `<g><title>${escapeHtml(group.label)} · ${escapeHtml(formatCurrency(group.value))}</title><rect x="${center - 17}" y="${baseline - height}" width="34" height="${height}" rx="4" fill="${group.color}"/><text x="${center}" y="${baseline - height - 7}" text-anchor="middle" class="chart-value">${escapeHtml(formatNumber(group.value, 0))}</text><text x="${center}" y="${baseline + 12}" transform="rotate(-42 ${center} ${baseline + 12})" text-anchor="end" class="chart-label">${escapeHtml(group.label)}</text></g>`;
    }).join('');
    const circumference = 2 * Math.PI * 74;
    let offset = 0;
    const slices = groups.map((group) => {
      const length = summary.total > 0 ? group.value / summary.total * circumference : 0;
      const markup = `<circle cx="120" cy="120" r="74" fill="none" stroke="${group.color}" stroke-width="32" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}"/>`;
      offset += length;
      return markup;
    }).join('');
    const legend = groups.map((group) => `<li><i style="--chart-color:${group.color}"></i><span>${escapeHtml(group.label)}</span><b>${escapeHtml(formatNumber(summary.total ? group.value / summary.total * 100 : 0, 1))}%</b></li>`).join('');
    return `<section class="summary-charts" aria-label="${language === 'en' ? 'Estimate charts' : 'Graphiques du devis'}"><article class="chart-card"><h2>Répartition des coûts par matériau</h2><p>${escapeHtml('Les imprévus de chaque section sont répartis au prorata entre ses catégories de coût.')}</p><div class="bar-chart-scroll"><svg class="bar-chart" style="--chart-width:${width}px" viewBox="0 0 ${width} ${chartHeight}" role="img" aria-label="${language === 'en' ? 'Material costs on the horizontal axis and accumulated amounts on the vertical axis' : 'Matériaux en abscisse et montants cumulés en ordonnée'}"><line x1="28" y1="${plotTop}" x2="${width - 16}" y2="${plotTop}"/><line x1="28" y1="${baseline}" x2="${width - 16}" y2="${baseline}"/>${bars}<text x="8" y="18" class="chart-axis-label">${escapeHtml(project.currency)}</text></svg></div></article><article class="chart-card pie-chart-card"><h2>Part du total estimatif</h2><div class="pie-chart-content"><svg class="pie-chart" viewBox="0 0 240 240" role="img" aria-label="${language === 'en' ? 'Percentage share of each cost category in the estimate total' : 'Pourcentage de chaque catégorie dans le total du devis'}"><g transform="rotate(-90 120 120)">${slices}</g><text x="120" y="117" text-anchor="middle" class="pie-total">${escapeHtml(formatCurrency(summary.total))}</text><text x="120" y="137" text-anchor="middle" class="pie-total-label">Total</text></svg><ul class="chart-legend">${legend}</ul></div></article></section>`;
  }

  function renderSummary() {
    const summary = quoteSummary();
    const rows = summary.sections.map((section) => `<tr class="summary-section-heading"><th colspan="4" ${section.catalogTitle ? "" : "data-user-content"}>${escapeHtml(section.title)}</th></tr>${section.rows.map((row) => `<tr><td ${row.catalogDesignation ? "" : "data-user-content"}>${escapeHtml(row.designation)}</td><td>${formatNumber(row.quantity)} ${escapeHtml(row.unit || '')}</td><td>${formatCurrency(row.unitPrice)}</td><td>${formatCurrency(row.total)}</td></tr>`).join('')}<tr class="summary-subtotal"><td colspan="3">Sous-total de la section</td><td>${formatCurrency(section.subtotal)}</td></tr><tr><td colspan="3">Imprévus · ${formatNumber(section.rate, 1)} %</td><td>${formatCurrency(section.contingency)}</td></tr><tr class="summary-section-total"><td colspan="3">Total de la section</td><td>${formatCurrency(section.total)}</td></tr>`).join('');
    const charts = renderSummaryCharts(summary);
    app.innerHTML = `<section class="page-shell form-screen summary-screen" aria-labelledby="summary-title" data-flow="QBT-FLOW-07">
      ${topBack()}${demoMode ? demoNoticeMarkup() : ''}<h1 id="summary-title">Récapitulatif du devis</h1>
      <p class="summary-intro"><span data-user-content>${escapeHtml(project.name)}</span> · ${escapeHtml(quote.stage)} · ${project.currency}</p>
      ${charts}
      <section class="form-card summary-card"><div class="summary-table-wrap"><table class="summary-table"><thead><tr><th>Désignation</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th></tr></thead><tbody>${summary.rows.length ? rows : '<tr><td colspan="4">Aucun coût saisi</td></tr>'}</tbody></table></div>
        <dl class="summary-totals"><div><dt>Sous-total</dt><dd>${formatCurrency(summary.subtotal)}</dd></div><div><dt>Total des imprévus</dt><dd>${formatCurrency(summary.contingency)}</dd></div><div class="summary-total"><dt>Total estimatif</dt><dd>${formatCurrency(summary.total)}</dd></div></dl>
        <div class="form-actions"><button class="button button-quiet" type="button" data-edit-quote>Modifier le devis</button><button class="button button-primary" type="button" data-save-screen>Enregistrer le devis <span aria-hidden="true">→</span></button></div></section></section>`;
    app.querySelector('[data-edit-quote]').addEventListener('click', () => { screen = 'quote'; render(); app.focus(); });
    app.querySelector('[data-save-screen]').addEventListener('click', () => { screen = 'save'; render(); app.focus(); });
  }

  function backupData() {
    return JSON.parse(JSON.stringify({ contributor, project, quote, stageChecks: Array.from(stageChecks.entries()), exportLanguage: language, savedAt: new Date().toISOString() }));
  }

  function localizedExportPayload() {
    const localizedContributor = { ...contributor, role: translateValue(contributor.role) };
    const localizedProject = { ...project, buildingType: translateValue(project.buildingType) };
    const localizedQuote = { ...quote, stage: translateValue(quote.stage) };
    const summary = quoteSummary();
    summary.sections = summary.sections.map((section) => ({ ...section, title: section.catalogTitle ? translateValue(section.title) : section.title, rows: section.rows.map((row) => ({ ...row, designation: row.catalogDesignation ? translateValue(row.designation) : row.designation, unit: translateValue(row.unit) })) }));
    return { contributor: localizedContributor, project: localizedProject, quote: localizedQuote, summary };
  }

  function renderSave() {
    const protectedFile = app.querySelector('[name="protectBackup"]')?.checked || false;
    const jsonReady = { value: false };
    const summary = quoteSummary();
    const exportName = (project.name || 'quantix-btp').normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'quantix-btp';
    app.innerHTML = `<section class="page-shell form-screen save-screen" aria-labelledby="save-title" data-flow="QBT-FLOW-08">
      ${topBack()}${demoMode ? demoNoticeMarkup() : ''}<h1 id="save-title">Enregistrement et export</h1>
      <p class="summary-intro">Sauvegardez un fichier JSON réimportable sur votre appareil.</p>
      <section class="form-card save-card"><div class="save-summary"><b data-user-content>${escapeHtml(project.name)}</b><span>${escapeHtml(quote.stage)} · ${language === 'en' ? 'Estimated total' : 'Total estimatif'} : ${formatCurrency(summary.total)}</span></div>
        <label class="check-row"><input type="checkbox" name="protectBackup" ${protectedFile ? 'checked' : ''}><span>Protéger le fichier par mot de passe (facultatif)</span></label>
        <div class="field-grid password-fields" data-password-fields ${protectedFile ? '' : 'hidden'}>
          <div class="field"><label for="backup-password">Mot de passe <span aria-hidden="true">*</span></label><input id="backup-password" name="backupPassword" type="password" autocomplete="new-password"><small class="field-help">Choisissez un mot de passe robuste ; sans lui, le fichier ne pourra pas être déverrouillé.</small></div>
          <div class="field"><label for="backup-password-confirm">Confirmer le mot de passe <span aria-hidden="true">*</span></label><input id="backup-password-confirm" name="backupPasswordConfirm" type="password" autocomplete="new-password"></div>
        </div>
        <button class="button button-primary" type="button" data-download-backup>Enregistrer et télécharger</button>
        <p class="field-error" data-save-error role="status" aria-live="polite">${escapeHtml(saveFeedback)}</p>
        <aside class="save-notice"><b>Le fichier JSON est réimportable dans Quantix BTP.</b><span>Les données restent sur cet appareil. Conservez le fichier téléchargé dans un emplacement sûr.</span></aside>
        <div class="export-panel"><h2>Exporter le devis</h2><p>Les exports de lecture reprennent la langue et les données affichées dans cette estimation.</p>
          
          <div class="export-actions"><button class="button button-secondary" type="button" data-export-csv disabled>Exporter en CSV</button><button class="button button-secondary" type="button" data-export-xlsx disabled>Exporter en tableur (.xlsx)</button><button class="button button-secondary" type="button" data-export-pdf disabled>Télécharger le PDF</button></div>
          <p class="field-help">Les exports CSV, XLSX et PDF sont des fichiers de lecture non chiffrés. Le mot de passe facultatif protège uniquement la sauvegarde JSON.</p>
        </div>
        <div class="import-panel"><h2>Importer une sauvegarde JSON</h2><label class="field"><span>Choisir un fichier JSON</span><input class="file-input" type="file" accept=".json,application/json" data-import-file></label>
          <div class="field" data-import-password-field hidden><label for="import-password">Mot de passe</label><input id="import-password" type="password" autocomplete="current-password"></div>
          <label class="check-row"><input type="checkbox" name="replaceConfirm"><span>Je confirme le remplacement des données de la session par le devis importé.</span></label>
          <button class="button button-secondary" type="button" data-load-backup disabled>Importer le devis</button><p class="field-error" data-import-error role="status" aria-live="polite"></p>
        </div>
      </section></section>
`;
    const form = app.querySelector('.save-card');
    const protection = form.querySelector('[name="protectBackup"]');
    const passwordFields = form.querySelector('[data-password-fields]');
        const exportButtons = [...form.querySelectorAll('[data-export-csv], [data-export-xlsx], [data-export-pdf]')];
    const updateExportAvailability = () => exportButtons.forEach((button) => { button.disabled = !jsonReady.value; });
    protection.addEventListener('change', () => {
      passwordFields.hidden = !protection.checked;
      jsonReady.value = false;
      updateExportAvailability();
    });
    for (const field of form.querySelectorAll('#backup-password, #backup-password-confirm')) {
      field.addEventListener('input', () => {
        if (!protection.checked) return;
        jsonReady.value = false;
        updateExportAvailability();
      });
    }
    form.querySelector('[data-download-backup]').addEventListener('click', async () => {
      const error = form.querySelector('[data-save-error]');
      error.textContent = '';
      const password = form.querySelector('#backup-password')?.value || '';
      if (protection.checked && (!password || password !== form.querySelector('#backup-password-confirm').value)) {
        error.textContent = !password ? 'Saisissez un mot de passe pour protéger le fichier.' : 'Les mots de passe ne correspondent pas.';
        return;
      }
      try {
        const content = await storage.serialize(backupData(), protection.checked ? password : '');
        storage.download(content, `${exportName}-${language === 'en' ? 'backup' : 'sauvegarde'}.json`);
        jsonReady.value = true;
        updateExportAvailability();
        error.textContent = language === 'en' ? 'JSON backup is ready to download.' : 'La sauvegarde JSON a été préparée pour téléchargement.';
        if (detourReturnPending && resumeStage) {
          error.insertAdjacentHTML('beforeend', ` ${language === 'en' ? 'Return to' : 'Revenir à'} <button class="button button-secondary" type="button" data-resume-stage>${escapeHtml(resumeStage)}</button>`);
        }
      } catch (exception) { error.textContent = translateValue(exception.message); }
    });
    form.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button || button.disabled) return;
      if (button.matches('[data-export-csv]')) {
        downloadBlob(new Blob([exportsApi.buildCsv(...Object.values(localizedExportPayload()), language)], { type: 'text/csv;charset=utf-8' }), `${exportName}-${language === 'en' ? 'estimate' : 'devis'}.csv`);
      } else if (button.matches('[data-export-xlsx]')) {
        downloadBlob(new Blob([exportsApi.buildXlsx(...Object.values(localizedExportPayload()), language)], { type: exportsApi.mimeXlsx }), `${exportName}-${language === 'en' ? 'estimate' : 'devis'}.xlsx`);
      } else if (button.matches('[data-export-pdf]')) {
        downloadBlob(new Blob([exportsApi.buildPdf(...Object.values(localizedExportPayload()), language)], { type: 'application/pdf' }), `${exportName}-${language === 'en' ? 'estimate' : 'devis'}.pdf`);
      }
    });
    form.querySelector('[data-import-file]').addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      const importError = form.querySelector('[data-import-error]');
      const button = form.querySelector('[data-load-backup]');
      importError.textContent = '';
      importedBackup = null;
      button.disabled = true;
      if (!file) return;
      try {
        if (file.size > 20_000_000) throw new TypeError('Fichier vide ou trop volumineux.');
        importText = await file.text();
        const envelope = JSON.parse(importText);
        const protectedImport = envelope?.encrypted === true;
        form.querySelector('[data-import-password-field]').hidden = !protectedImport;
        button.disabled = false;
      } catch (exception) { importError.textContent = exception.message || 'Le fichier ne contient pas un JSON valide.'; }
    });
    form.querySelector('[data-load-backup]').addEventListener('click', async () => {
      const importError = form.querySelector('[data-import-error]');
      importError.textContent = '';
      try {
        if (!form.querySelector('[name="replaceConfirm"]').checked) throw new TypeError('Confirmez le remplacement de la session avant l’import.');
        importedBackup = await storage.deserialize(importText, form.querySelector('#import-password')?.value || '');
        demoMode = false; demoConfig = null;
        Object.assign(contributor, importedBackup.contributor);
        Object.assign(project, importedBackup.project);
        const roleLabel = contributor.role === 'Autre' && contributor.otherRole ? contributor.otherRole : contributor.role;
        contributorName.textContent = contributor.name;
        contributorRole.textContent = roleLabel;
        contributorContext.hidden = false;
        avatar.textContent = initials(contributor.name);
        avatar.setAttribute('aria-label', `${contributor.name} · ${roleLabel}`);
        avatar.hidden = false;
        quote = ensureLaborSection(importedBackup.quote);
        quotesByStage.clear(); quotesByStage.set(quote.stage, quote);
        stageChecks.clear(); (importedBackup.stageChecks || []).forEach(([key, value]) => stageChecks.set(key, value));
        quote.saved = true;
        screen = 'summary';
        render();
        app.focus();
      } catch (exception) { importError.textContent = translateValue(exception.message); }
    });
  }

  function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function topBack() {
    return '<button class="top-back" type="button" data-top-back aria-label="Retour à l’écran précédent"><span aria-hidden="true">←</span><span>Retour</span></button>';
  }

  function readAssistantParams(section, form) {
    for (const input of form.querySelectorAll('[data-param]')) {
      const key = input.dataset.param;
      section.params[key] = input.type === 'number' ? input.value : input.value;
    }
    for (const input of form.querySelectorAll('[data-section-field="blockType"], [data-section-field="blockTypeOther"], [data-section-field="blockMethod"]')) {
      section[input.dataset.sectionField] = input.value;
    }
  }

  function createAssistedItem(designation, baseQuantity, baseUnit, unit = baseUnit) {
    const item = { designation, catalogDesignation: false, baseQuantity, baseUnit, quantity: baseQuantity, unit, unitPrice: '', customUnit: '', assisted: true };
    return item;
  }

  function calculateConcrete(section, form) {
    readAssistantParams(section, form);
    const p = section.params;
    const volume = quoteMath.concreteVolume(parseNumber(p.length), parseNumber(p.width), parseNumber(p.thickness));
    const materials = quoteMath.concreteMaterials(volume, {
      cementKgPerM3: parseNumber(p.cementKgPerM3), sandM3PerM3: parseNumber(p.sandM3PerM3),
      gravelM3PerM3: parseNumber(p.gravelM3PerM3), waterLPerM3: parseNumber(p.waterLPerM3)
    });
    const extraRows = section.items.filter((item) => !item.assisted);
    section.items = [
      createAssistedItem('Ciment', materials.cementKg, 'kg', p.cementUnit || 'kg'),
      createAssistedItem('Sable', materials.sandM3, 'm³'),
      createAssistedItem('Gravier', materials.gravelM3, 'm³'),
      createAssistedItem('Eau', materials.waterL, 'L', p.waterUnit || 'L')
    ].concat(extraRows);
    section.items.forEach((item) => updateAssistedItemQuantity(item, section));
  }

  function calculateMasonry(section, form) {
    readAssistantParams(section, form);
    if (!section.blockType) throw new TypeError('Choisissez le type de bloc.');
    if (section.blockType === 'Autre' && !section.blockTypeOther.trim()) throw new TypeError('Précisez le type et les dimensions du bloc.');
    const blockLabel = section.blockType === 'Autre' ? section.blockTypeOther.trim() : section.blockType;
    const p = section.params;
    const blocks = quoteMath.masonryBlockCount(parseNumber(p.wallLength), parseNumber(p.wallHeight), parseNumber(p.openingsArea || 0), parseNumber(p.blockLength), parseNumber(p.blockHeight));
    const extraRows = section.items.filter((item) => !item.assisted);
    if (section.blockMethod === 'purchased') {
      section.items = [createAssistedItem(`Blocs achetés — ${blockLabel}`, blocks, 'unité'), ...extraRows];
      return;
    }
    const cement = blocks * parseNumber(p.cementKgPerBlock);
    const sand = blocks * parseNumber(p.sandM3PerBlock);
    const water = blocks * parseNumber(p.waterLPerBlock);
    if (![cement, sand, water].every((value) => Number.isFinite(value) && value > 0)) throw new TypeError('Renseignez une quantité de ciment, de sable et d’eau positive par bloc fabriqué.');
    section.items = [
      createAssistedItem(`Ciment — fabrication de ${blockLabel}`, cement, 'kg'),
      createAssistedItem(`Sable — fabrication de ${blockLabel}`, sand, 'm³'),
      createAssistedItem(`Eau — fabrication de ${blockLabel}`, water, 'L')
    ].concat(extraRows);
  }

  function calculateGeneral(section, form) {
    readAssistantParams(section, form);
    const p = section.params;
    let amount;
    let unit;
    if (p.measure === 'volume') {
      amount = quoteMath.concreteVolume(parseNumber(p.measureLength), parseNumber(p.measureWidth), parseNumber(p.measureHeight));
      unit = 'm³';
    } else if (p.measure === 'area') {
      amount = quoteMath.concreteVolume(parseNumber(p.measureLength), parseNumber(p.measureWidth), 1);
      unit = 'm²';
    } else {
      amount = parseNumber(p.measureValue);
      if (!Number.isFinite(amount) || amount <= 0) throw new TypeError('Saisissez une mesure positive.');
      unit = p.measure === 'length' ? 'm' : 'pièce';
    }
    const designation = (p.measureDesignation || '').trim();
    if (!designation) throw new TypeError('Saisissez la désignation de la quantité à calculer.');
    section.items = [createAssistedItem(designation, amount, unit), ...section.items.filter((item) => !item.assisted)];
  }

  function bindQuoteForm() {
    const form = app.querySelector('.quote-form');
    const section = quote.sections[quote.currentSection];
    form.addEventListener('beforeinput', (event) => {
      if (event.target.matches('[data-digits-only]') && event.data && /[^0-9]/.test(event.data) && !event.inputType.startsWith('delete')) event.preventDefault();
    });
    form.addEventListener('input', (event) => {
      const field = event.target;
      if (field.matches('[data-digits-only]')) field.value = field.value.replace(/[^0-9]/g, '');
      if (field.matches('[data-section-field]')) {
        section[field.dataset.sectionField] = field.value;
        if (field.dataset.sectionField === 'title') section.catalogTitle = false;
      }
      if (field.matches('[data-param]')) section.params[field.dataset.param] = field.value;
      if (field.matches('[data-line-field]')) {
        const item = section.items[Number(field.closest('[data-line-index]').dataset.lineIndex)];
        item[field.dataset.lineField] = field.value;
        if (field.dataset.lineField === 'designation' && (!item.unit || item.unit === 'custom')) { const row = field.closest('[data-line-index]'); const units = row.querySelector('[data-line-field="unit"]'); if (units && !item.unit) { item.unit = manualUnitOptions('', field.value).match(/<option value="([^"]+)" selected/)?.[1] || ''; units.innerHTML = manualUnitOptions(item.unit, field.value); } }
        if (field.dataset.lineField === 'designation') item.catalogDesignation = false;
      }
      if (field.matches('[data-equipment-field]')) {
        const item = section.equipmentItems[Number(field.closest('[data-equipment-index]').dataset.equipmentIndex)];
        item[field.dataset.equipmentField] = field.value;
      }
      quote.saved = false;
      const resumeButton = form.querySelector('[data-resume-stage]');
      if (resumeButton) resumeButton.disabled = true;
      if (field.matches('[data-section-field="contingency"]')) section.contingency = parseNumber(field.value);
      updateQuoteTotals();
      const feedback = form.querySelector('[data-quote-feedback]');
      if (feedback) { feedback.textContent = ''; feedback.classList.remove('is-error'); }
      if (field.dataset.sectionField === 'title') {
        const heading = form.querySelector('.quote-section-heading h2');
        if (heading) heading.textContent = field.value || `Section ${quote.currentSection + 1}`;
      }
    });
    form.addEventListener('change', (event) => {
      const field = event.target;
      if (field.matches('[data-section-field]')) {
        section[field.dataset.sectionField] = field.value;
        if (field.dataset.sectionField === 'blockMethod') section.params.cementKgPerBlock = section.params.cementKgPerBlock || '';
        renderQuote();
        return;
      }
      if (field.matches('[data-equipment-field="status"]')) {
        const item = section.equipmentItems[Number(field.closest('[data-equipment-index]').dataset.equipmentIndex)];
        if ((item.quantity || item.duration || item.unitPrice) && !window.confirm(language === 'en' ? 'Changing this status will clear the entered equipment costs. Continue?' : 'Changer ce statut effacera les coûts déjà saisis. Continuer ?')) { field.value = item.status; return; }
        item.status = field.value;
        item.quantity = ''; item.duration = ''; item.unitPrice = '';
        quote.saved = false;
        renderQuote();
        return;
      }
      if (field.matches('[data-param]')) {
        section.params[field.dataset.param] = field.value;
        if (field.dataset.param === 'measure') renderQuote();
        if (field.dataset.param === 'cementBagMassKg') {
          section.items.filter((item) => item.baseUnit === 'kg' && item.unit === 'sac').forEach((item) => updateAssistedItemQuantity(item, section));
        }
      }
      if (field.matches('[data-line-field="unit"]')) {
        const row = field.closest('[data-line-index]');
        const item = section.items[Number(row.dataset.lineIndex)];
        item.unit = field.value;
        row.querySelector('.custom-unit').classList.toggle('is-hidden', field.value !== 'custom');
      }
      if (field.matches('[data-assisted-unit]')) {
        const item = section.items[Number(field.closest('[data-line-index]').dataset.lineIndex)];
        item.unit = field.value;
        if (item.baseUnit === 'kg' && field.value === 'sac' && !parseNumber(section.params.cementBagMassKg)) {
          form.querySelector('[data-assistant-error]').textContent = 'Saisissez la masse d’un sac pour convertir la quantité de ciment.';
        } else {
          updateAssistedItemQuantity(item, section);
          form.querySelector('[data-assistant-error]').textContent = '';
        }
      }
      quote.saved = false;
      updateQuoteTotals();
    });
    form.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.matches('[data-continue-incomplete]')) { allowIncompleteQuote = true; quote.confirmIncomplete = false; renderQuote(); app.querySelector('[data-save-quote]')?.click();
      } else if (button.matches('[data-review-incomplete]')) { quote.confirmIncomplete = false; quote.currentSection = Math.max(0, quote.sections.findIndex((item) => item.incompleteHighlight)); renderQuote();
      } else if (button.matches('[data-mode]')) {
        section.mode = button.dataset.mode;
        quote.saved = false;
        renderQuote();
      } else if (button.matches('[data-add-line]')) {
        section.items.push({ designation: '', catalogDesignation: false, quantity: '', unit: '', customUnit: '', unitPrice: '', assisted: false });
        quote.saved = false;
        renderQuote();
      } else if (button.matches('[data-remove-line]')) {
        if (!window.confirm(language === 'en' ? 'Delete this resource line?' : 'Supprimer cette ligne de ressource ?')) return;
        section.items.splice(Number(button.dataset.removeLine), 1);
        quote.saved = false;
        renderQuote();
      } else if (button.matches('[data-all-available]')) {
        const wouldClearCosts = section.equipmentItems.some((item) => isApplicable(item) && (item.status === 'purchase' || item.status === 'rent' || item.quantity || item.duration || item.unitPrice));
        if (wouldClearCosts && !window.confirm(language === 'en' ? 'Mark all applicable equipment as available and clear their purchase or rental costs?' : 'Marquer tous les équipements concernés comme disponibles et effacer leurs coûts d’achat ou de location ?')) return;
        section.equipmentItems.forEach((item) => { if (isApplicable(item)) { item.status='available'; item.quantity=''; item.duration=''; item.unitPrice=''; } }); renderQuote();
      } else if (button.matches('[data-remove-equipment]')) {
        if (!window.confirm(language === 'en' ? 'Delete this equipment line?' : 'Supprimer cette ligne de matériel ?')) return; section.equipmentItems.splice(Number(button.dataset.removeEquipment), 1); renderQuote();
      } else if (button.matches('[data-add-equipment]')) {
        section.equipmentItems.push({ designation: '', unit: 'pièce', rental_unit: 'jour', applicable_a: ['tous'], status: '', quantity: '', duration: '', unitPrice: '', custom: true }); renderQuote();
      } else if (button.matches('[data-add-section]')) {
        quote.sections.push({ id: 'custom', title: '', description: '', catalogItems: [], kind: 'other', mode: 'manual', contingency: 5, items: [], equipmentItems: [], blockType: '', blockTypeOther: '', blockMethod: 'purchased', params: {} });
        quote.currentSection = quote.sections.length - 1;
        quote.saved = false;
        renderQuote();
      } else if (button.matches('[data-remove-section]')) {
        if (quote.sections[Number(button.dataset.removeSection)]?.id === 'equipment') return;
        if (!window.confirm(language === 'en' ? 'Delete this estimate section?' : 'Supprimer cette section du devis ?')) return;
        quote.sections.splice(Number(button.dataset.removeSection), 1);
        quote.currentSection = Math.max(0, quote.currentSection - 1);
        quote.saved = false;
        renderQuote();
      } else if (button.matches('[data-section-index]')) {
        quote.currentSection = Number(button.dataset.sectionIndex);
        renderQuote();
      } else if (button.matches('[data-resume-stage]')) {
        return;
      } else if (button.matches('[data-calculate-concrete], [data-calculate-masonry], [data-calculate-general]')) {
        try {
          form.querySelector('[data-assistant-error]').textContent = '';
          if (button.matches('[data-calculate-concrete]')) calculateConcrete(section, form);
          else if (button.matches('[data-calculate-masonry]')) calculateMasonry(section, form);
          else calculateGeneral(section, form);
          quote.saved = false;
          renderQuote();
        } catch (error) {
          const errorElement = form.querySelector('[data-assistant-error]');
          if (errorElement) errorElement.textContent = error.message;
        }
      } else if (button.matches('[data-save-quote]')) {
        const currentUnfinished = quote.sections.some((item, idx) => item.kind === 'equipment' ? item.equipmentItems.some((entry) => isApplicable(entry) && !entry.status) : idx !== quote.currentSection && item.items.some((entry) => !entry.quantity || !entry.unitPrice));
        if (currentUnfinished && !allowIncompleteQuote) {
          quote.sections.forEach((item, idx) => { item.incompleteHighlight = item.kind === 'equipment' ? item.equipmentItems.some((entry) => isApplicable(entry) && !entry.status) : idx !== quote.currentSection && item.items.some((entry) => !entry.quantity || !entry.unitPrice); });
          quote.confirmIncomplete = true; renderQuote(); return;
        }
        quote.confirmIncomplete = false;
        const issue = quoteMath.validateQuote(quote.sections.map((item, idx) => ({
          title: item.title,
          contingency: item.contingency,
          equipmentItems: item.kind === 'equipment' && idx === quote.currentSection ? item.equipmentItems.filter((equipment) => isApplicable(equipment) && equipment.status).map((equipment) => ({ ...equipment, index: item.equipmentItems.indexOf(equipment) })) : [],
          materialItems: idx === quote.currentSection ? activeMaterialItems(item).map(([line, index]) => ({ ...line, index })) : [],
          lines: sectionLines(item),
          canAddLine: item.kind !== 'equipment'
        })));
        if (issue) {
          if (issue.sectionIndex !== quote.currentSection) {
            quote.currentSection = issue.sectionIndex;
            renderQuote();
          }
          const activeForm = app.querySelector('.quote-form');
          const feedback = activeForm.querySelector('[data-quote-feedback]');
          feedback.textContent = issue.message;
          feedback.classList.add('is-error');
          const target = activeForm.querySelector(issue.selector);
          if (target) {
            target.focus({ preventScroll: true });
            target.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
          } else {
            feedback.focus?.();
            feedback.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
        quote.saved = true;
        allowIncompleteQuote = false;
        screen = 'summary';
        render();
        app.focus();
      }
    });
    bindBack(form, 'verification');
    updateQuoteTotals();
  }

  function bindBack(form, destination) {
    form.querySelector('[data-back]').addEventListener('click', () => navigateBack(destination));
  }

  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toLocaleUpperCase('fr')).join('');
  }

  function render() {
    if (screen === 'contributor') renderContributor();
    else if (screen === 'building') renderBuilding();
    else if (screen === 'stage') renderStage();
    else if (screen === 'verification') renderVerification();
    else if (screen === 'quote') renderQuote();
    else if (screen === 'summary') renderSummary();
    else if (screen === 'save') renderSave();
    else renderHome();
    translateRendered();
  }

  app.addEventListener('click', (event) => {
    if (event.target.closest('[data-new-estimate]')) { startNewEstimate(); return; }
    if (event.target.closest('[data-home-example]')) { startExample(); return; }
    if (event.target.closest('[data-resume-stage]')) {
      if (!resumeStage) return; project.stage = resumeStage; stageCheck = stageChecks.get(project.stage) || { stage: project.stage, answers: {} }; resumeStage = ''; detourReturnPending = false; activateQuote(project.stage); screen = 'quote'; render(); app.focus(); return;
    }
    if (event.target.closest('[data-top-back]')) {
      const destinations = { contributor: 'home', building: 'contributor', stage: 'building', verification: 'stage', quote: 'verification', summary: 'quote', save: 'summary' };
      navigateBack(destinations[screen] || 'home');
      return;
    }
    if (event.target.closest('[data-home-import]')) {
      const picker = document.createElement('input'); picker.type = 'file'; picker.accept = '.json,application/json';
      picker.addEventListener('change', async () => { const file = picker.files?.[0]; if (!file) return; try { const raw = await file.text(); const parsed = JSON.parse(raw); const password = parsed?.encrypted ? window.prompt(language === 'en' ? 'Backup password' : 'Mot de passe de la sauvegarde') || '' : ''; const data = await storage.deserialize(raw, password); if (!window.confirm(language === 'en' ? 'Replace the current session with this estimate?' : 'Remplacer les données actuelles par ce devis importé ?')) return; demoMode=false; demoConfig=null; importedBackup = data; Object.assign(contributor, data.contributor); Object.assign(project, data.project); quote = ensureLaborSection(data.quote); quotesByStage.clear(); quotesByStage.set(quote.stage, quote); stageChecks.clear(); (data.stageChecks||[]).forEach(([key,val])=>stageChecks.set(key,val)); contributorName.textContent=contributor.name; contributorRole.textContent=contributor.role === 'Autre' && contributor.otherRole ? contributor.otherRole : contributor.role; contributorContext.hidden=false; avatar.textContent=initials(contributor.name); avatar.setAttribute('aria-label', `${contributor.name} · ${contributorRole.textContent}`); avatar.hidden=false; resumeStage=''; detourReturnPending=false; screen = 'summary'; render(); } catch (error) { window.alert(translateValue(error.message)); } }); picker.click(); return;
    }
    if (event.target.closest('[data-start]')) {
      screen = 'contributor';
      render();
      app.focus();
    }
  });
  document.querySelectorAll('[data-home]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    screen = 'home';
    render();
    app.focus();
  }));
  document.querySelector('[data-language]')?.addEventListener('change', (event) => {
    language = event.target.value;
    switchDemoLocale();
    render();
    document.querySelector('[data-language]').value = language;
  });
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    darkTheme = !darkTheme;
    applyTheme();
  });
  if (globalThis.MutationObserver && document.body) {
    const translationObserver = new MutationObserver(() => { if (language === 'en') translateRendered(); });
    translationObserver.observe(document.body, { subtree: true, childList: true, characterData: true });
  }
  applyTheme();
  render();
})();
