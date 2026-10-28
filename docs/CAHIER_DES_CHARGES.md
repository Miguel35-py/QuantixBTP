# Cahier des charges — Quantix BTP

**État :** les phases `QBT-FLOW-01` à `QBT-FLOW-08` sont autorisées. La demande du 24 octobre 2026 autorise aussi la navigation Retour en haut de chaque écran, le sélecteur français/anglais et un thème sombre facultatif ; le thème clair reste le thème initial.

## 1. But du produit

Quantix BTP est une application web en français avec option de traduction anglaise qui aide à préparer, étape par étape, un devis détaillé de travaux de bâtiment, principalement pour le gros œuvre. Elle doit organiser les postes, matériaux, quantités et prix, rendre les hypothèses visibles et laisser l’utilisateur piloter ses données. Elle ne remplace ni une étude, ni des plans d’exécution, ni la validation d’un professionnel qualifié.

## 2. Utilisateurs et contexte

Le contributeur renseigne son identité, sa fonction et son téléphone ; son nom et sa fonction sont repris dans l’en-tête des étapes suivantes et dans le devis. Le produit vise des utilisateurs qui peuvent employer des unités de chantier usuelles et des appellations locales. Il doit rester utilisable sur ordinateur et téléphone, hors connexion, sans compte ni synchronisation.

## 3. Parcours fonctionnel confirmé

Accueil concis → identité du contributeur → type de bâtiment → choix de l’étape → contrôle de l’étape précédente → devis détaillé par sections → récapitulatif → sauvegarde/export.

Pour chaque étape budgétée, le contrôle porte uniquement sur l’étape immédiatement précédente, et non sur l’ensemble des travaux antérieurs. Une étape précédente non réalisée ne bloque pas le parcours : l’application informe l’utilisateur, qui peut continuer. Les études/préparation du terrain et l’installation du chantier sont exclues du devis. Pour les fondations, la maquette montre toutefois un contrôle informatif de ces préalables hors devis ; les étapes suivantes contrôlent uniquement l’étape budgétée immédiatement précédente.

## 4. Exigences fonctionnelles

### 4.1 Projet et contributeur

- Démarrer par une page d’accueil courte qui explique la valeur du service et mène clairement à la création d’un devis.
- Recueillir le nom, la fonction et le numéro de téléphone du contributeur (obligatoires). La fonction est choisie dans une liste ; si « Autre » est sélectionné, une précision facultative peut être fournie. L’adresse e-mail est facultative, normalisée en minuscules et validée selon une syntaxe usuelle de boîte e-mail ASCII si elle est renseignée.
- Le téléphone commence avec l’indicatif `+237` (Cameroun). L’utilisateur peut choisir un autre indicatif disponible ; le nombre de chiffres national accepté est contrôlé par les métadonnées locales associées à cet indicatif. Le numéro est saisi sans l’indicatif.
- Demander, avant le choix du bâtiment, une localisation facultative du chantier et un commentaire facultatif à conserver.
- Proposer huit types : Maison (RDC), Duplex (plusieurs niveaux), Petit bâtiment commercial, Bâtiment résidentiel, Établissement scolaire, Bâtiment administratif, Entrepôt / bâtiment industriel et Autre. Si « Autre » est sélectionné, l’utilisateur doit saisir le type.
- Proposer les devises FCFA (XAF, par défaut), dollar américain (USD), euro (EUR), yen japonais (JPY) et livre sterling (GBP). Les montants ne sont pas convertis entre devises.
- Le message « Modèle de départ » garde la nuance verte de l’avis local du FLOW-02.
- Faire choisir une étape du gros œuvre parmi les cinq étapes visibles dans la maquette. Le catalogue et les dépendances sont provisoires jusqu’à validation métier.

### 4.2 Contrôle d’avancement

- Pour les fondations (première étape), demander si les études et plans sont disponibles, si la préparation du terrain est terminée et si l’installation du chantier est réalisée ; ces trois postes restent hors devis. Pour les étapes suivantes, demander uniquement si l’étape immédiatement précédente de la liste est déjà réalisée.
- Si elle n’est pas réalisée, présenter une information non bloquante. Pour une étape non initiale, demander aussi si l’utilisateur souhaite ouvrir le devis de l’étape précédente ; s’il répond oui, ouvrir ce devis et conserver celui de l’étape courante pour pouvoir y revenir après validation du devis précédent. S’il répond non, poursuivre le devis courant.
- Ne pas demander de statuts pour toutes les étapes antérieures.
- Exclure du chiffrage les études/préparation du terrain et l’installation du chantier. La signification détaillée de « préparation du terrain » par rapport aux travaux propres aux fondations reste à préciser.

### 4.3 Devis détaillé

