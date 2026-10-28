# Critères de validation — Quantix BTP

Ces critères couvrent les phases autorisées `QBT-FLOW-01` à `QBT-FLOW-08`, le retour en tête d’écran, la bascule FR/EN et le thème sombre optionnel.

## 1. Parcours et règles métier

### Phases `QBT-FLOW-01` à `QBT-FLOW-06`

- L’écran d’accueil montre l’identité Quantix BTP, sa proposition de valeur, l’illustration de maison, les trois bénéfices et un seul appel principal « Commencer ».
- « Commencer » ouvre la saisie du contributeur sans afficher de données de démonstration.
- Le nom est requis ; vide ou composé uniquement d’espaces, il donne une erreur près du champ et le focus revient au champ.
- Le nom, la fonction et le téléphone sont obligatoires ; « Autre » peut être précisé facultativement. L’e-mail reste facultatif, est converti en minuscules et une syntaxe courante invalide est refusée.
- L’indicatif `+237` est sélectionné par défaut ; le numéro camerounais accepte neuf chiffres. Les longueurs acceptées changent avec l’indicatif. Les caractères non numériques ne sont pas conservés dans le numéro national.
- Après validation, le nom et la fonction apparaissent dans l’en-tête et l’écran bâtiment s’ouvre.
- L’écran bâtiment exige le nom et un type. Il propose les huit types confirmés, exige une précision pour « Autre », conserve localisation/commentaire facultatifs, et propose XAF par défaut plus USD/EUR/JPY/GBP sans conversion de devise. Le message de modèle a le même fond vert que l’avis du FLOW-02 ; les libellés projet sont aussi grands que le titre du type.
- L’écran étape propose exactement les cinq choix de la maquette ; une seule sélection est possible. FLOW-03 affiche le sous-titre « Définissez votre projet » et ne montre plus le message de modèle interne.
- La typographie est augmentée de 2 px et le bandeau de pied de page pleine largeur est supprimé.
- Pour les fondations, FLOW-05 demande les trois statuts illustrés (plans/études, préparation générale du terrain, installation du chantier). Pour les autres choix, il demande uniquement le statut de l’étape précédente. Aucun statut non renseigné n’est présumé ; une réponse négative informe sans bloquer.
- FLOW-06 ne fournit aucun prix ni dosage fictif. La saisie manuelle expose désignation, quantité, unité, prix unitaire et total. Les unités personnalisées sont proposées dans les lignes manuelles seulement.
- Le béton assisté calcule le volume rectangulaire (L × l × épaisseur), puis les matériaux par multiplication par des coefficients saisis. Le sac de ciment exige son poids pour convertir les kg. Les blocs achetés utilisent le plafond de surface murale nette / face du bloc ; la fabrication multiplie le nombre par les coefficients saisis par bloc. Les autres calculs assistés géométriques utilisent les formules affichées. Aucun calcul de ferraillage, aucune perte ni aucun dosage standard ne sont préremplis.
- Le total de ligne est quantité × prix unitaire. Le total d’imprévus s’applique par section au sous-total des lignes, à 5 % par défaut et dans ]0 %, 50 %]. Aucun total global d’imprévus n’est ajouté.
- La flèche de retour en tête d’écran déclenche la même destination que le bouton Retour de pied de formulaire.
- FLOW-07 présente chaque ligne, le sous-total et l’imprévu par section, puis le total estimatif ; Modifier le devis revient à FLOW-06.
- FLOW-08 télécharge et réimporte un JSON versionné. Une sauvegarde protégée utilise AES-256-GCM avec clé dérivée PBKDF2-SHA-256 ; mauvais mot de passe et contenu invalide sont refusés. Un JSON non protégé s’importe sans mot de passe. Le remplacement des données de session exige une confirmation.
- FLOW-06 affiche la cause précise d’une validation bloquante, ouvre la section concernée et place le focus sur le contrôle à corriger ; les lignes laissées entièrement vides peuvent être retirées, mais au moins un coût valide reste requis.
- Sur écran étroit, la mise en page passe en une colonne, garde les champs et boutons utilisables et ne déborde pas horizontalement.

