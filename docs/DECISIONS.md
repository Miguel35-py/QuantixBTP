# Registre des décisions et questions ouvertes

Ce registre sépare les instructions de l’utilisateur, les observations du prototype et les propositions de conception. Une proposition n’est pas une autorisation.

## Décisions confirmées par l’utilisateur

| ID | Décision |
|---|---|
| `DEC-001` | La racine unique des fichiers du projet est `/home/miguel/Documents/QuantixBTP`. |
| `DEC-002` | Dans cette conversation, ne pas utiliser l’ancien répertoire de visualisations, quel qu’en soit l’usage. |
| `DEC-003` | Ne pas coder les fonctionnalités avant validation des références documentaires. |
| `DEC-004` | L’application doit fonctionner hors ligne et ne dépendre d’aucune ressource distante à l’exécution. |
| `DEC-005` | Les études/préparation du terrain et l’installation du chantier sont exclues des postes du devis. |
| `DEC-006` | Pour les autres étapes, ne vérifier que l’étape précédente immédiate, pas tout l’historique. |
| `DEC-007` | Si cette étape précédente n’est pas faite, informer simplement l’utilisateur et le laisser poursuivre. |
| `DEC-008` | Les calculs assistés/automatiques utilisent des unités standards connues. L’utilisateur peut ajouter une unité personnalisée uniquement en saisie manuelle. Aucune conversion implicite d’une unité de jargon n’est faite sans définition. |
| `DEC-009` | Les quantités pourront être assistées si les données nécessaires sont fournies, mais la saisie manuelle des quantités/prix doit aussi être possible. |
| `DEC-010` | Pour les blocs, distinguer achat direct et fabrication sur chantier, et proposer un type de bloc. |
| `DEC-011` | Les imprévus sont calculés en pourcentage par section uniquement. Il n’y a pas de mode global. |
| `DEC-012` | Le JSON doit être réimportable. Pour une sauvegarde dans un autre format, un fichier JSON de sauvegarde doit être préalablement enregistré afin de permettre le réimport facile. |
| `DEC-013` | Pas de sauvegarde cloud ni de partage multi-utilisateur, car cela impliquerait backend, comptes et décisions de sécurité supplémentaires. |
| `DEC-014` | Ordre du parcours : accueil concis → identifiant du contributeur → type de bâtiment → choix d’étape et contrôle de l’étape précédente → devis par sections → récapitulatif, sauvegarde et export. Les informations du contributeur sont affichées dans l’en-tête des écrans qui suivent. |
| `DEC-015` | Lors de l’enregistrement, l’utilisateur choisit facultativement un mot de passe pour protéger le fichier de sauvegarde. À l’import, demander le mot de passe seulement si le fichier est protégé ; ouvrir un fichier non protégé directement. Le choix de mot de passe se fait à l’enregistrement, pas à l’import. |
| `DEC-016` | L’esthétique rose/blanc, fond clair et style de l’interface des captures a particulièrement plu à la cliente ; des améliorations structurelles sont possibles, sans décoration superflue. |
| `DEC-017` | Ignorer complètement le dossier `New project/` : ne pas l’ouvrir, le lire, le lister, le modifier, le déplacer ni s’en servir comme source. |
| `DEC-018` | Les deux maquettes originales sont rangées à la racine du projet sans modification. Elles sont organisées en quatre lignes et deux colonnes ; lecture de gauche à droite puis de haut en bas. La troisième cellule est donc `(0,1)` (colonne, ligne), malgré une erreur de coordonnées dans la phrase explicative. |
| `DEC-019` | Décision remplacée par `DEC-026` pour le périmètre actuellement autorisé. |
| `DEC-020` | Pour les calculs assistés, utiliser les formules usuelles de génie civil et demander les paramètres nécessaires ; cela n’autorise pas le dimensionnement structural. La saisie manuelle reste proposée. |
| `DEC-021` | L’unité personnalisée est permise uniquement en saisie manuelle. Pour le calcul assisté, utiliser les unités SI pertinentes et les unités hors SI du BIPM utiles au BTP, avec conversions dimensionnelles vérifiées. Les unités non standard de chantier ne sont pas converties sans capacité définie. |
| `DEC-022` | Les imprévus sont par section uniquement, à 5 % par défaut ; valeur modifiable par l’utilisateur dans ]0 %, 50 %]. |
| `DEC-023` | Le traitement des mots de passe oubliés est reporté à une phase ultérieure. |
| `DEC-024` | Décision remplacée par `DEC-026` : nom, fonction et téléphone sont obligatoires ; e-mail facultatif. |
| `DEC-025` | Les responsabilités permanentes (architecture, front-end, back-end si pertinent, QA, sécurité, performance, fiabilité/déploiement et relecture indépendante) sont ajoutées à `AGENTS.md`. |
| `DEC-026` | Première autorisation des phases `QBT-FLOW-01` à `QBT-FLOW-04`, étendue depuis par `DEC-028`. Dans le FLOW-02, nom, fonction et téléphone sont requis ; l’e-mail reste facultatif mais doit être valide s’il est renseigné. L’indicatif téléphonique par défaut est `+237`, sélectionnable vers d’autres indicatifs avec contrôle de longueur adapté. Le choix de bâtiment et l’étape s’appuient sur les options montrées dans les maquettes. |
| `DEC-027` | Augmenter les tailles de police de 2 px dans le prototype et supprimer uniquement le bandeau plein largeur du pied de page. |
| `DEC-028` | L’utilisateur autorise l’implémentation des phases `QBT-FLOW-05` et `QBT-FLOW-06` après FLOW-01 à FLOW-04 ; FLOW-07 et FLOW-08 restent hors périmètre. |
| `DEC-029` | FLOW-03 conserve le nom obligatoire du chantier et ajoute localisation et commentaire facultatifs avant le type de bâtiment. Il propose huit types : Maison, Duplex, Petit bâtiment commercial, Bâtiment résidentiel, Établissement scolaire, Bâtiment administratif, Entrepôt / bâtiment industriel et Autre. « Autre » exige une précision. Les devises disponibles sont XAF par défaut, USD, EUR, JPY et GBP ; aucun taux de change n’est appliqué. Le message « Modèle de départ » reprend le vert de l’avis FLOW-02. |
| `DEC-030` | Dans FLOW-04, remplacer uniquement le sous-titre destiné à l’utilisateur ; garder exactement les cinq cartes/étapes de la maquette. Une analyse technique de ces intitulés peut être rapportée sans changer leur contenu. |
| `DEC-031` | FLOW-05 : pour les fondations, demander l’état des études/plans, de la préparation générale du terrain et de l’installation du chantier ; ces postes sont exclus du devis. Pour toute autre étape, vérifier uniquement l’étape immédiatement précédente. Une réponse « Non » informe sans bloquer ni ajouter le coût d’un autre poste. |
| `DEC-032` | FLOW-06 : l’utilisateur peut créer des sections et saisir les quantités/prix manuellement ou utiliser les formules explicites. Le calcul du béton demande dimensions et dosage validé saisi ; le calcul de blocs propose parpaing creux, parpaing plein, bloc de terre comprimée ou autre à préciser, et demande dimensions de bloc, géométrie du mur et, si fabrication, coefficients par bloc. Aucun dosage, prix, perte, poids de sac ou ferraillage n’est supposé. Une conversion en sac exige que sa masse soit précisée. |
| `DEC-033` | Le devis par section démarre à 5 % d’imprévus modifiables dans ]0 %, 50 %]. Dans ce prototype, l’assiette calculée est le sous-total des lignes de la section avant imprévu ; l’arrondi final reste à confirmer. |
| `DEC-034` | FLOW-02 : l’e-mail facultatif est normalisé en minuscules. Lorsqu’il est saisi, valider une syntaxe courante ASCII de boîte e-mail (local-part point-atom, domaine à labels valides avec au moins un point), sans accepter espaces, caractères non ASCII, adresse sans domaine complet ou segments mal formés. |
| `DEC-035` | FLOW-05 : après un statut « non réalisé » de l’étape immédiatement précédente, demander si l’utilisateur veut ouvrir le devis de cette étape. « Oui » ouvre ce devis et conserve le devis choisi initialement en mémoire ; après validation du devis précédent, l’utilisateur peut revenir au devis initial. « Non » ouvre directement le devis choisi. |
| `DEC-036` | FLOW-06 : utiliser une liste de contrôle locale par étape, commençant par matériel/équipements puis des phases de travaux et matériaux distincts. Les équipements peuvent être disponibles, achetés, loués ou non utilisés ; achat et location seulement affichent les champs de coût. Les catalogues initiaux sont indicatifs et éditables, sans prix, dosage, dimensions ou quantités présumés ; les éléments manufacturés ambigus sont signalés à confirmer. |
| `DEC-037` | L’autorisation explicite du 24 octobre 2026 étend le périmètre à `QBT-FLOW-07` (synthèse) et `QBT-FLOW-08` (sauvegarde/import JSON), malgré l’ancienne limite de `DEC-028`. |
| `DEC-038` | Ajouter en tête de chaque écran après l’accueil une flèche/bouton Retour qui mène au même écran que le bouton Retour existant. Le thème clair actuel reste inchangé et par défaut ; ajouter un thème sombre professionnel inspiré de la capture du 24 octobre 2026. |
| `DEC-039` | Ajouter le choix français/anglais pour l’interface et permettre de passer dans les deux sens. Le choix de langue et de thème reste en mémoire de session ; aucune préférence durable n’est ajoutée. |
| `DEC-040` | Le fichier JSON versionné est le seul format d’import et de sauvegarde réimportable. Protection facultative : AES-256-GCM, clé dérivée par PBKDF2-SHA-256 à 310 000 itérations, sel et nonce aléatoires via Web Crypto. L’interface confirme le mot de passe sans imposer de longueur minimale non demandée. |
| `DEC-041` | La sauvegarde JSON est déclenchée explicitement par téléchargement par l’utilisateur ; le devis reste en mémoire durant la session avant cette action. L’import JSON remplace les données de session uniquement après confirmation dans l’interface. Aucun autosave ou registre durable des devis n’est ajouté. |
| `DEC-042` | À l’autorisation du 24 octobre 2026, FLOW-08 propose CSV, XLSX et PDF locaux après le téléchargement du JSON. La demande du 27 octobre supprime l’attestation manuelle et remplace l’impression navigateur par une génération PDF directe. Les formats de lecture ne sont pas chiffrés ; le mot de passe facultatif protège seulement le JSON versionné. Aucun paquet tiers n’est ajouté. En FLOW-06, un blocage de validation affiche une raison précise, bascule sur la section concernée et place le focus sur le champ ou l’action à corriger. |

