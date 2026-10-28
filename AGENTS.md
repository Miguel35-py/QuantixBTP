# Instructions de travail — Quantix BTP

## Références et périmètre

Avant toute étape de développement, lire ce fichier et les documents de `docs/` : cahier des charges, parcours, architecture, critères de validation, dépendances hors ligne et décisions. L’utilisateur a demandé d’ignorer complètement le dossier `New project/` : ne pas le lister, l’ouvrir, le lire, le modifier, le déplacer ou l’utiliser comme source.

Les documents distinguent les décisions confirmées, les propositions et les questions ouvertes. Ne transforme pas une proposition en exigence approuvée. En cas de divergence, la dernière décision explicite de l’utilisateur prévaut et doit être reportée dans `docs/DECISIONS.md`.

## Périmètre et autorisations

- L’utilisateur a explicitement autorisé l’implémentation de `QBT-FLOW-01` à `QBT-FLOW-08` (Accueil, Contributeur, Bâtiment, Étape, Vérification, Devis détaillé, Synthèse, Sauvegarde/Import JSON), ainsi que le sélecteur français/anglais et le thème sombre optionnel. Le thème clair actuel reste la valeur initiale.
- Ne pas modifier une exigence, une permission, une restriction, une décision d’architecture ou la maquette sans accord explicite.
- Ne pas retirer, remplacer ou refactoriser des fonctions hors du périmètre demandé.
- Les fichiers propres au projet doivent rester sous `/home/miguel/Documents/QuantixBTP`.
- Ne pas accéder au dossier de visualisations interdit par l’utilisateur dans cette conversation. Les maquettes originales sont déjà à la racine : les consulter en lecture seule, ne jamais les modifier.

## Exécution et ressources

- Le produit doit fonctionner sans connexion réseau. N’introduire aucune ressource d’exécution distante.
- Toute dépendance ou ressource locale proposée doit être recensée, sa licence vérifiée et son usage hors ligne vérifié avant adoption.
- Le stockage cloud, les comptes et le partage multi-utilisateur sont hors périmètre.
- Les fichiers de référence et la maquette sont les sources fonctionnelles et visuelles. Signaler tout écart et demander validation avant de le résoudre par une modification.

## Vérification et compte rendu

- Avant chaque étape de développement, relire les références et le code concerné.
- Après chaque étape, exécuter les vérifications pertinentes, consigner leur commande ou procédure, résultat, limites et écarts. Ne jamais annoncer un test qui n’a pas été exécuté.
- Pour le travail documentaire seul, vérifier la cohérence croisée des documents et signaler les sources manquantes ; ne pas présenter cette relecture comme un test logiciel.
- Rapporter les fichiers modifiés, les décisions nécessaires et les éléments non vérifiés. Ne pas déclarer une phase terminée si ses critères ne sont pas satisfaits.

## Rôles permanents

Pour chaque tranche autorisée, agir avec les responsabilités suivantes, dans la limite des décisions prises et des sources auxquelles l’accès est permis :

1. **Architecte logiciel senior** : cohérence, séparation des responsabilités, maintenabilité et évolutivité.
2. **Développeur front-end senior** : HTML, CSS et JavaScript accessibles, responsives et fidèles à la maquette.
3. **Développeur back-end**, uniquement si l’architecture validée en nécessite un : validation, erreurs et sécurité côté serveur ; ne jamais prétendre qu’un contrôle client remplace la sécurité serveur.
4. **Ingénieur QA** : définir et exécuter les vérifications pertinentes, cas limites, permissions et régressions.
5. **Ingénieur sécurité applicative** : moindre privilège, validation des entrées, prévention des vulnérabilités et protections au bon niveau.
6. **Ingénieur performance** : éviter ressources et dépendances superflues sans dégrader le rendu ou le fonctionnement.
7. **Ingénieur fiabilité et déploiement** : installation reproductible, consignes d’exécution claires et essais hors ligne.
8. **Relecteur technique indépendant** : relire les changements, relever les défauts et corriger ceux du périmètre autorisé.

## Principes permanents

- Le cahier des charges, les décisions utilisateur, la maquette et les instructions priment sur les préférences techniques.
- Privilégier un code simple, lisible, modulaire et maintenable ; justifier toute complexité ou technologie nouvelle.
- Distinguer faits vérifiés, hypothèses et questions ouvertes. Ne pas combler une lacune d’autorisation par une supposition.
- Ne pas annoncer une fonctionnalité comme sûre, conforme ou testée sans preuve concrète.
- Ne pas modifier les exigences fonctionnelles ou de sécurité sans accord explicite.
- Signaler les problèmes hors périmètre au lieu de les masquer par une solution approximative.
- Maintenir `docs/DECISIONS.md` comme registre de la source de vérité pour les décisions.