- Le parcours présente, dans l’ordre : accueil, identité, bâtiment, étape, contrôle de l’étape précédente, devis par sections, récapitulatif, sauvegarde/export.
- Pour une étape non initiale, le contrôle porte sur une seule étape précédente ; une réponse « non réalisée » affiche une information non bloquante et demande si l’utilisateur veut ouvrir le devis précédent. Le devis courant est conservé et peut être repris après validation du devis précédent.
- Les activités exclues ne sont pas des postes budgétables.
- Une ligne affiche désignation, quantité, unité, prix unitaire et total ; total = quantité × prix unitaire selon la règle d’arrondi approuvée.
- Pour les matériaux et blocs, les modes manuel/assisté et acheté/fabriqué montrent uniquement les champs correspondant au mode sélectionné. Les unités personnalisées sont disponibles en saisie manuelle seulement ; les calculs assistés utilisent des unités standards connues.
- Le FLOW-06 charge un catalogue local correspondant à l’étape : section matériel/équipements en premier, puis phases de travaux et listes de matériaux propres à la phase. Chaque équipement propose disponible/achat/location/non utilisé ; les coûts s’affichent uniquement pour achat/location. Les listes sont éditables et indicatives, sans prix ou quantité préremplis ; un avis rappelle l’adaptation aux plans et met en évidence les fournitures à confirmer.
- Pour les écrans qui les présenteront, les imprévus s’appliquent section par section, à 5 % par défaut, modifiables dans ]0 %, 50 %], avec base, taux et montant visibles ; aucun imprévu global n’est ajouté.
- Aucune formule ou quantité technique non validée n’est présentée comme référence fiable.

## 2. Données locales et échanges

- Un devis téléchargé est retrouvable après fermeture en réimportant le fichier JSON conservé par l’utilisateur ; aucun devis n’est conservé automatiquement dans le navigateur.
- Un export JSON réimporté produit les mêmes données et totaux (aller-retour).
- Un JSON mal formé, de version inconnue ou de structure invalide produit une erreur compréhensible sans écraser silencieusement les devis existants.
- FLOW-08 propose JSON réimportable, CSV, XLSX et PDF généré localement. Les exports de lecture sont débloqués après téléchargement du JSON, sans case d’attestation ; ils sont localisés dans la langue courante. Les données saisies librement ne sont pas traduites. Ils ne sont pas chiffrés ; le mot de passe facultatif protège uniquement le JSON.
- À l’enregistrement, la protection par mot de passe est optionnelle. Un fichier non protégé s’importe sans demande ; un fichier protégé exige le mot de passe correct. Un mauvais mot de passe échoue sans exposer les données en clair.
- Le choix FR/EN met à jour les écrans ; le choix de thème bascule la palette sans changer le thème clair par défaut.
- Le bouton Retour supérieur et le bouton Retour inférieur mènent au même écran précédent.

## 3. Hors ligne et ressources

- Après chargement, les parcours requis fonctionnent lorsque l’accès réseau est désactivé.
- L’interface indique que le JSON téléchargé est à conserver par l’utilisateur et qu’un effacement de session fait perdre les données non exportées.
- L’onglet Réseau ne montre aucune requête vers des ressources tierces pour les fonctions testées.
- Polices, icônes, scripts et styles nécessaires sont présents localement ; versions et licences sont consignées.
- Le rendu reste cohérent en lancement local et hébergé, si les deux modes sont retenus.

## 4. Interface

- Contrôler les largeurs 320, 360, 768 et 1280 px : pas de débordement horizontal global, actions accessibles, formulaires lisibles et colonnes/tableaux adaptés.
- Les erreurs s’affichent près du champ et sont compréhensibles ; les actions de suppression/import ont une confirmation non ambiguë sans perte accidentelle.
- Parcours clavier utilisable, focus visible, libellés associés aux champs, boutons nommés et contrastes suffisants.
- Comparer avec les deux maquettes originales à la racine du projet et enregistrer chaque divergence. Conserver les fichiers originaux intacts. La maquette indique un imprévu global de 5 %, alors que la règle approuvée exige un taux par section : signaler cette divergence de contenu tout en respectant la nouvelle règle fonctionnelle.

## 5. Protocole de compte rendu futur