## Observations sur les sources accessibles

- Le brief initial joint est disponible dans l’échange et décrit un site responsive, sans compte, des devis détaillés, ressources et main-d’œuvre, la persistance locale, des exports/imports et des validations de champs. Les clarifications ultérieures du tableau ci-dessus prévalent lorsqu’elles modifient ce brief.
- Le dossier `New project/` est hors périmètre et ne constitue pas une source documentaire ou technique pour la suite.
- Les captures initiales montrent l’accueil et un écran de configuration ; les deux maquettes complètes sont désormais présentes à la racine du projet. Elles ont été examinées visuellement et leurs dimensions et empreintes SHA-256 sont consignées dans `DEPENDANCES_ET_MODE_HORS_LIGNE.md`.
- Chaque maquette montre huit écrans, dans l’ordre : accueil, contributeur, bâtiment, étape, vérification, devis détaillé, synthèse, enregistrement. La synthèse contient un exemple d’imprévu global de 5 %, désormais obsolète fonctionnellement au regard de `DEC-011` ; aucune image n’a été modifiée.
- Les échanges visibles dans le contexte de ce chat ont été exploités. L’accès à l’intégralité technique de l’historique ou aux fichiers générés précédemment n’est pas garanti ; demander la source si une décision n’apparaît pas dans ce registre.