- Présenter un catalogue local indicatif par étape, avec en premier une section matériel/équipements, puis les sections des phases de travaux adaptées à l’étape. L’utilisateur peut adapter les titres, ajouter et retirer des sections ; la section matériel initiale reste présente. Le catalogue ne remplace ni les plans ni un métré professionnel.
- Pour chaque équipement, proposer « déjà disponible », « à acheter », « à louer » ou « ne sera pas utilisé ». Les deux premiers statuts sans coût (« déjà disponible » et « ne sera pas utilisé ») n’ouvrent pas de champs de coût ; l’achat demande quantité et prix unitaire ; la location demande durée et prix par unité de durée. Aucune capacité d’unité de chantier n’est présumée.
- Chaque ligne comporte au minimum : désignation, quantité, unité, prix unitaire et prix total calculé.
- Le catalogue initial détaille séparément les matériaux par phase, sans prix prérempli, et permet l’ajout de lignes manuelles. Il vise à réduire les oublis, sans garantir une exhaustivité universelle : l’utilisateur adapte les postes aux plans et peut laisser les lignes non retenues vides ou les supprimer.
- Chiffrer les matériaux et ressources de base, plutôt que de masquer leur composition dans un produit préfabriqué lorsque la fabrication sur place est choisie. La main-d’œuvre et les autres catégories de ressources peuvent être saisies comme lignes distinctes ; leur règle de calcul doit être confirmée.
- Permettre soit un calcul assisté des quantités selon les formules usuelles de génie civil, soit la saisie manuelle des quantités et prix. Le calcul assisté doit exposer ses hypothèses et ne pas prétendre effectuer une conception ou un dimensionnement structurel. Les paramètres techniques du chantier doivent être saisis ; aucune dimension ne doit être inventée par l’application.
- Pour le béton armé, le mode assisté demande les dimensions et les coefficients du dosage validé par m³ : ciment, sable, gravier et eau. Aucun dosage n’est prérempli. Le mode manuel permet de saisir séparément quantités, unités et prix des composants. Les armatures et le coffrage peuvent être ajoutés comme lignes manuelles ; aucun ferraillage n’est calculé.
- Pour les blocs/parpaings, offrir les options « acheté » et « fabriqué sur chantier », et le choix du type de bloc (parpaing creux, parpaing plein, bloc de terre comprimée, ou autre à préciser). En mode assisté, le nombre est calculé par plafond de (surface de mur moins ouvertures / surface de face du bloc), sans joints, pertes ou réserve. Le mode acheté collecte son prix unitaire ; le mode fabriqué multiplie le nombre par les coefficients utilisateur du ciment, sable et eau par bloc. En mode manuel, chaque quantité et prix unitaire sont saisis. Les fournitures manufacturées/finies ambiguës sont signalées « à confirmer ».
- Pour les autres postes, le calcul assisté proposé porte sur longueur, surface, volume rectangulaire ou nombre d’unités à partir de mesures explicites ; la saisie manuelle reste disponible.
- Proposer les unités SI officielles pertinentes aux quantités calculées et les unités hors SI pertinentes recensées par le BIPM, avec facteurs de conversion et dimensions vérifiés. L’utilisateur peut ajouter une unité personnalisée uniquement en saisie manuelle. Les unités de chantier (camion, brouette, sac, etc.) n’ont pas de capacité présumée et ne sont pas converties sans définition explicite.
- Gérer les imprévus uniquement en pourcentage par section. Valeur initiale : 5 % par section. L’utilisateur peut la modifier à une valeur strictement supérieure à 0 % et inférieure ou égale à 50 %. Montrer clairement, pour chaque section, sa base, le montant d’imprévu et son total, puis le total général. Aucun imprévu global ne doit être appliqué.
- Une section main-d’œuvre distincte est proposée dans chaque étape pour ingénieurs, techniciens, ouvriers qualifiés et manœuvres, en jour-personne par défaut sans tarif prérempli. Le montant est calculé ligne par ligne comme quantité × prix unitaire. Le taux d’imprévu s’applique au sous-total des lignes de la section.
- Avant la synthèse, les sections incomplètes sont mises en évidence et une confirmation propose de poursuivre ou de revenir les compléter. Les statuts d’équipement indéfinis sont mis en évidence. Une ligne commencée incomplète dans la section active reste bloquante ; une synthèse sans aucun coût reste bloquée.

### 4.4 Récapitulatif, sauvegarde et exports

