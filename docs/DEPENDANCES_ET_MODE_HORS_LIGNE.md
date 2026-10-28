# Dépendances et mode hors ligne

## Exigence

L’application doit fonctionner sur la machine de l’utilisateur sans connexion Internet, avec le rendu et les fonctions prévus. Aucune ressource distante ne peut être nécessaire à l’exécution : images, polices, icônes, scripts, feuilles de style, bibliothèques ou API.

Une ressource externe retenue devra être stockée localement, avec sa version, sa source et sa licence vérifiées et enregistrées avant adoption. Le projet doit rester sous `/home/miguel/Documents/QuantixBTP`.

## Inventaire des dépendances

L’application utilise uniquement HTML, CSS et JavaScript locaux, sans framework ni bibliothèque runtime. `src/phone-countries.js` embarque un instantané local des longueurs possibles des numéros par indicatif afin de valider le champ téléphone sans réseau. `src/quote-calculations.js` contient les formules de quantité et de total par section ; `src/quote-catalog.js` contient les listes indicatives de matériel et matériaux par étape ; `src/quote-storage.js` valide et chiffre les sauvegardes JSON avec l’API Web Crypto native ; `src/quote-exports.js` fabrique le CSV et le classeur XLSX sans bibliothèque. Le PDF est construit par le module local `src/quote-exports.js`, sans appel à l’impression navigateur. Ces modules n’ajoutent aucune dépendance tierce ni ressource réseau.

La protection facultative des sauvegardes nécessite `crypto.subtle`, `TextEncoder`, `TextDecoder`, `Blob` et les fonctions de base64 disponibles dans le navigateur. Elle chiffre avec AES-256-GCM après dérivation PBKDF2-SHA-256 (310 000 itérations) ; un sel de 16 octets et un nonce de 12 octets sont générés par sauvegarde. Si Web Crypto est indisponible dans le contexte courant, l’export sans mot de passe demeure proposé et l’interface rapporte la limite. Le format de chiffrement est versionné dans l’enveloppe JSON.

Les exports CSV et XLSX sont générés localement. L’XLSX est un classeur OOXML dans une archive ZIP non compressée, avec styles et largeurs de colonnes, construit avec les API JavaScript natives. Le module fabrique aussi un PDF sans dépendance. Le rapport PDF est généré directement en PDF par le module local. Le fichier ne dépend pas des en-têtes et pieds de page d’impression du navigateur. Le CSV et le XLSX sont du texte lisible, sans chiffrement ; seule la sauvegarde JSON bénéficie de l’option de mot de passe.

### Données téléphoniques embarquées

- Source des longueurs : `python-phonenumbers` 8.12.57, licence Apache-2.0, données de Google libphonenumber. Instantané généré le 22 octobre 2026 depuis la version système présente dans l’environnement ; aucune dépendance Python n’est requise lors de l’exécution du site.
- Noms français des pays/territoires : données Babel 2.18.0, licence BSD-3-Clause, préparées une seule fois dans l’instantané JavaScript.
- Copies des licences applicables : `licenses/Apache-2.0.txt` et `licenses/BSD-3-Clause.txt`.
- La liste intégrée couvre 245 pays/territoires géographiques dans les métadonnées locales ; les codes de services internationaux non géographiques ne sont pas inclus dans ce sélecteur.
- Les indicatifs sont sélectionnables localement. Les longueurs valident les longueurs possibles des numéros mobiles selon les métadonnées ; elles ne confirment pas qu’un numéro a été attribué ou qu’il est joignable. Les numéros d’urgence, services courts et règles nationales de présentation ne sont pas validés.
- Une mise à jour de cet instantané nécessitera de vérifier la version et les licences des sources puis de réexécuter les contrôles hors ligne.

## Maquettes originales archivées

- `quantix-maquette-ordinateur.png` — PNG, 1930 × 2380, 289 851 octets, SHA-256 `0acb46571f007a1380179d668dbbb52c6262f3ffadb38e5380cd339767a162ac`.
- `quantix-maquette-mobile.png` — PNG, 980 × 3265, 231 533 octets, SHA-256 `3b243fb39ac5aa9d3a57fe7619851681571c465a7f0fb2e3da35d856517ebc7a`.