## Analyse UX antérieure des captures initiales

Les deux captures de l’interface qui a plu à la cliente montrent un accueil avec titre, plusieurs actions, bénéfices et chantiers sauvegardés, puis un écran de configuration assez dense en deux colonnes. L’analyse précédente a relevé les cinq points suivants et proposé ces corrections ; ce sont des recommandations à comparer aux maquettes finales, pas des modifications approuvées :

1. **Accueil :** plusieurs actions de poids proche concurrencent « Commencer ». Garder une action de démarrage dominante et reléguer la reprise/liste des devis en actions secondaires.
2. **Hiérarchie d’étape :** les informations de progression et la tâche principale gagneraient à être rattachées plus clairement à l’étape active. Afficher un titre d’étape explicite, un indicateur de progression sobre et un seul CTA principal.
3. **Microtextes :** plusieurs aides et libellés sont petits et peu contrastés. Augmenter leur lisibilité, raccourcir les aides, et garder les consignes de sécurité/calcul visibles au bon endroit.
4. **Structure du formulaire :** la capture met chantier et devis dans un écran dense et demande des informations avant l’identité selon le flux approuvé depuis. Fractionner selon le parcours décidé et afficher les champs conditionnels au moment utile.
5. **Mobile :** la capture ne montre aucun état mobile vérifiable. La maquette mobile ultérieure propose une seule colonne et des cartes au lieu d’un tableau large ; cette solution doit être contrôlée sur la source originale et sur de petites largeurs.

