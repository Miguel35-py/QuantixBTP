# Revue critique de Quantix BTP

**Date :** 24 octobre 2026  
**Périmètre examiné :** sources HTML, CSS et JavaScript locaux, calculs, catalogue, validation/import JSON et nouveaux exports. Cette revue statique n’équivaut pas à un essai utilisateur complet dans Firefox.

## Défaut corrigé dans cette tranche

### FLOW-06 — Le bouton Synthèse pouvait sembler inactif

**Gravité :** élevée pour la continuité du parcours.  
**État :** corrigé dans `src/app.js` et `src/quote-calculations.js`.

Le bouton ne changeait d’écran que si toutes les sections respectaient les règles de validation et si au moins une ligne comportait une quantité et un prix. En cas d’échec, le code écrivait une phrase dans une zone de statut située plus bas dans le formulaire, sans amener le focus ni la vue sur cette explication. Selon la position de défilement, l’utilisateur ne percevait donc pas le refus. La navigation n’était pas cassée : la validation quittait volontairement le gestionnaire avant le passage à FLOW-07.

**Reproduction :** dans FLOW-06, laisser un titre de section vide, commencer une ligne sans prix, omettre un statut d’équipement applicable, ou supprimer toutes les lignes chiffrées ; cliquer « Synthèse ».  
**Correction :** message propre à la règle violée, retour à la section concernée et focus/défilement vers le contrôle à corriger. Les tests de domaine couvrent notamment l’absence de coût, le statut manquant, le prix unitaire absent et une estimation valide. Un test navigateur reste nécessaire pour confirmer le défilement et l’annonce par lecteur d’écran.

## Défauts confirmés

| ID | Gravité | Domaine | Constat et reproduction | Test recommandé |
|---|---|---|---|---|
| `REV-01` | Modérée (WCAG AA) | Accessibilité / contraste | Les styles clairs définissent `--muted: #7e8ba0` sur `--canvas: #f3f5f9`, soit environ **3,16:1**. Le texte blanc d’un bouton principal sur `--pink: #e74f96` atteint environ **3,53:1**. Ces combinaisons sont sous 4,5:1 pour le texte courant. Les aides, sous-titres, textes de cartes et boutons utilisent ces couleurs. | Mesurer toutes les paires texte/fond rendues dans les deux thèmes avec un outil WCAG ; exiger 4,5:1 pour le texte courant et 3:1 pour le grand texte. Vérifier états normal, survol, désactivé, sélectionné et erreur. |
| `REV-02` | Modérée (confidentialité locale) | Sécurité / exports | Le CSV, le XLSX et le rapport imprimé sont des fichiers lisibles sans chiffrement. Le mot de passe protège uniquement le JSON. La page le signale ; les fichiers de lecture contiennent le nom du chantier, les postes et les montants. Une copie exportée demeure accessible à toute personne ayant accès à son emplacement. | Exporter avec JSON protégé, puis ouvrir chaque fichier sans mot de passe ; vérifier les données réellement incluses et confirmer que l’interface annonce cette différence avant chaque génération. |
| `REV-03` | Modérée | Maintenance | `src/app.js` rassemble l’état, les écrans, les règles d’affichage, les traductions et les gestionnaires dans un seul module d’environ 1 600 lignes. Les fonctionnalités sont séparées en quelques scripts, mais les changements d’interface restent fortement couplés à cet orchestrateur. | Ajouter une vérification de régression par écran et calcul ; lors d’une future phase autorisée, envisager d’isoler les vues et la traduction sans changer le comportement. |

## Risques à confirmer dans un navigateur

| ID | Gravité potentielle | Domaine | Pourquoi ce n’est pas encore un défaut confirmé | Étapes de reproduction / test |
|---|---|---|---|---|
| `RISK-01` | Modérée | Export PDF | Le PDF est généré par `window.print()` ; le navigateur ouvre sa boîte d’impression, puis la personne choisit « Enregistrer en PDF ». La création automatique d’un fichier n’est donc pas garantie. Le rendu et la pagination n’ont pas été observés dans Firefox. | Dans FLOW-08 après la sauvegarde JSON, activer PDF, choisir « Enregistrer en PDF », ouvrir le fichier et vérifier toutes les lignes, les coupures de page et les totaux sur une page ou plusieurs. Refaire sous Firefox et Chromium. |
| `RISK-02` | Modérée | Responsive / interaction | Les règles CSS prévoient une colonne sous 760 px, mais aucun parcours réel aux largeurs 320, 360, 390, 760, 768 et 1280 px n’a été observé. Les formulaires d’équipement, les longues listes de sections et les boutons d’export ont besoin d’une vérification visuelle. | Parcourir FLOW-01 à FLOW-08 à ces largeurs, clavier seul ; vérifier absence de défilement horizontal, champs utilisables et actions visibles. Tester également zoom 200 %. |
| `RISK-03` | Modérée | Stockage protégé / contexte local | Le JSON protégé utilise l’API Web Crypto du navigateur. La disponibilité de `crypto.subtle` peut dépendre du navigateur et du contexte (`file://` ou HTTPS). Les tests automatisés ont utilisé Web Crypto fourni par Node, pas Firefox en ouverture locale. | Depuis le fichier local puis depuis un hébergement HTTPS, produire un JSON protégé, fermer/réouvrir, importer avec le bon mot de passe puis un mot de passe erroné. Vérifier les messages et la conservation de la session. |
| `RISK-04` | Faible à modérée | Accessibilité | L’inspection statique confirme des labels, des groupes et des zones `aria-live` dans plusieurs écrans, mais ne permet pas de vérifier le nom accessible calculé, l’ordre réel du focus, la restitution vocale ni les animations de défilement. | Exécuter NVDA ou Orca au clavier sur les huit étapes ; vérifier titre d’écran, progression, erreurs, choix radio/cartes, suppression d’une ligne, import et génération d’export. Tester `prefers-reduced-motion`. |

## Éléments vérifiés

- Les ressources d’exécution déclarées sont locales ; les tests statiques ne trouvent pas de dépendance réseau explicite.
- Les tests statiques vérifient les chemins d’actifs locaux, les libellés, les principaux parcours, les validations existantes et les empreintes des deux maquettes.
- La génération XLSX a été exécutée dans le runtime JavaScript isolé ; l’archive ZIP, les cinq parties OOXML attendues et le XML de la feuille ont été vérifiés par Python.
- La construction CSV inclut le BOM UTF-8, les séparateurs et l’échappement des guillemets ; les textes commençant par un caractère de formule sont neutralisés.
- **Non exécuté :** le parcours dans Firefox, les téléchargements du navigateur, l’impression PDF, l’ouverture du classeur dans LibreOffice/Excel, les contrôles de lecteur d’écran et les essais de réseau désactivé.

## Tests de bout en bout proposés

1. Remplir un devis valide puis cliquer « Synthèse » : FLOW-07 s’ouvre et affiche les mêmes montants que FLOW-06.
2. Répéter en laissant chaque type d’erreur de devis : le focus se déplace vers le bon contrôle et le message est lu sans perte des saisies.
3. Télécharger le JSON, confirmer son enregistrement, puis générer CSV, XLSX et PDF. Vérifier contenus, totaux, nom de fichier et réouverture hors ligne.
4. Refaire les exports avec JSON protégé et vérifier le comportement de déverrouillage ; s’assurer que l’interface continue d’indiquer que les formats de lecture sont non chiffrés.
5. Répéter les parcours sur mobile, au clavier, en français/anglais, en thème clair/sombre et avec le réseau désactivé.