Pour chaque étape de développement, consigner : date, périmètre, références relues, vérifications réellement exécutées, environnement, résultat, défauts, écarts visuels/fonctionnels, éléments non vérifiés et décision attendue. Ces critères sont une liste de validation future, pas un rapport de réussite.

## 6. Compte rendu antérieur — phases `QBT-FLOW-01` et `QBT-FLOW-02`

**Périmètre :** accueil et identité du contributeur uniquement. **Aucun écran de bâtiment ni étape suivante n’a été ajouté.**

### Vérifications exécutées le 22 octobre 2026

- Le parseur HTML Python a lu `index.html` ; les identifiants sont uniques.
- Chaque `label` de formulaire est associé à un contrôle portant l’identifiant référencé.
- Les références CSS/JavaScript de la page existent localement (`./src/styles.css`, `./src/app.js`). Aucun appel réseau explicite ni URL de ressource tierce n’a été repéré dans le code ; le SVG d’illustration est intégré.
- L’analyse `tinycss2` a accepté la feuille CSS sans erreur.
- Un contrôle lexical limité a vérifié l’équilibrage des délimiteurs JavaScript ; ce contrôle ne constitue pas une analyse grammaticale complète.
- Les empreintes SHA-256 des deux maquettes correspondent à celles enregistrées avant cette tranche ; les fichiers restent inchangés.

### Résultats non vérifiés

- L’exécution du JavaScript dans un navigateur, les interactions réelles, la console runtime, les erreurs visuelles et le débordement à 320/360/768/1280 px n’ont pas été vérifiés.
- Node.js n’est pas installé dans l’environnement d’exécution. La navigation de test vers le fichier local a été refusée par la politique de l’outil navigateur (`file:` interdit), qui interdit également de contourner ce blocage par un autre navigateur ou un serveur local.
- Aucune assertion ci-dessus ne vaut validation visuelle complète ou réussite d’un test de bout en bout. Ce compte rendu décrit l’état antérieur au présent changement.

## 7. Compte rendu — phases `QBT-FLOW-01` à `QBT-FLOW-04` (22 octobre 2026)

**Périmètre :** agrandissement typographique (+2 px), retrait du pied de page personnalisé, champs et validation du contributeur, puis écrans bâtiment et étape. Le code des phases précédentes et les références ont été relus avant modification.

**Vérifications exécutées :** `python3 -m unittest discover -s tests -v` — 7 tests réussis. Les vérifications couvrent les identifiants HTML, les associations label/champ y compris dans les formulaires rendus par JavaScript, les chemins des ressources locales, la syntaxe CSS avec `tinycss2`, l’absence de requêtes réseau explicites, les marqueurs des phases et validations, les données locales de 245 territoires (Cameroun `+237` = 9 chiffres) et les empreintes des maquettes inchangées.

**Limitation navigateur :** l’utilisateur a autorisé les vérifications dans le navigateur. L’outil navigateur a néanmoins refusé l’ouverture du projet `file:///home/miguel/Documents/QuantixBTP/index.html` (protocole autorisé par l’outil : HTTP/HTTPS uniquement). La réponse interdit de contourner le refus avec un autre navigateur, un serveur local, CDP ou une autre surface. Le rendu Firefox, les interactions réelles et les largeurs mobile restent non vérifiés dans cette exécution.

**Limites supplémentaires :** aucun moteur JavaScript n’est disponible en ligne de commande dans l’environnement. Les interactions du formulaire, la validité effective selon l’API HTML du navigateur, les erreurs de console, la vérification visuelle et l’essai réseau désactivé restent donc non vérifiés. Les tests statiques ne remplacent pas un test de bout en bout.

## 8. Compte rendu — FLOW-03 à FLOW-06 (22 octobre 2026)

**Périmètre :** métadonnées du bâtiment, liste des devises et des types, nouveau message vert FLOW-03, microtexte FLOW-04 sans retoucher les cinq étapes, contrôle non bloquant FLOW-05 et devis par sections/calculs FLOW-06. Les rôles et les références ont été relus avant les changements. Le fichier `New project/` et le répertoire de visualisations interdit n’ont pas été consultés.

**Fichiers modifiés :** `index.html`, `src/app.js`, `src/styles.css`, `AGENTS.md`, `README.md` et les six documents sous `docs/`. **Fichier ajouté :** `src/quote-calculations.js`. Les tests statiques sont dans `tests/test_project.py`. Aucune dépendance d’exécution tierce n’a été ajoutée.