Les fichiers sont conservés à la racine du projet et n’ont pas été modifiés. Ces empreintes permettent de vérifier ultérieurement que les originaux sont identiques.

## Règles de mise en œuvre ultérieure

- Ne pas ajouter de lien `https://`, import distant, CDN, service worker dépendant d’un serveur, API, télémétrie ou appel réseau implicite.
- Si une police locale est nécessaire au rendu, intégrer ses fichiers sous le projet et vérifier sa licence. Sinon choisir une pile système explicitement approuvée et signaler l’écart visuel éventuel.
- Conserver les ressources essentielles dans le dossier racine du projet ; ne pas charger l’application depuis un emplacement externe.
- Lancer les essais hors ligne avec le réseau désactivé et inspecter les requêtes réseau ; publier le résultat sans extrapoler au-delà du scénario testé.
- Le mode d’hébergement, le domaine, HTTPS, un manifeste PWA et le service worker restent à décider. Aucun de ces mécanismes ne doit être ajouté par défaut.

## Référence normative pour les unités

La source normative consultée est la brochure SI du Bureau international des poids et mesures (BIPM), 9e édition révisée en juin 2026, ainsi que ses pages sur les unités de base et les préfixes. Elle définit sept unités de base (seconde `s`, mètre `m`, kilogramme `kg`, ampère `A`, kelvin `K`, mole `mol`, candela `cd`), 22 unités dérivées à nom spécial (radian `rad`, stéradian `sr`, hertz `Hz`, newton `N`, pascal `Pa`, joule `J`, watt `W`, coulomb `C`, volt `V`, farad `F`, ohm `Ω`, siemens `S`, weber `Wb`, tesla `T`, henry `H`, degré Celsius `°C`, lumen `lm`, lux `lx`, becquerel `Bq`, gray `Gy`, sievert `Sv`, katal `kat`) et 24 préfixes décimaux de quecto `q` (10⁻³⁰) à quetta `Q` (10³⁰).

Il n’existe pas de liste finie de toutes les unités dérivées possibles : elles se forment par combinaisons de puissances d’unités de base, et les préfixes multiplient les formes possibles. Le BIPM le précise : la brochure ne peut fournir une liste complète des unités dérivées. Pour Quantix BTP, le catalogue de calcul devra couvrir les unités pertinentes pour le génie civil et leurs conversions dimensionnellement valides, sans présenter un menu plat de toutes les unités scientifiques possibles. En plus du SI, la brochure BIPM répertorie des unités hors SI utiles au BTP, notamment minute `min` (60 s), heure `h` (3600 s), jour `d` (86 400 s), are `a` (100 m²), hectare `ha` (10 000 m²), litre `L` (1 dm³ = 10⁻³ m³), tonne `t` (10³ kg) et bar `bar` (10⁵ Pa). Les calculs n’emploieront que celles pertinentes à la grandeur/formule considérée, avec dimension et facteur vérifiés. Il ne faut jamais convertir automatiquement un camion, une brouette, un sac ou une autre unité locale sans capacité explicite. Les unités personnalisées restent disponibles en saisie manuelle uniquement.

Sources officielles : [Brochure SI du BIPM — version 4.01 (2026)](https://www.bipm.org/en/si-brochure-9), [unités de base SI](https://www.bipm.org/en/measurement-units/si-base-units), [préfixes SI](https://www.bipm.org/en/measurement-units/si-prefixes). La brochure distingue aussi les unités hors SI ; leur statut ne doit pas être confondu avec celui des unités SI.
## Exemples locaux FR/EN

Les exemples complets sont stockés dans `examples/quantix-exemple-fr.json` et `examples/quantix-example-en.json`. Leurs contenus sont embarqués à l’identique dans `index.html` afin de fonctionner depuis `file://` sans `fetch`, serveur local ou accès Internet. Les deux fichiers suivent l’enveloppe de sauvegarde Quantix version 1 et sont vérifiés par les tests de contrat. Le bloc `demo` ne fait pas partie du devis importé : il fournit des valeurs fictives pour compléter les sections de l’exemple selon le bâtiment et l’étape parcourus.