- Présenter les sections, lignes, sous-totaux, imprévus et total final, avec possibilité de retour pour correction.
- Sauvegarder localement sur l’appareil, sans compte, cloud, synchronisation ni partage multi-utilisateur.
- Le JSON est le format de sauvegarde réimportable demandé. Si un autre format d’export est proposé (PDF, CSV ou tableur), un JSON de sauvegarde doit être créé ou sauvegardé préalablement pour assurer le réimport facile.
- FLOW-08 produit localement un PDF sans en-têtes navigateur, un CSV et un XLSX structurés. Les documents de lecture sont étiquetés dans la langue FR/EN sélectionnée, avec les libellés et le catalogue localisés ; les contenus saisis librement par l’utilisateur restent inchangés. L’utilisateur doit d’abord télécharger la sauvegarde JSON ; aucune case d’attestation n’est demandée ensuite.
- Lors de l’enregistrement/sauvegarde, proposer facultativement de protéger le fichier par mot de passe. La définition du mot de passe intervient à ce moment-là ; un devis peut rester sans protection. À l’import, ouvrir directement un fichier non protégé ; si le fichier est protégé, demander le mot de passe et ne l’ouvrir qu’après vérification correcte. Le traitement d’un mot de passe oublié est explicitement reporté à une phase ultérieure.
- Le mot de passe protège le JSON seulement. Les formats CSV, XLSX et PDF sont des copies de lecture en clair et doivent être signalés comme tels avant leur création.
- Le fichier JSON est validé à l’import, et le remplacement de la session courante requiert une confirmation visible dans la page. Les doublons entre fichiers ne sont pas stockés dans l’application puisqu’aucun registre local de sauvegardes n’est créé.

### 4.5 Interface et accessibilité d’usage

- Reprendre l’esthétique appréciée dans les références : fond clair, blanc, rose comme accent, gris froid, cartes et contours sobres, typographie lisible et illustration bâtiment discrète.
- Garder une hiérarchie claire, des champs lisibles et des actions principales visibles. À petite largeur, présenter les formulaires en colonne et les lignes de devis sous une forme adaptée au mobile.
- Les erreurs de saisie doivent être expliquées près du champ concerné. Les boîtes modales bloquantes navigateur `alert()` ne sont pas une cible UX approuvée. Le sélecteur FR/EN couvre l’interface ; le thème sombre est facultatif, le thème clair existant reste inchangé et par défaut. Une flèche Retour en tête d’écran déclenche la même navigation que le bouton Retour bas de page.
- La typographie de l’interface existante est augmentée de 2 px. Le bandeau de pied de page pleine largeur ajouté au prototype est retiré.
- Les maquettes originales sont conservées sans modification à la racine du projet ; leur lecture par cellules est détaillée dans `PARCOURS_UTILISATEUR.md`.

## 5. Exclusions confirmées

- Études et préparation du terrain, comme postes du devis.
- Installation du chantier, comme poste du devis.
- Comptes utilisateur, backend de comptes, sauvegarde cloud, synchronisation, collaboration et partage entre utilisateurs.
- Étude géotechnique, dimensionnement, conception structurelle et validation réglementaire par l’application.

## 6. Contraintes non fonctionnelles

- Exécution hors ligne avec les fonctionnalités prévues et une présentation visuelle cohérente.
- Aucune dépendance d’exécution distante. Les ressources embarquées/locales doivent être archivées sous la racine du projet ; licences et versions doivent être documentées.
- Projet autonome sous `/home/miguel/Documents/QuantixBTP`.
- Interface responsive et utilisable au clavier ; les seuils et critères précis sont définis dans `CRITERES_VALIDATION.md`.
- Conservation locale : les données non téléchargées restent uniquement en mémoire pendant la session et sont perdues à sa fermeture ; le fichier JSON est enregistré par téléchargement à l’emplacement choisi par l’utilisateur.

## 7. Maquettes de référence

Les originaux sont conservés à la racine du projet : `quantix-maquette-ordinateur.png` et `quantix-maquette-mobile.png`. Chaque planche présente huit écrans, lus de gauche à droite puis de haut en bas : accueil, contributeur, bâtiment, étape, vérification, devis détaillé, synthèse, enregistrement.

La maquette affiche encore un exemple d’imprévu global de 5 % dans la synthèse. Cette valeur est illustrative et ce mode contredit la décision actuelle : seuls les imprévus par section sont retenus. Les fichiers images restent intacts ; la règle actuelle prévaut pour le produit.

## 8. Points de conception à documenter

Voir `DECISIONS.md` pour les éléments restant à préciser, notamment le catalogue complet des unités de chantier non standards, les règles de coûts annexes, les formats d’export autres que JSON, une éventuelle revue cryptographique future et la cible d’hébergement. Les formules usuelles sont autorisées pour les calculs de quantité, avec paramètres explicités ; la conception structurelle reste hors périmètre.

Le catalogue initial de matériaux et d’équipements est une liste de contrôle indicative dérivée de la demande jointe pour les cinq étapes. Il n’est ni certifié exhaustif, ni normatif, ni applicable sans adaptation aux plans, au système constructif et au chantier. Aucun dimensionnement, dosage, prix, rendement, perte ou capacité d’unité de chantier n’y est présumé.
