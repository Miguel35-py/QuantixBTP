(() => {
  'use strict';

  // Liste de contrôle indicative, éditable par l'utilisateur. Elle ne remplace
  // ni les plans, ni le choix du système constructif, ni un métré professionnel.
  const all = ['tous'];
  const slug = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const catalog = [
    {
      stage: 'Fondations et infrastructure',
      sections: [
        { id: 'equipment', title: 'Matériel et équipements', type: 'equipment', items: [
          ['Pelles, pioches et houes', 'pièce'], ['Brouettes', 'pièce'], ['Seaux et récipients gradués', 'pièce'], ['Truelles et taloches', 'pièce'], ['Mètre ruban et décamètre', 'pièce'], ['Cordeaux, piquets et chaises d’implantation', 'lot'], ['Niveau à bulle ou niveau optique', 'pièce'], ['Bétonnière', 'pièce'], ['Aiguille vibrante', 'pièce'], ['Étais et matériel de coffrage', 'lot'], ['Échafaudage ou plateformes de travail', 'lot'], ['Eau de chantier et dispositif de stockage', 'lot'], ['Alimentation électrique ou groupe électrogène', 'jour'], ['Engin de terrassement et évacuation', 'jour'], ['Équipements de protection individuelle', 'lot']
        ].map(([designation, unit], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', applicable_a: all, statuts_possibles: ['deja_disponible', 'a_acheter', 'a_louer', 'non_utilise'], rental_unit: 'jour' })) },
        { id: 'implantation', title: 'Implantation et décapage local de l’emprise', type: 'materials', description_technique: 'Implantation des ouvrages et enlèvement des terres impropres dans l’emprise immédiate des fondations. La préparation générale du site reste hors devis.', items: [
          ['Piquets d’implantation', 'pièce'], ['Cordeaux', 'rouleau'], ['Chaux ou poudre de traçage', 'kg'], ['Pointes ordinaires', 'kg'], ['Bois pour chaises d’implantation', 'pièce'], ['Carburant pour engin affecté à cette phase', 'L']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'fouilles', title: 'Fouilles et évacuation des déblais', type: 'materials', description_technique: 'Fouilles aux dimensions indiquées par les plans et gestion des déblais propres aux fondations. Les dimensions et la destination des terres sont à définir pour le chantier.', items: [
          ['Carburant d’engin de fouille', 'L'], ['Lubrifiant d’engin', 'L'], ['Transport des déblais (unité de chantier à préciser)', 'custom'], ['Matériaux de blindage provisoire si nécessaire', 'm²'], ['Pompage et évacuation d’eau si nécessaire', 'heure']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'proprete', title: 'Béton de propreté (si prévu)', type: 'materials', description_technique: 'Couche de propreté sous les fondations lorsque les plans ou le mode opératoire la prévoient. Les quantités de ciment, sable, gravier et eau sont renseignées séparément, selon le dosage retenu.', items: [
          ['Ciment', 'kg'], ['Sable', 'm³'], ['Gravier', 'm³'], ['Eau de gâchage', 'L'], ['Film de protection ou polyane si prévu', 'm²']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'semelles', title: 'Semelles, puits ou radier (selon plans)', type: 'materials', description_technique: 'Chiffrer uniquement le système de fondation retenu dans les plans. Semelles, puits et radier sont des variantes à confirmer et ne doivent pas être cumulés sans justification.', items: [
          ['Ciment pour béton de fondation', 'kg'], ['Sable pour béton de fondation', 'm³'], ['Gravier pour béton de fondation', 'm³'], ['Eau de gâchage', 'L'], ['Barres d’acier à béton (diamètres selon plans)', 'barre'], ['Fil d’attache recuit', 'kg'], ['Cales d’enrobage', 'pièce'], ['Planches de coffrage', 'm³'], ['Chevrons / madriers de coffrage', 'm³'], ['Pointes de coffrage', 'kg'], ['Huile de décoffrage', 'L'], ['Produit de cure du béton si prévu', 'L']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'longrines', title: 'Longrines (si prévues)', type: 'materials', description_technique: 'Éléments de liaison chiffrés séparément des semelles ou du radier. Section, armatures et ancrages proviennent exclusivement des plans validés.', items: [
          ['Ciment pour béton de longrine', 'kg'], ['Sable pour béton de longrine', 'm³'], ['Gravier pour béton de longrine', 'm³'], ['Eau de gâchage', 'L'], ['Barres d’acier à béton (diamètres selon plans)', 'barre'], ['Fil d’attache recuit', 'kg'], ['Cales d’enrobage', 'pièce'], ['Bois de coffrage', 'm³'], ['Pointes', 'kg'], ['Huile de décoffrage', 'L'], ['Produit de cure si prévu', 'L']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
      ],
      a_confirmer: ['Nature et classe du sol, profondeur et dimensions des fondations selon étude et plans.', 'Radier, puits et semelles sont des solutions alternatives selon conception ; ne pas les chiffrer ensemble par défaut.', 'Le transport des déblais et le délimitation entre décapage général exclu et fouille de fondation restent à préciser.', 'Aciers, bois et produits de cure sont des fournitures manufacturées nécessaires au chantier ; confirmer le niveau de détail attendu pour ces fournitures.']
    },
    {
      stage: 'Soubassement et plancher bas',
      sections: [
        { id: 'equipment', title: 'Matériel et équipements', type: 'equipment', items: [
          ['Pelles, pioches et houes', 'pièce'], ['Brouettes', 'pièce'], ['Seaux et récipients gradués', 'pièce'], ['Truelles et taloches', 'pièce'], ['Niveau et règle de maçon', 'pièce'], ['Bétonnière', 'pièce'], ['Aiguille vibrante', 'pièce'], ['Dame ou compacteur', 'jour'], ['Étais et matériel de coffrage', 'lot'], ['Échafaudage ou plateformes de travail', 'lot'], ['Eau de chantier et stockage', 'lot'], ['Alimentation électrique ou groupe électrogène', 'lot'], ['Équipements de protection individuelle', 'lot']
        ].map(([designation, unit]) => ({ id: slug(designation), designation, unit, precisions: '', applicable_a: all, statuts_possibles: ['deja_disponible', 'a_acheter', 'a_louer', 'non_utilise'], rental_unit: 'jour' })) },
        { id: 'murs-soubassement', title: 'Murs de soubassement', type: 'materials', description_technique: 'Élévation des murs de soubassement selon le système prévu aux plans. Les blocs achetés ou fabriqués sont chiffrés selon le mode retenu ; béton et armatures ne sont pas présumés.', items: [
          ['Blocs / parpaings (type à choisir)', 'pièce', 'purchased'], ['Ciment de mortier', 'kg'], ['Sable de mortier', 'm³'], ['Eau de gâchage', 'L'], ['Ciment par bloc fabriqué sur chantier', 'kg', 'fabricated'], ['Sable par bloc fabriqué sur chantier', 'm³', 'fabricated'], ['Eau par bloc fabriqué sur chantier', 'L', 'fabricated'], ['Ciment de béton de remplissage si prévu', 'kg'], ['Sable de béton si prévu', 'm³'], ['Gravier de béton si prévu', 'm³'], ['Eau de béton si prévu', 'L'], ['Barres d’acier selon plans', 'barre'], ['Fil d’attache', 'kg']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'protection-eau', title: 'Protection contre l’humidité et drainage (si prévus)', type: 'materials', description_technique: 'Dispositifs contre les remontées d’humidité et évacuation des eaux au droit du soubassement lorsque les plans ou prescriptions les prévoient.', items: [
          ['Ciment pour forme ou protection minérale', 'kg'], ['Sable', 'm³'], ['Gravier drainant', 'm³'], ['Eau', 'L'], ['Membrane ou film d’étanchéité (nature à confirmer)', 'm²'], ['Granulats filtrants', 'm³'], ['Tuyau de drainage (produit manufacturé à confirmer)', 'm']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'remblai', title: 'Remblai intérieur et couche de forme', type: 'materials', description_technique: 'Apport, mise en place et compactage des matériaux sous le plancher bas. Origine et nature des matériaux doivent être renseignées sans assimiler automatiquement les déblais au matériau de remblai.', items: [
          ['Matériau de remblai sélectionné', 'm³'], ['Sable de réglage', 'm³'], ['Granulats de couche de forme', 'm³'], ['Eau de compactage', 'L'], ['Carburant de compacteur', 'L']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'dallage', title: 'Dallage et plancher bas', type: 'materials', description_technique: 'Couches et dalle du plancher bas selon les plans. L’armature, le béton, les joints et les protections ne sont inclus que s’ils sont prévus.', items: [
          ['Film polyane si prévu', 'm²'], ['Ciment pour dalle', 'kg'], ['Sable pour dalle', 'm³'], ['Gravier pour dalle', 'm³'], ['Eau de gâchage', 'L'], ['Treillis ou barres d’acier selon plans', 'm²'], ['Fil d’attache', 'kg'], ['Cales d’enrobage', 'pièce'], ['Bois de coffrage périphérique', 'm³'], ['Produit de cure si prévu', 'L'], ['Matériau de joint si prévu', 'm']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'dallage-industriel', title: 'Dallage pour usage industriel (si prévu)', type: 'materials', applicable_a: ['Entrepôt / bâtiment industriel'], description_technique: 'Complément de chiffrage pour un dallage soumis à un usage industriel lorsque les plans le prévoient. Les charges, épaisseurs, joints, armatures et spécifications du béton doivent venir des documents validés.', items: [
          ['Ciment pour béton de dallage', 'kg'], ['Sable pour béton de dallage', 'm³'], ['Gravier pour béton de dallage', 'm³'], ['Eau de gâchage', 'L'], ['Armatures selon plans', 'kg'], ['Fil d’attache', 'kg'], ['Cales d’enrobage', 'pièce'], ['Produit de cure', 'L'], ['Matériau de joint de dallage (nature à confirmer)', 'm']
        ].map(([designation, unit], index) => ({ id: `industriel_${slug(designation)}_${index + 1}`, designation, unit, precisions: '', applicable_a: ['Entrepôt / bâtiment industriel'] })) }
      ],
      a_confirmer: ['La nature du plancher bas (terre-plein, plancher porté ou autre) est déterminée par les plans.', 'Membranes, drains, treillis et matériaux de joint sont des produits ou assemblages manufacturés : leur inclusion doit être confirmée avec le niveau de détail voulu.', 'Éviter de compter une seconde fois les déblais déjà chiffrés en fondations.']
    },
    {
      stage: 'Élévation du rez-de-chaussée',
      sections: [
        { id: 'equipment', title: 'Matériel et équipements', type: 'equipment', items: [
          ['Truelles, taloches et platoirs', 'pièce'], ['Pelles et brouettes', 'pièce'], ['Seaux gradués', 'pièce'], ['Niveau, fil à plomb et règle', 'pièce'], ['Cordeaux et mètre ruban', 'pièce'], ['Bétonnière', 'pièce'], ['Aiguille vibrante', 'pièce'], ['Étais et coffrage', 'lot'], ['Échafaudage / plateformes de travail', 'lot'], ['Coupe-blocs ou meuleuse', 'pièce'], ['Eau de chantier et stockage', 'lot'], ['Alimentation électrique ou groupe électrogène', 'lot'], ['Équipements de protection individuelle', 'lot']
        ].map(([designation, unit]) => ({ id: slug(designation), designation, unit, precisions: '', applicable_a: all, statuts_possibles: ['deja_disponible', 'a_acheter', 'a_louer', 'non_utilise'], rental_unit: 'jour' })) },
        { id: 'maconnerie', title: 'Murs et maçonnerie', type: 'materials', description_technique: 'Maçonnerie des murs suivant les plans et le type de bloc choisi. Le choix acheté/fabriqué ouvre le chiffrage correspondant ; aucune résistance ou dimension de bloc n’est présumée.', items: [
          ['Blocs / parpaings (creux, plein, BTC ou autre)', 'pièce', 'purchased'], ['Ciment de mortier', 'kg'], ['Sable de mortier', 'm³'], ['Eau de gâchage', 'L'], ['Ciment par bloc fabriqué sur chantier', 'kg', 'fabricated'], ['Sable par bloc fabriqué sur chantier', 'm³', 'fabricated'], ['Eau par bloc fabriqué sur chantier', 'L', 'fabricated'], ['Barres d’acier de liaison selon plans', 'barre'], ['Fil d’attache', 'kg']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'poteaux-chainages', title: 'Poteaux, chaînages et raidisseurs (selon plans)', type: 'materials', description_technique: 'Éléments en béton armé détaillés selon les plans d’exécution. Les sections, armatures, ancrages et espacements ne sont pas calculés par l’application.', items: [
          ['Ciment pour béton', 'kg'], ['Sable pour béton', 'm³'], ['Gravier pour béton', 'm³'], ['Eau de gâchage', 'L'], ['Barres d’acier (diamètres et longueurs selon plans)', 'barre'], ['Fil d’attache recuit', 'kg'], ['Cales d’enrobage', 'pièce'], ['Bois de coffrage', 'm³'], ['Pointes', 'kg'], ['Huile de décoffrage', 'L'], ['Produit de cure si prévu', 'L']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'linteaux', title: 'Linteaux et appuis (selon plans)', type: 'materials', description_technique: 'Linteaux et appuis au-dessus ou au droit des ouvertures, selon les détails du projet. Les dimensions et armatures sont reprises des plans.', items: [
          ['Ciment pour béton', 'kg'], ['Sable pour béton', 'm³'], ['Gravier pour béton', 'm³'], ['Eau de gâchage', 'L'], ['Barres d’acier selon plans', 'barre'], ['Fil d’attache', 'kg'], ['Cales d’enrobage', 'pièce'], ['Bois de coffrage', 'm³'], ['Pointes', 'kg'], ['Huile de décoffrage', 'L']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) }
      ],
      a_confirmer: ['Les ouvertures, chaînages, poteaux et linteaux varient selon les plans ; ne pas supposer leurs dimensions ni leur présence.', 'Portes, fenêtres, blocs préfabriqués spécifiques et autres produits finis ne sont pas des lignes de matières premières dans ce catalogue.', 'Définir si l’enduit ou les finitions hors gros œuvre sont à exclure du devis de cette étape.']
    },
    {
      stage: 'Plancher et niveaux supérieurs',
      sections: [
        { id: 'equipment', title: 'Matériel et équipements', type: 'equipment', items: [
          ['Pelles, brouettes et seaux', 'pièce'], ['Niveau, règle et mètre ruban', 'pièce'], ['Bétonnière', 'pièce'], ['Aiguille vibrante', 'pièce'], ['Coffrage de dalle et accessoires', 'lot'], ['Étais et tours d’étaiement', 'lot'], ['Échafaudage / plateformes', 'lot'], ['Moyen de levage ou transport vertical', 'jour'], ['Eau de chantier et stockage', 'lot'], ['Alimentation électrique ou groupe électrogène', 'lot'], ['Équipements de protection contre les chutes', 'lot'], ['Équipements de protection individuelle', 'lot']
        ].map(([designation, unit]) => ({ id: slug(designation), designation, unit, precisions: '', applicable_a: all, statuts_possibles: ['deja_disponible', 'a_acheter', 'a_louer', 'non_utilise'], rental_unit: 'jour' })) },
        { id: 'etaiement-coffrage', title: 'Étaiement et coffrage', type: 'materials', description_technique: 'Matériaux de coffrage et d’étaiement pour les ouvrages prévus aux plans. Les éléments réutilisables peuvent relever du matériel disponible ou de la location plutôt que d’une consommation intégrale.', items: [
          ['Planches de coffrage', 'm³'], ['Chevrons et madriers', 'm³'], ['Panneaux de coffrage (nature à confirmer)', 'm²'], ['Pointes', 'kg'], ['Huile de décoffrage', 'L'], ['Étais / tours d’étaiement', 'jour'], ['Cales et accessoires de réglage', 'pièce']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'poutres-dalles', title: 'Poutres et dalles en béton armé', type: 'materials', description_technique: 'Béton et armatures des ouvrages horizontaux prévus par les plans. Les dimensions, le ferraillage, le phasage et les éventuelles reprises sont à relever sur les documents validés.', items: [
          ['Ciment pour béton', 'kg'], ['Sable pour béton', 'm³'], ['Gravier pour béton', 'm³'], ['Eau de gâchage', 'L'], ['Barres d’acier (diamètres selon plans)', 'barre'], ['Treillis soudé si prévu (produit manufacturé à confirmer)', 'm²'], ['Fil d’attache', 'kg'], ['Cales d’enrobage', 'pièce'], ['Produit de cure', 'L'], ['Carburant du moyen de levage', 'L']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'escalier', title: 'Escaliers en béton armé (si prévus)', type: 'materials', description_technique: 'Escaliers et paliers en béton armé uniquement lorsqu’ils appartiennent à cette étape et figurent aux plans. La géométrie et les armatures ne sont jamais déduites du type de bâtiment.', items: [
          ['Ciment pour béton', 'kg'], ['Sable pour béton', 'm³'], ['Gravier pour béton', 'm³'], ['Eau de gâchage', 'L'], ['Barres d’acier selon plans', 'barre'], ['Fil d’attache', 'kg'], ['Bois de coffrage', 'm³'], ['Pointes', 'kg'], ['Huile de décoffrage', 'L'], ['Cales d’enrobage', 'pièce']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) }
      ],
      a_confirmer: ['La présente étape ne comprend pas implicitement l’élévation des murs des niveaux supérieurs, absente de la liste des cinq étapes de la maquette.', 'Les systèmes à poutrelles-hourdis ou composants préfabriqués doivent être confirmés séparément comme produits manufacturés, exclus du catalogue de matières premières.', 'Le matériel réutilisable et les consommables doivent être distingués selon le statut d’achat/location/disponibilité.']
    },
    {
      stage: 'Charpente et couverture',
      sections: [
        { id: 'equipment', title: 'Matériel et équipements', type: 'equipment', items: [
          ['Mètre ruban, équerre et cordeau', 'pièce'], ['Scies et outils de coupe', 'pièce'], ['Perceuse et visseuse', 'pièce'], ['Marteaux et pinces', 'pièce'], ['Échelles et échafaudages', 'lot'], ['Moyen de levage ou manutention', 'jour'], ['Eau de chantier et nettoyage', 'lot'], ['Alimentation électrique ou groupe électrogène', 'lot'], ['Équipements de protection contre les chutes', 'lot'], ['Équipements de protection individuelle', 'lot']
        ].map(([designation, unit]) => ({ id: slug(designation), designation, unit, precisions: '', applicable_a: all, statuts_possibles: ['deja_disponible', 'a_acheter', 'a_louer', 'non_utilise'], rental_unit: 'jour' })) },
        { id: 'charpente', title: 'Structure de charpente', type: 'materials', description_technique: 'Éléments de charpente et assemblages suivant la conception retenue. Le matériau (bois, acier ou autre), les sections et les assemblages proviennent des plans ; aucun dimensionnement n’est effectué.', items: [
          ['Bois de charpente (essence et sections selon plans)', 'm³'], ['Éléments métalliques de charpente (profils selon plans)', 'kg'], ['Connecteurs et sabots (produits manufacturés à confirmer)', 'pièce'], ['Boulons et rondelles', 'pièce'], ['Pointes et clous de charpente', 'kg'], ['Vis de fixation', 'pièce'], ['Produit de traitement du bois si prévu', 'L'], ['Peinture ou protection anticorrosion si prévue', 'L']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'support-couverture', title: 'Supports et liteaux', type: 'materials', description_technique: 'Supports de couverture et pièces secondaires selon le matériau et le calepinage prévu. Leur espacement et leur section ne sont pas calculés par l’application.', items: [
          ['Liteaux ou tasseaux (sections selon plans)', 'm³'], ['Chevrons ou pannes complémentaires', 'm³'], ['Pointes ou vis de fixation', 'kg'], ['Écran ou film sous-toiture (produit manufacturé à confirmer)', 'm²']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) },
        { id: 'couverture', title: 'Couverture et évacuation des eaux', type: 'materials', description_technique: 'Éléments de couverture et d’évacuation de l’eau selon la solution choisie aux plans. Les tôles, tuiles, faîtières et gouttières sont des produits finis/manufacturés : leur statut est à confirmer avec l’utilisateur.', items: [
          ['Tôles ou éléments de couverture (produit fini à confirmer)', 'm²'], ['Faîtières, rives et closoirs (produits finis à confirmer)', 'm'], ['Vis ou pointes de fixation avec accessoires', 'pièce'], ['Solins et bandes de raccord (produits manufacturés à confirmer)', 'm'], ['Gouttières et descentes (produits finis à confirmer)', 'm'], ['Accessoires de collecte et fixation', 'pièce']
        ].map(([designation, unit, acquisition], index) => ({ id: `${slug(designation)}_${index + 1}`, designation, unit, precisions: '', acquisition, applicable_a: all })) }
      ],
      a_confirmer: ['Le type de toiture, la pente, les portées et le matériau de couverture sont décidés par les plans et les choix du projet.', 'Tôles, tuiles, connecteurs, écrans, faîtières, solins et gouttières sont isolés comme fournitures manufacturées/produits finis à confirmer ; le filtre “matières premières seulement” peut conduire à les exclure.', 'Les sections de bois/profils, fixations et protections sont à déterminer d’après les plans et la spécification du matériau.']
    }
  ];


  const equipmentSplits = new Map(Object.entries({
    'Pelles, pioches et houes': ['Pelle','Pioche','Houe'],
    'Pelles, pioches et houes': ['Pelle','Pioche','Houe'],
    'Seaux et récipients gradués': ['Seau','Récipient gradué'],
    'Truelles et taloches': ['Truelle','Taloche'],
    'Truelles, taloches et platoirs': ['Truelle','Taloche','Platoir'],
    'Mètre ruban et décamètre': ['Mètre ruban','Décamètre'],
    'Cordeaux, piquets et chaises d’implantation': ['Cordeau','Piquet d’implantation','Chaise d’implantation'],
    'Niveau à bulle ou niveau optique': ['Niveau à bulle','Niveau optique'],
    'Dame ou compacteur': ['Dame manuelle','Compacteur'],
    'Coupe-blocs ou meuleuse': ['Coupe-blocs','Meuleuse'],
    'Engin de terrassement et évacuation': ['Engin de terrassement','Véhicule d’évacuation'],
    'Équipements de protection individuelle': ['Casque de protection','Gants de protection','Lunettes de protection','Chaussures de sécurité','Gilet de haute visibilité'],
    'Niveau et règle de maçon': ['Niveau de maçon','Règle de maçon'],
    'Niveau, fil à plomb et règle': ['Niveau','Fil à plomb','Règle'],
    'Cordeaux et mètre ruban': ['Cordeau','Mètre ruban'],
    'Pelles et brouettes': ['Pelle','Brouette'],
    'Pelles, brouettes et seaux': ['Pelle','Brouette','Seau'],
    'Niveau, règle et mètre ruban': ['Niveau','Règle','Mètre ruban'],
    'Mètre ruban, équerre et cordeau': ['Mètre ruban','Équerre','Cordeau'],
    'Scies et outils de coupe': ['Scie','Outil de coupe'],
    'Perceuse et visseuse': ['Perceuse','Visseuse'],
    'Marteaux et pinces': ['Marteau','Pince'],
    'Eau de chantier et dispositif de stockage': ['Approvisionnement en eau de chantier','Dispositif de stockage d’eau'],
    'Eau de chantier et stockage': ['Approvisionnement en eau de chantier','Dispositif de stockage d’eau'],
    'Eau de chantier et nettoyage': ['Approvisionnement en eau de chantier','Matériel de nettoyage'],
    'Alimentation électrique ou groupe électrogène': ['Alimentation électrique','Groupe électrogène'],
    'Étais et matériel de coffrage': ['Étais','Matériel de coffrage'],
    'Étais et coffrage': ['Étais','Matériel de coffrage'],
    'Étais et tours d’étaiement': ['Étais','Tours d’étaiement'],
    'Échafaudage ou plateformes de travail': ['Échafaudage','Plateforme de travail'],
    'Échafaudage / plateformes de travail': ['Échafaudage','Plateforme de travail'],
    'Échafaudage / plateformes': ['Échafaudage','Plateforme de travail'],
    'Moyen de levage ou transport vertical': ['Moyen de levage','Moyen de transport vertical'],
    'Moyen de levage ou manutention': ['Moyen de levage','Matériel de manutention'],
    'Équipements de protection individuelle': ['Casque de protection','Gants de protection','Lunettes de protection','Chaussures de sécurité','Gilet de haute visibilité'],
    'Équipements de protection contre les chutes': ['Harnais antichute','Longe antichute','Garde-corps provisoire'],
    'Pelles, brouettes et seaux': ['Pelle','Brouette','Seau']
  }));
  for (const stage of catalog) {
    const section = stage.sections.find((item) => item.type === 'equipment');
    if (!section) continue;
    const expanded = [];
    for (const item of section.items) {
      const labels = equipmentSplits.get(item.designation);
      if (!labels) { expanded.push(item); continue; }
      labels.forEach((designation, index) => expanded.push({ ...item, id: `${item.id}_${index + 1}`, designation, unit: 'pièce' }));
    }
    section.items = expanded;
  }

  window.QUANTIX_QUOTE_CATALOG = Object.freeze(catalog);
})();
