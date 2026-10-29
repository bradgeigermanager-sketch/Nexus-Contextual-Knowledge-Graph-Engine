# Documentation du système — français

## Partie A — Présentation technique

### Objectif et périmètre
Nexus Contextual Knowledge Graph Engine est un environnement en développement, centré sur un graphe, destiné à représenter des entités et leurs relations, à conserver le contexte des sources et des éléments probants, à valider les données importées et à relier de vastes régions de connaissances au moyen d’artefacts de niveau supérieur. Le dépôt contient actuellement une application HTML/React dans un seul fichier, des modules de validation JavaScript, des jeux de données JSON, des schémas, des tests et des automatisations GitHub Actions.

### Couches principales
1. **Graphe canonique :** les nœuds et les arêtes représentent les entités et les relations. Les identifiants et attributs doivent être préservés lors des opérations d’import/export prises en charge.
2. **Validation et échanges :** validation structurelle, récupération de l’état sauvegardé, modes d’importation et tests par format. Le CSV prend en charge les champs entre guillemets, les guillemets échappés et les retours à la ligne intégrés. L’importateur Cypher ne traite qu’un sous-ensemble limité fondé sur des expressions régulières; ce n’est pas un parseur Cypher complet.
3. **Corpus de sources et de preuves :** enregistrements distincts pour les sources/œuvres, les auteurs/éditeurs, les affirmations et les liens de preuve. Une preuve peut viser un nœud, une arête, une affirmation ou un chemin orienté nœud–arête–nœud. La source, l’affirmation, la position probante, la fiabilité de la source et la confiance dans l’extraction sont des notions distinctes.
4. **Couche d’artefacts de réseau de niveau supérieur :** des artefacts versionnés regroupent des références typées vers des nœuds, arêtes, affirmations, sources, liens de preuve, contextes et autres artefacts. Les liens entre artefacts décrivent des relations telles que contient, chevauche, contextualise, contredit ou dépend de. Le terme « neuronal » désigne actuellement un concept de modélisation en réseau; un réseau neuronal entraîné n’est pas encore implémenté.
5. **Tests et automatisation :** les tests Node.js et GitHub Actions contrôlent les contrats de données pris en charge et les jeux d’essai.

### Provenance et incertitude
L’identité d’un objet canonique doit rester distincte de son appartenance à un artefact. Conserver, si nécessaire, la provenance, la version, la méthode de dérivation, les instantanés d’entrée, le périmètre temporel/contextuel et les références aux preuves. Similarité, pertinence, poids d’arête, confiance, fiabilité de source, position probante et vérité factuelle ne doivent pas être fusionnés en un score unique. Les données de test synthétiques ne constituent pas des citations réelles.

### État de l’implémentation
La branche de travail contient la validation du graphe et ses tests, une archive canonique avec des exemples d’import, le schéma et des exemples du corpus de sources/preuves, ainsi que la conception, le schéma, les exemples et les tests d’intégrité de la couche d’artefacts. L’éditeur visuel des références, l’explorateur d’artefacts, l’ingestion étendue de sources et l’inférence neuronale réelle restent à développer. Vérifier l’état de GitHub Actions avant d’affirmer que le dernier commit réussit les tests.

## Partie B — Guide en langage simple

Nexus est un projet qui organise l’information en éléments reliés. Un nœud représente une chose ou une idée; une arête montre le lien entre deux éléments. Les sources et les preuves doivent indiquer d’où vient une information. Les groupes plus vastes d’éléments liés sont appelés artefacts.

Un artefact pourrait réunir un rapport, un sujet, le lien entre eux et les sources qui parlent de ce lien. Les artefacts peuvent aussi se relier entre eux. Cela aide à parcourir beaucoup d’informations sans recopier les mêmes faits partout.

Le système est encore en construction. Certaines vérifications, données d’exemple, schémas et tests automatiques existent déjà. L’éditeur visuel complet, la découverte automatique de groupes et l’analyse par un véritable réseau neuronal ne sont pas encore terminés. Les exemples marqués « synthétiques » servent à illustrer le fonctionnement et ne prouvent aucun fait réel.

Pour chaque information, il faut distinguer trois questions : que dit l’enregistrement, quelle source l’appuie et quel est le degré de certitude de l’interprétation? Les désaccords et l’incertitude doivent rester visibles.

## Nouvelle étape de chargement du corpus

Le chargeur lit ensemble le graphe, les sources, les affirmations, les liens de preuve, les artefacts et leurs relations, puis vérifie les références et crée des index de recherche. Il signale les fichiers manquants et les références rompues au lieu de les accepter silencieusement. Il s’agit d’un mécanisme de chargement et de contrôle de cohérence, et non d’un réseau neuronal qui apprend ou prouve des faits.

En termes simples, le système dispose désormais d’une méthode réutilisable pour rassembler les enregistrements liés et vérifier que leurs liens pointent vers des enregistrements existants avant qu’une autre partie de l’application les utilise. Le chargeur n’est pas encore relié à l’interface web.


## Mise à jour du chargeur de corpus

Le chargeur rassemble désormais les enregistrements du graphe, des sources, des affirmations, des preuves et des artefacts dans un ensemble vérifié avec des index de recherche. Il signale les fichiers manquants et les références rompues. C’est une fonction de cohérence des données, pas un réseau neuronal qui apprend ou prouve des faits ; elle n’est pas encore reliée à l’interface du navigateur.
