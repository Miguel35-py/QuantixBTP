# Architecture proposée — Quantix BTP

**Statut :** les limites produit (local, hors ligne, sans compte ni cloud) sont confirmées. Les FLOW-01 à FLOW-08 sont autorisés, ainsi que le contrôle de langue et le thème sombre optionnel.

## 1. Principes

- Application web autonome, utilisable hors réseau, sans backend applicatif.
- Même ensemble fonctionnel sur machine locale et lors d’un éventuel hébergement statique. L’hébergement en ligne fait partie de l’objectif général, mais le fournisseur, le domaine, la stratégie de déploiement et le mode de lancement hors ligne restent à choisir.
- HTML/CSS/JavaScript locaux ou autre chaîne de compilation entièrement empaquetée. Pas de requête à un CDN, API, police, analytics ou service distant à l’exécution.
- Les données du devis sont gardées en mémoire pendant la session. L’utilisateur télécharge explicitement un JSON local et peut ensuite le réimporter ; aucun autosave de navigateur n’est prévu dans cette tranche.

## 2. Proposition de couches

1. **Interface** : écrans du parcours, formulaires, états, erreurs intégrées au champ, navigation responsive.
2. **Domaine** : étapes et statuts en mémoire, sections et lignes de devis, validation, calculs purs isolés dans `src/quote-calculations.js` et taux d’imprévus par section.
3. **Persistance locale** : le modèle courant vit en mémoire pendant la session ; le JSON versionné est téléchargé explicitement par l’utilisateur et sert de sauvegarde portable. Aucun autosave ni registre de devis en navigateur n’est ajouté.
4. **Échange** : schéma JSON versionné, validation avant import, confirmation avant remplacement de la session, téléchargement/import JSON, génération locale de PDF/CSV/XLSX sans dépendance tierce. Les exports de lecture suivent le téléchargement préalable du JSON et ne sont pas chiffrés.
5. **Ressources statiques** : styles, scripts, icônes, polices et illustrations stockés avec le projet et inventoriés/licenciés.

Le contrôle des indicatifs s’appuie sur `src/phone-countries.js`, un instantané local de métadonnées de longueurs téléphoniques issu de `python-phonenumbers` (Apache-2.0). Les noms français sont préparés avec Babel (BSD-3-Clause). Le navigateur ne charge ni bibliothèque ni ressource distante pour cette validation. Les règles contrôlent les longueurs nationales possibles des numéros mobiles ; elles ne vérifient ni attribution ni joignabilité.

Ces couches sont des frontières logiques ; elles n’impliquent pas nécessairement un framework ou une bibliothèque. Aucun choix de framework n’est arrêté.

## 3. Données conceptuelles

- **Projet** : identifiant, nom, type de bâtiment, localisation éventuelle, devise, contributeur, étape et dates.
- **Étape** : identifiant stable, libellé, ordre/dépendances validés, sections.
- **Section** : libellé, lignes de ressources, taux d’imprévu propre à la section et montant calculé selon l’assiette validée. Aucun taux global.
- **Ligne** : désignation, catégorie, quantité, unité (standard connue pour calcul assisté ; unité saisissable/créable par l’utilisateur en mode manuel), prix unitaire, total calculé, mode d’acquisition/fabrication si pertinent, paramètres assistés et provenance de la quantité (assistée ou manuelle).
- **État précédent** : statut de la seule étape précédente et éventuelle note informative ; si l’utilisateur ouvre le devis précédent, l’état des devis courant et précédent est conservé en mémoire afin de permettre le retour au devis courant.
- **Catalogue de devis** : données statiques locales `src/quote-catalog.js`, organisées par étape, avec équipement et phases de travaux, unités indicatives, applicabilité et alertes « à confirmer ». Les valeurs de quantité, prix, dosage et dimensions ne sont pas intégrées.
- **Fichier de sauvegarde** : données versionnées et validées ; protection facultative choisie au moment de l’enregistrement. Un fichier protégé est déverrouillé à l’import par le mot de passe ; un fichier non protégé s’ouvre sans demande. La protection facultative du fichier utilise PBKDF2-SHA-256 avec 310 000 itérations et AES-256-GCM via Web Crypto. Le JSON non protégé reste lisible et réimportable sans mot de passe. Aucun mot de passe oublié ne peut être récupéré.

Le prototype conserve les données de devis en mémoire jusqu’au téléchargement explicite du fichier JSON ; le thème et la langue sont également limités à la session active. Aucun autosave n’est ajouté. Les modules `src/quote-calculations.js`, `src/quote-catalog.js` et `src/quote-exports.js` sont des scripts JavaScript locaux chargés depuis `index.html`, sans paquet externe. La validation pure du devis est isolée des gestionnaires d’interface. La génération XLSX emploie un paquet OOXML minimal en ZIP non compressé, produit localement ; aucun script tiers n’est chargé.

Les formules actuellement exposées sont volontairement explicites : volume rectangulaire = longueur × largeur × épaisseur ; surface = longueur × largeur ; nombre de blocs = plafond de (surface nette du mur / surface de face du bloc) ; quantité d’un constituant du béton = volume géométrique × coefficient renseigné par l’utilisateur. Les coefficients de mélange par m³ ou par bloc ne sont pas préremplis ; l’application ne déduit pas un dosage de béton ni un dimensionnement d’armatures. Le nombre de blocs calculé exclut joints, pertes et réserves. Les unités calculées sont dimensionnellement compatibles ; la conversion en sacs de ciment exige la masse de sac saisie explicitement.

Les devis d’une étape commencent avec des sections indicatives définies par `src/quote-catalog.js`. La première section gère les équipements et leurs statuts (disponible, achat, location, non utilisé) ; les autres phases contiennent des lignes modifiables avec des quantités et prix vides. Les totaux utilisent la somme des prix quantité × prix unitaire ; le taux d’imprévus est appliqué à ce sous-total par section. Le catalogue n’est ni exhaustif ni un métré validé : l’adaptation aux plans reste requise. L’arrondi et les postes comme taxes, transport et pertes restent ouverts.

## 4. Périmètre des sources

Le dossier `New project/` est expressément exclu par l’utilisateur. Il ne doit être ni consulté ni utilisé pour orienter les choix de développement. Les présentes références s’appuient sur les décisions accessibles dans l’échange, le brief et les deux maquettes archivées à la racine du projet. Toute inspection d’autres sources doit rester dans les autorisations explicites de l’utilisateur.

## 5. Risques et questions d’architecture

- Les formules usuelles de quantité sont autorisées. L’application doit montrer les hypothèses et demander les paramètres ; elle ne réalise pas de dimensionnement structurel.
- Les exports autres que JSON ne sont pas des sauvegardes réimportables en l’état.
- Le traitement d’un mot de passe oublié est reporté à une phase ultérieure. Le fichier protégé utilise Web Crypto, AES-256-GCM et PBKDF2-SHA-256 ; le support de `crypto.subtle` doit être vérifié dans les contextes navigateur visés.
- Garantir un rendu hors ligne implique d’embarquer les polices et actifs ; l’inventaire des fichiers de police et la vérification de l’apparence hors ligne restent à réaliser depuis des sources autorisées.
- Le fonctionnement depuis un fichier local (`file://`) et depuis un hébergement HTTPS peut différer pour certaines API navigateur ; les deux contextes doivent être décidés et vérifiés.
