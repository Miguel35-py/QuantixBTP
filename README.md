# Quantix BTP — estimation de chantier locale

Le prototype couvre `QBT-FLOW-01` à `QBT-FLOW-08` : accueil, contributeur, bâtiment, étape, vérification, devis détaillé, synthèse et sauvegarde/import JSON. Une flèche Retour en tête d’écran, le sélecteur français/anglais et un thème sombre facultatif sont également disponibles. Le thème clair reste celui par défaut.

## Lancer localement

Ouvrir `index.html` dans un navigateur récent. Les styles, les scripts, le catalogue local des matériaux/équipements, les données téléphoniques et l’illustration sont locaux ou intégrés à la page ; aucune connexion Internet ni installation de dépendances n’est prévue.

Les informations du contributeur, du projet et du devis restent en mémoire jusqu’au téléchargement explicite d’un fichier JSON. Ce fichier peut être réimporté ; une protection facultative par mot de passe chiffre le contenu dans le navigateur.

Les formules assistées utilisent les mesures saisies et, pour les matériaux de béton ou les blocs fabriqués, les coefficients explicitement renseignés par l’utilisateur. Aucun dosage, prix, perte ni poids de sac n’est prérempli.

Le catalogue de FLOW-06 est une liste de contrôle indicative par étape, à vérifier contre les plans du projet. Il ne constitue pas un bordereau exhaustif certifié ni une prescription de construction.

## Références

Lire `AGENTS.md` et les documents sous `docs/` avant toute tranche suivante. Les maquettes originales sont conservées à la racine et ne doivent pas être modifiées.

Le compte rendu des contrôles effectués et de leurs limites est consigné dans `docs/CRITERES_VALIDATION.md`. FLOW-08 propose sauvegarde JSON réimportable, CSV, XLSX et impression vers PDF. Le PDF passe par la boîte d’impression du navigateur ; les fichiers CSV/XLSX/PDF ne sont pas chiffrés.

## Tests statiques

Exécuter `python3 -m unittest discover -s tests -v`. Les tests sont statiques ; le test de syntaxe CSS utilise `tinycss2` s’il est présent. Ni Python ni `tinycss2` ne sont des dépendances de l’application.