La palette claire rose/blanc, le fond doux et la sobriété ont été retenus comme préférence de la cliente. Ne pas ajouter de décoration sans utilité fonctionnelle.

## Questions ouvertes nécessitant validation

| `OPEN-017` | Valider le catalogue initial de matériaux/équipements par les plans-types et pratiques retenus pour chaque bâtiment. | Le catalogue livré est une aide indicative généralisée et ne peut être déclaré exhaustif ou universel ; les systèmes constructifs, matériaux locaux et travaux inclus varient selon chaque projet. |

| ID | Question / risque | Pourquoi il faut décider |
|---|---|---|
| `OPEN-002` | Valider le catalogue d’étapes et l’ordre/dépendances, y compris les variantes par nombre de niveaux. | La liste précédente est une proposition, pas une séquence universelle. |
| `OPEN-005` | Valider la liste exhaustive des fonctions proposées au contributeur. | La fonction est maintenant requise, mais le catalogue de choix n’a pas été exhaustivement défini. |
| `OPEN-006` | Déterminer les unités non standard de chantier et leurs facteurs de conversion éventuels. | Les formules assistées utilisent des unités SI compatibles ; les unités personnalisées ne sont admises qu’en saisie manuelle. |
| `OPEN-007` | Confirmer les dosages/coefficient locaux à utiliser comme valeurs de référence, s’il faut un jour en proposer. | Le prototype les demande à l’utilisateur et ne préremplit aucune recette. |
| `OPEN-008` | Préciser le périmètre détaillé des prix : main-d’œuvre, transport, taxes, pertes et coûts d’équipement. | Une ligne manuelle est possible ; aucune de ces assiettes n’est préremplie ou décomposée automatiquement. |
| `OPEN-009` | Confirmer les règles d’arrondi à l’affichage/export. | Le prototype calcule les quantités et totaux sans arrondi intermédiaire ; l’affichage monétaire est limité à deux décimales. |
| `OPEN-010` | Préciser ultérieurement si l’algorithme de protection JSON retenu doit changer et définir les messages détaillés d’erreur d’import. | La tranche actuelle utilise Web Crypto, PBKDF2-SHA-256 et AES-256-GCM. La récupération d’un mot de passe oublié est reportée. |
| `OPEN-011` | Résolue par `DEC-042` puis actualisée par `DEC-046` : PDF, CSV et XLSX locaux après téléchargement JSON. | Formats de lecture non chiffrés. |
| `OPEN-012` | Décider si une version ultérieure doit ajouter une conservation durable dans le navigateur ou une sauvegarde automatique. | La tranche actuelle garde le devis en mémoire jusqu’au téléchargement explicite du JSON ; aucun autosave n’est inclus. |
| `OPEN-013` | Définir hébergement statique cible et mode hors ligne attendu : ouverture fichier local, application installée/PWA, ou les deux. | L’objectif général inclut l’hébergement, tandis que le nouveau besoin impose autonomie hors réseau. |
| `OPEN-015` | Confirmer si un historique de coûts de travaux déjà réalisés doit être conservé comme information hors budget courant. | Cette fonction n’a pas été explicitement validée dans les décisions de conception accessibles. |
| `OPEN-016` | Définir le comportement de détection des doublons si un registre durable de devis est ajouté ultérieurement. | La tranche actuelle n’a pas de registre local et confirme le remplacement de la session à l’import. |

## Propositions antérieures non validées

- Variantes détaillées de lots, unités de chantier non standard, stockage navigateur, sauvegarde automatique, indicateurs historiques, formats d’export, hébergement et stratégie PWA.
- Les valeurs de la maquette (prix, quantités, taux) sont des exemples visuels uniquement.
- Les devises XAF, USD, EUR, JPY et GBP sont maintenant confirmées ; aucun taux de conversion automatique n’est autorisé.
- Les choix visuels d’amélioration de la première analyse UX sont des recommandations ; ils ne remplacent pas la maquette et ne sont pas des décisions de produit sans validation.
- La maquette montre un exemple de 5 % global ; il est conservé comme visuel de référence historique seulement. Pour le produit, `DEC-011` fait foi : imprévus par section exclusivement.