**Vérifications réellement exécutées :** `python3 -m unittest discover -s tests -v` — 11 tests réussis. Ils contrôlent les ressources locales et l’absence d’appels réseau explicites, les libellés, CSS, les choix FLOW-03/04/05/06, les contraintes d’imprévus, l’indicatif camerounais et l’empreinte des deux maquettes. `tinycss2 1.5.1` a analysé la feuille CSS sans erreur. Le moteur JavaScript isolé a compilé `src/app.js` et `src/quote-calculations.js`, puis testé les calculs de volume, matériaux avec coefficients de test, nombre entier de blocs arrondi vers le haut, total de ligne, imprévus à 5 % et limites sur dimensions/ouvertures/taux. Les coefficients de ce test sont des fixtures ; aucun dosage n’est prérempli dans le produit.

**Éléments non vérifiés :** rendu réel et interactions DOM dans Firefox, parcours clavier réel, débordements aux largeurs ciblées, console du navigateur et essai avec le réseau désactivé. Le contrôle de syntaxe et des calculs purs ne remplace pas ces essais de navigateur. Les hashes des images sont identiques à ceux de référence ; les maquettes sont intactes.

**Écarts et limites signalés :** le nombre de sections est dynamique et commence à une section vide de prix/dosage (la cellule FLOW-06 de la maquette illustre « section 1 sur 4 ») ; l’utilisateur ajoute ou retire les sections. Le bouton valide les détails en mémoire et s’arrête avant FLOW-07, qui n’est pas dans le périmètre autorisé. Le catalogue de lots et les prix restent à renseigner par l’utilisateur. Le calcul béton demande des coefficients de dosage, sans recette par défaut ; le calcul des blocs ignore les joints et les pertes, et le prototype le dit dans l’interface. Le tableau FLOW-04 est inchangé.

## 9. Compte rendu — correctifs FLOW-02, FLOW-05 et catalogue FLOW-06 (24 octobre 2026)

**Références relues :** `AGENTS.md`, les six documents de `docs/`, le code et les tests existants des FLOW-02/05/06, ainsi que le document joint sur le contenu du devis. Les rôles exprimés dans le fichier joint sont traités comme contexte de demande ; ils ne certifient pas le catalogue comme exhaustif ou normatif. Les images de maquette restent intactes.

**Fichiers modifiés :** `index.html`, `src/app.js`, `src/styles.css`, `README.md`, `tests/test_project.py` et les références `docs/CAHIER_DES_CHARGES.md`, `docs/PARCOURS_UTILISATEUR.md`, `docs/ARCHITECTURE.md`, `docs/CRITERES_VALIDATION.md`, `docs/DECISIONS.md`, `docs/DEPENDANCES_ET_MODE_HORS_LIGNE.md`. **Fichiers ajoutés :** `src/quote-catalog.js`, `tests/test_runtime_contract.js`. Aucune dépendance d’exécution n’a été ajoutée.

**Vérifications exécutées :** `python3 -m unittest discover -s tests -v` — 13 tests réussis. Ils couvrent les marqueurs fonctionnels, les ressources locales, l’absence d’appels réseau explicites, la feuille CSS analysée avec `tinycss2`, les formulaires, les règles de calcul et les empreintes des maquettes. Le test `tests/test_runtime_contract.js` a été exécuté dans le runtime JavaScript isolé disponible : 8 cas de syntaxe e-mail, structure des cinq catalogues d’étape, sections matériel, identifiants et statuts, et deux calculs existants. Les trois scripts (`app.js`, `quote-catalog.js`, `quote-calculations.js`) ont été analysés par le parseur JavaScript.

**Éléments non vérifiés :** navigateur/DOM réel, parcours interactif de retour FLOW-05, affichage Firefox, états responsives, navigation clavier et fonctionnement avec réseau désactivé. La commande shell `node tests/test_runtime_contract.js` n’a pas été lancée car le binaire Node n’est pas présent dans le shell ; le fichier de test a néanmoins été exécuté par le runtime isolé du contexte. Les tests statiques et le runtime isolé ne prouvent pas une validation de bout en bout.

**Limite métier à valider :** le catalogue fournit une base de liste de contrôle pour les cinq étapes, non un bordereau exhaustif certifié. Il n’invente aucune quantité, dimension, dosage, prix ni dimensionnement. Les variantes restent à confronter aux plans et aux pratiques voulues pour chaque type de bâtiment ; `OPEN-017` demeure ouvert.

## 10. Compte rendu — navigation, FLOW-07/08, langue et thème (24 octobre 2026)

**Périmètre :** flèche Retour en tête des écrans, synthèse par ligne et par section, sauvegarde/import JSON avec protection facultative, choix français/anglais et thème sombre. L’autorisation explicite du 24 octobre 2026 a remplacé la restriction antérieure qui excluait FLOW-07/08. Les références, les modules de calcul/catalogue, l’interface et les tests ont été relus avant les modifications.

**Fichiers modifiés :** `index.html`, `src/app.js`, `src/styles.css`, `AGENTS.md`, `README.md`, `tests/test_project.py`, `tests/test_runtime_contract.js` et les six documents de référence sous `docs/`. **Fichier ajouté :** `src/quote-storage.js`. Aucune dépendance ou ressource distante n’a été ajoutée.

**Vérifications exécutées :** `python3 -m unittest discover -s tests -v` — 15 tests réussis ; ils couvrent les fichiers/ressources locales, absence d’appels réseau explicites, critères existants, FLOW-07/08, palette sombre et empreintes des maquettes. `tinycss2` a analysé `src/styles.css` sans erreur. Le test JavaScript `tests/test_runtime_contract.js` a été exécuté dans le runtime Node isolé : syntaxe des quatre modules, 8 cas e-mail, bascule de traduction FR/EN, 5 catalogues, calculs, sauvegarde JSON claire et chiffrée, import valide, rejet du mauvais mot de passe, JSON mal formé et enveloppe invalide.

**Non vérifié :** rendu Firefox réel, navigation DOM/clavier, contraste mesuré, débordement aux largeurs 320/360/768/1280 px, fonctionnement réel de `crypto.subtle` depuis `file://`, téléchargements/imports réels et inspection de l’onglet Réseau hors ligne. Les tests statiques et le runtime isolé ne constituent pas un test de bout en bout.

**Limites/écarts :** le PDF est généré par un module local avec les polices PDF standard ; les caractères hors WinAnsi sont remplacés par un point d’interrogation. La restitution visuelle dans Firefox reste à contrôler. Les exports CSV/XLSX sont des copies de lecture non chiffrées ; le mot de passe protège uniquement le JSON. Ces comportements nécessitent une vérification dans Firefox et LibreOffice. Le thème sombre est une interprétation de conception basée sur la capture, mais sa validation visuelle dans Firefox reste à faire. Le mot de passe est comparé et n’est pas mémorisé ; Web Crypto doit être disponible pour produire ou ouvrir une sauvegarde protégée. Les devis restent en mémoire jusqu’au téléchargement manuel du fichier JSON ; aucune persistance automatique de navigateur n’est ajoutée. Les données saisies par l’utilisateur ne sont pas traduites ; les libellés visibles du catalogue sont localisés lorsque leur texte est connu dans le dictionnaire embarqué.

## 10. Compte rendu — blocage de synthèse et exports (24 octobre 2026)

**Périmètre historique :** diagnostic et retour ciblé sur la validation FLOW-06 ; première génération CSV/XLSX et rapport imprimable depuis FLOW-08.

**Vérifications exécutées :** `python3 -m unittest discover -s tests -v` — 16 tests réussis. `tinycss2` a analysé le CSS sans erreur. Dans le runtime JavaScript isolé, les fonctions pures ont vérifié les cas devis vide, devis valide, statut d’équipement absent et prix unitaire manquant ; la génération CSV a vérifié BOM UTF-8 et neutralisation de cellule de formule. Le module `app.js` a été importé et a rendu l’accueil avec un DOM de substitution, ce qui vérifie son parsing et son démarrage initial, pas les interactions. Le XLSX produit a ensuite passé la vérification de son répertoire ZIP, de ses cinq parties OOXML et du parsing XML de la feuille avec `zipfile`/`ElementTree`.