## Actualisation après l’autorisation du 24 octobre 2026

`DEC-037` à `DEC-042` remplacent les statuts de périmètre antérieurs qui indiquaient FLOW-07/08 comme non autorisés. FLOW-07 calcule les montants section par section selon les règles FLOW-06. FLOW-08 télécharge un JSON versionné et permet son import avec vérification et confirmation de remplacement. Le sélecteur de langue et le thème sont des préférences de session. Le FLOW-08 ajoute CSV/XLSX/PDF locaux, précédés du téléchargement de la sauvegarde JSON ; ces formats de lecture sont non chiffrés. FLOW-06 affiche maintenant la cause d’un blocage de validation et amène le focus vers la correction.



## Décisions actualisées après la demande du 27 octobre 2026

| ID | Décision confirmée |
|---|---|
| `DEC-043` | FLOW-01 ajoute une entrée d’import JSON, le pictogramme de fenêtre devient un dollar rose et la demande de hausse typographique de 2 px est appliquée aux textes via les règles de taille existantes. Le changement est additif aux tailles qui avaient déjà été augmentées. |
| `DEC-044` | FLOW-06 sépare les lignes d’équipement, permet les matériels personnalisés et « tout disponible », réserve des unités manuelles adaptées à la désignation avec une unité par défaut, ajoute une section main-d’œuvre par étape et supprime les duplications exactes d’équipement dans les listes matière. Les taux de main-d’œuvre ne sont jamais préremplis. Le catalogue reste indicatif et à valider selon plans et contexte. |
| `DEC-045` | Les sections laissées incomplètes sont mises en évidence et une confirmation explicite permet de poursuivre. Les statuts d’équipement non définis sont signalés, mais ne bloquent plus après confirmation. Une ligne commencée et incomplète dans la section courante demeure bloquante ; une estimation sans aucun coût reste bloquée. Toute suppression de ligne, matériel ou section demande confirmation. |
| `DEC-046` | FLOW-07 regroupe les lignes sous un en-tête de section sans répéter le nom de section à chaque ligne. FLOW-08 produit le PDF localement (sans impression navigateur), ainsi que CSV et XLSX structurés et localisés en français ou anglais. Le JSON doit toujours être téléchargé avant activation des formats de lecture, mais la case d’attestation après téléchargement est supprimée. Le JSON conserve des clés/données canoniques de sauvegarde et ajoute la langue d’interface utilisée au moment de l’export ; les textes saisis par l’utilisateur restent tels qu’ils ont été rédigés. |
| `DEC-047` | Si l’utilisateur choisit d’estimer l’étape précédente, il termine le parcours FLOW-06 à FLOW-08 de cette étape. Après le téléchargement du JSON, FLOW-08 propose de revenir à l’étape qu’il avait choisie initialement. |
| `DEC-048` | FLOW-01 propose un exemple complet en français ou en anglais selon la langue active. Chaque exemple est fourni par un fichier JSON local au format de sauvegarde Quantix ; les valeurs restent fictives et sont adaptées au bâtiment et à l’étape sélectionnés. En cours de consultation, changer la langue charge les données de l’exemple dans l’autre langue. |
| `DEC-049` | FLOW-06 expose uniquement la saisie manuelle : l’option, les formulaires et le contenu explicatif du calcul assisté sont retirés de l’interface. Les modules de calcul et leur documentation sont conservés pour une éventuelle réintroduction ultérieure. |
| `DEC-050` | Dans FLOW-06, les totaux de lignes incomplets restent vides, les indications techniques internes du catalogue ne sont pas affichées, et les suffixes entre parenthèses des désignations de catalogue sont masqués. Les champs de quantité, durée et prix acceptent uniquement les chiffres. |
| `DEC-051` | FLOW-07 présente d’abord deux graphiques côte à côte : les coûts regroupés par catégorie de matériau et les parts du total. Les coûts d’équipement sont regroupés en une catégorie unique et les imprévus de chaque section sont répartis au prorata dans les catégories ; les graphiques sont également inclus au début du PDF. |
| `DEC-052` | Le bouton d’exemple de FLOW-01 porte le libellé « Demo » dans les interfaces française et anglaise. |
| `DEC-053` | Les encarts d’exemple, les prérequis exclus et l’avertissement de sections incomplètes partagent le même style vert `.local-notice` que l’encart de confidentialité de FLOW-02, dans les deux thèmes et langues. |