**Cause trouvée :** FLOW-06 ne changeait d’écran que si toutes les validations passaient et qu’au moins une ligne chiffrée existait. En cas de refus, le feedback restait sous le formulaire sans focus ni défilement vers lui ; selon la position d’écran, le refus pouvait sembler silencieux. La validation renvoie désormais un motif et un contrôle ciblé, ouvre la section fautive et y déplace le focus.

**Non vérifié :** le parcours DOM réel dans Firefox, le clic du bouton, la restitution du statut par lecteur d’écran, les téléchargements du navigateur, la boîte d’impression PDF, l’ouverture du XLSX dans LibreOffice/Excel, les largeurs responsive et le test réseau désactivé. L’inventaire CUA de cette session n’exposait aucune fenêtre ni aucun onglet navigateur ; aucune autre surface de navigateur n’a été ouverte.

**Limites/écarts :** le PDF passe par l’impression navigateur et doit être enregistré par l’utilisateur. CSV, XLSX et PDF ne sont pas chiffrés ; seul le JSON peut l’être. L’utilisateur doit confirmer avoir conservé ce JSON avant l’activation des autres exports. Le contraste clair mesuré lors de la revue critique est sous 4,5:1 pour le texte secondaire et le texte blanc sur le rose principal ; aucune correction de palette n’a été faite dans cette tranche.

## 11. Reprise et compléments — demande du 27 octobre 2026

**Périmètre repris :** corrections de FLOW-01/02/03/05/06, parcours guidé des sections incomplètes, catalogue d’équipements détaillé et éditable, unités adaptées aux ressources, bloc main-d’œuvre, confirmation des suppressions, retour après devis d’étape précédente, synthèse sans répétition de section, et exports locaux mieux structurés. Le brief joint et les décisions du registre ont été relus ; les deux maquettes originales n’ont pas été modifiées.

**Fichiers concernés lors de cette reprise :** `src/app.js`, `src/styles.css`, `src/quote-catalog.js`, `src/quote-exports.js`, `src/quote-storage.js`, `tests/test_project.py`, `tests/test_runtime_contract.js` et les documents de référence concernés. Aucune dépendance ni ressource distante n’a été ajoutée.

**Vérifications réellement exécutées :** `python3 -m unittest discover -s tests -v` — 17 tests réussis. Le fichier `tests/test_runtime_contract.js` a été exécuté dans le runtime Node isolé de l’application Codex : vérification des modules JS, 8 cas d’e-mail, traductions FR/EN des valeurs du catalogue, 5 étapes, calculs et validations, CSV FR/EN, PDF local, XLSX généré, sauvegarde JSON claire/chiffrée et erreurs d’import. `tinycss2` a analysé `src/styles.css` sans erreur. `pdfinfo` et `pdftotext` ont confirmé un PDF A4 d’une page avec l’identité du contributeur en premier et les totaux lisibles ; un caractère d’espacement monétaire incompatible avec WinAnsi a été corrigé puis revérifié. `zipfile` et `ElementTree` ont vérifié l’archive XLSX et ses 6 fichiers XML/relations. Les tests statiques confirment l’absence de ressources réseau déclarées et l’empreinte intacte des maquettes.

**Éléments non vérifiés :** l’outil navigateur est désactivé dans les paramètres Work (« Local browser use is disabled in Work settings »). Le rendu et les interactions dans Firefox, les dimensions responsives réelles, la navigation clavier/lecteur d’écran et l’essai hors ligne navigateur n’ont donc pas été exécutés. Le PDF a été contrôlé par extraction de texte et métadonnées, pas par inspection visuelle des pages dans Firefox. Le CSV et le XLSX ont été contrôlés techniquement, pas ouverts dans un tableur graphique.

**Écart restant à traiter :** les libellés de l’interface et les exports de lecture CSV/XLSX/PDF suivent la langue active et les noms téléchargés sont localisés (`backup`/`estimate` en anglais américain, `sauvegarde`/`devis` en français). Le JSON reste toutefois le format canonique réimportable de l’application : ses valeurs de catalogue sont stockées sous leur forme interne, et les textes saisis librement restent tels quels. La demande du brief visant un fichier de sauvegarde intégralement dans la langue active n’est donc pas vérifiée/satisfaite par cette structure ; ce point requiert une adaptation et des tests de sérialisation/import avant de pouvoir déclarer la demande entièrement achevée.

## 12. Correctifs et fonctionnalités — demande du 28 octobre 2026

**Périmètre :** réinitialisation confirmée via « + Nouveau devis », exemple complet bilingue stocké en JSON local, graphiques de synthèse et inclusion au PDF, retrait de l’interface de calcul assisté sans toucher au module de calcul ni aux exigences historiques, suppression des totaux vides des lignes, filtre numérique des quantités/prix/durées, masquage des suffixes de catalogue entre parenthèses, retrait des notes techniques internes de FLOW-06, bordures de ressources en thème sombre et style du bouton de sélection de fichier.

**Fichiers modifiés :** `index.html`, `src/app.js`, `docs/DECISIONS.md`, `docs/DEPENDANCES_ET_MODE_HORS_LIGNE.md`, `docs/CRITERES_VALIDATION.md`, `tests/test_project.py`, `tests/test_runtime_contract.js`. **Fichiers d’exemple ajoutés/modifiés :** `examples/quantix-exemple-fr.json`, `examples/quantix-example-en.json`. Aucun paquet ou ressource distante n’a été ajouté ; les exemples embarqués dans la page sont identiques aux fichiers locaux pour fonctionnement `file://`.

**Vérifications exécutées :** `python3 -m unittest discover -s tests -v` — 17 tests réussis ; analyse de `src/styles.css` par `tinycss2` sans erreur. `tests/test_runtime_contract.js` a été exécuté via le runtime Node isolé : contrôles FR/EN, les cinq étapes, exemples JSON réimportables, remplissage fictif des sections pour les huit types de bâtiment et cinq étapes, calculs, validations, CSV, PDF, XLSX, sauvegardes en clair et chiffrées et rejets de fichiers invalides. `pdfinfo` et `pdftotext` ont confirmé un PDF A4 avec les graphiques en première page et les montants/totaux lisibles ; le XLSX généré a passé la lecture de l’archive ZIP et l’analyse de tous ses XML/relations. Les tests statiques vérifient la cohérence entre fichiers JSON et copies embarquées, l’absence de chargement réseau déclaré et l’empreinte intacte des maquettes.

**Éléments non vérifiés :** parcours interactif DOM, responsive réel, lecteur d’écran/clavier, et test réseau désactivé. Firefox headless a été lancé sur le fichier local pour une capture, mais s’est fermé avec le code 139 avant de produire une image ; le rendu dans Firefox n’est donc pas confirmé. Le PDF a été inspecté visuellement après rendu local en PNG ; le XLSX a été vérifié techniquement, mais CSV/XLSX n’ont pas été ouverts dans un tableur graphique. L’extraction textuelle et les tests d’unités ne remplacent pas les contrôles de bout en bout. Les tests exécutés ne couvrent pas les données métier fictives comme barème de prix ou prescription technique ; elles sont clairement signalées comme illustratives.

## 13. Microcopy et encarts verts — 28 octobre 2026

**Périmètre :** harmonisation des encarts « Demo », prérequis hors devis et sections incomplètes avec le style vert de l’encart FLOW-02 ; libellé de l’action d’exemple remplacé par « Demo » ; mise à jour des références de racine vers `/home/miguel/Documents/QuantixBTP`.

**Fichiers concernés :** `src/app.js`, `src/styles.css`, `tests/test_project.py`, `AGENTS.md`, `docs/CAHIER_DES_CHARGES.md`, `docs/DEPENDANCES_ET_MODE_HORS_LIGNE.md`, `docs/DECISIONS.md`, `docs/CRITERES_VALIDATION.md`.

**Vérifications exécutées :** `python3 -m unittest discover -s tests -v` — 19 tests réussis, dont les assertions de libellés, couleurs/encarts et chemins de racine. `tinycss2` a analysé `src/styles.css` sans erreur. Les tests JavaScript du runtime n’ont pas pu démarrer après le renommage : l’environnement Node isolé référence encore l’ancien répertoire, et aucun autre moteur JavaScript en ligne de commande n’est disponible.

**Non vérifié :** rendu visuel et interaction dans Firefox, état responsive, thème sombre et navigation accessible. Aucun navigateur n’a été utilisé pour valider ces changements.
