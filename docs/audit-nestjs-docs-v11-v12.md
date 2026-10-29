# Audit de la documentation NestJS : de la v11 à la v12

> Enquête menée le 29 octobre 2026 sur le dépôt [`nestjs/docs.nestjs.com`](https://github.com/nestjs/docs.nestjs.com). Le dépôt a été cloné en entier et l'historique Git examiné en local (`git log`, `git log -S`, `git diff -M`, `git ls-tree`), puis recoupé avec les pages publiques des PR et des issues GitHub.
>
> Légende : **[FAIT]** vérifié directement dans une source primaire · **[INFÉRENCE]** déduction raisonnable à partir des faits · **[NON CONFIRMÉ]** hypothèse sans preuve directe.

Raccourcis utilisés dans les liens :
`C/<hash>` = `https://github.com/nestjs/docs.nestjs.com/commit/<hash>` · `PR #n` = `https://github.com/nestjs/docs.nestjs.com/pull/n`.

---

## 1. Résumé exécutif

1. **[FAIT]** Sentry et Suites (Automock) n'ont pas disparu chacun de leur côté. Leurs deux pages ont été supprimées **dans le même commit**, [`44cf2550`](https://github.com/nestjs/docs.nestjs.com/commit/44cf255075ade9d7c3b92e35cdd2f0205583b9a6) du 31 août 2026. Ce commit retire **sept recettes** d'un coup : TypeORM, Sequelize, Sentry, Compodoc, Mongoose, Suites (Automock) et Necord. Le contenu, la route Angular et l'entrée de menu disparaissent ensemble. Le message de commit décrit l'opération mais **ne donne aucune raison**. Aucune PR, issue ou discussion n'y est rattachée.
2. **[FAIT]** Ce même commit ajoute une section « NestJS Observe » à la recette *Async Local Storage*. Le 19 octobre 2026, l'ancienne URL `/recipes/sentry` est redirigée vers la page d'Observe `/observability/error-monitoring` ([PR #3632](https://github.com/nestjs/docs.nestjs.com/pull/3632)). Cette page ne mentionne pas Sentry. Les autres recettes supprimées n'ont reçu aucune redirection.
3. **[FAIT]** Il n'y a **pas de purge générale des tiers**. Entre l'état v11 et l'état actuel, les mentions de nombreux outils tiers **augmentent** : Prisma (3 → 11 fichiers), Drizzle (0 → 12), Zod (1 → 14), Valibot (0 → 11), BullMQ (1 → 8), Vitest (2 → 17), OpenTelemetry/Jaeger/Grafana (0 → 1). Plusieurs paquets explicitement signalés comme « third-party » restent documentés : `nest-commander`, `nestjs-cls`, `@mikro-orm/nestjs`.
4. **[FAIT]** Un second mouvement est net : **des paquets officiels `@nestjs/*` remplacent des solutions tierces dans les chapitres principaux**. CASL laisse la place à `@nestjs/authorization`, le module HTTP axios à `@nestjs/http-client`, bcrypt/argon2 (relégués en option) à `PasswordHasher` de `@nestjs/authentication`. Quinze nouveaux paquets `@nestjs/*` sont apparus dans la documentation. NestJS Observe, un **service commercial** de l'équipe Nest (avec offre gratuite et offres payantes), est désormais cité dans 15 pages hors de sa propre section. Une bannière promotionnelle Observe a remplacé la bannière Devtools sur 10 pages.
5. **[FAIT]** Le site a aussi été largement **réorganisé** : le chapitre `techniques/` est éclaté en `application/`, `data/` et `http/`, et deux nouvelles sections apparaissent (`observability/`, `reliability/`). La quasi-totalité des pages déplacées a reçu une redirection. Le site v11 reste archivé sous `/v11`, recettes Sentry et Suites comprises.

**Ce que les preuves permettent d'affirmer** : les suppressions de Sentry et Suites font partie d'un **nettoyage groupé de la section Recettes**, qui coïncide avec un **recentrage visible sur les paquets et le service officiels de NestJS**. Rien ne prouve en revanche une politique générale d'éviction des outils tiers, et l'équipe NestJS n'a publié aucune motivation.

---

## 2. Identification des dépôts et des versions

| Élément | Constat | Preuve |
|---|---|---|
| Dépôt source de `docs.nestjs.com` | `nestjs/docs.nestjs.com`, branche `master` (le contenu est dans `content/**/*.md`, l'application Angular dans `src/`) | [dépôt](https://github.com/nestjs/docs.nestjs.com) |
| Tags de version dans le dépôt docs | **Aucun tag.** Il existe des branches `10.0.0` et `11.0.0`, mais `11.0.0` s'arrête au 17/01/2025 (`7b1c9394`) et ne représente pas l'état final de la v11. | `git tag` (vide), `git branch -r` |
| Archive v11 | Le build statique de la v11 est commité dans `dist/v11/` ([`97796bac`](https://github.com/nestjs/docs.nestjs.com/commit/97796bacbf1a31f4a5525173f1fdc77a3cf0f2d9), 27/08/2026) et servi sous `/v11` (règle `.htaccess`). Il contient toujours les recettes Sentry et Suites (par exemple `dist/v11/chunk-STNTJ524.js`). | commit `97796bac` ; page publique `docs.nestjs.com/v11/recipes/sentry` |
| Release du framework v12 | Tag `v12.0.0` de `nestjs/nest` → `6494a6c2`, « chore(release): publish v12.0.0 release », 27/08/2026 08:58 | `git ls-remote https://github.com/nestjs/nest` |
| Release de la documentation v12 | [PR #3441](https://github.com/nestjs/docs.nestjs.com/pull/3441) « docs: v12 updates », fusionnée le 27/08/2026 à 14:09 ([`584d1007`](https://github.com/nestjs/docs.nestjs.com/commit/584d100726a4a3902c1855458dfd62bd6d9cd918)) | merge commit |

Faute de tags, l'analyse repose sur trois révisions de référence choisies dans `master` :

- **A — « v11 final »** : [`80e606ac`](https://github.com/nestjs/docs.nestjs.com/commit/80e606acc9b6d6e426f23d091520ca364dbc9786) (17/08/2026), dernier commit avant l'arrivée de la section Observability. C'est le dernier état purement v11.
- **B — « v12 initial »** : [`71a7e941`](https://github.com/nestjs/docs.nestjs.com/commit/71a7e94176c0dc994b8ab25d9cb011aeacb5ea87) (28/08/2026). La doc v12 est déjà fusionnée, juste avant la suppression des recettes.
- **C — « actuel »** : [`09cbf388`](https://github.com/nestjs/docs.nestjs.com/commit/09cbf3880982d36ff1c43a3fd98917a7a922066b) (29/10/2026), tête de `master`.

Comparaison complète A → C : <https://github.com/nestjs/docs.nestjs.com/compare/80e606ac...09cbf388>

**[FAIT]** La release du framework (27/08, matin) et la release de la doc (27/08, après-midi) tombent le même jour. Les changements étudiés ici sont pourtant **postérieurs** à ces deux releases (31/08 et après) ou **antérieurs** (Observe, 22/08). Ils appartiennent à l'historique du site, pas au tag du framework.

---

## 3. Chronologie

| Date | Commit / PR | Changement | Type |
|---|---|---|---|
| 07/01/2018 → 24/03/2019 | [PR #29](https://github.com/nestjs/docs.nestjs.com/pull/29) | Première proposition de recette Sentry (par un contributeur externe). Fermée sans fusion ni commentaire de clôture, avec des demandes de modification restées sans suite. | Contexte |
| 05/06/2022 → 03/02/2023 | [PR #2340](https://github.com/nestjs/docs.nestjs.com/pull/2340) (issue [#2288](https://github.com/nestjs/docs.nestjs.com/issues/2288)) | Ajout de la recette Automock (`content/recipes/automock.md`) par `omermorad`, auteur de la bibliothèque. | Ajout |
| 18/10/2024 | [PR #3046](https://github.com/nestjs/docs.nestjs.com/pull/3046) ([`8c464e0b`](https://github.com/nestjs/docs.nestjs.com/commit/8c464e0b)) | Automock renommé en Suites (`recipes/suites.md`). | Renommage |
| 29/01/2025 | [PR #3175](https://github.com/nestjs/docs.nestjs.com/pull/3175) ([`b137b4aa`](https://github.com/nestjs/docs.nestjs.com/commit/b137b4aa)) | Ajout de la recette Sentry par `smeubank`, qui se présente comme travaillant sur les SDK chez Sentry. Relue par d'autres personnes de Sentry, fusionnée par Kamil Myśliwiec (« LGTM »). | Ajout |
| 24/11/2025 | [PR #3351](https://github.com/nestjs/docs.nestjs.com/pull/3351) | Réécriture de la recette Suites par son auteur. | Mise à jour |
| 04/2026 | [PR #3399](https://github.com/nestjs/docs.nestjs.com/pull/3399), [PR #3249](https://github.com/nestjs/docs.nestjs.com/pull/3249) | Correctifs de la recette Suites, fusionnés. | Mise à jour |
| 22/08/2026 | [`87e75490`](https://github.com/nestjs/docs.nestjs.com/commit/87e754908407269e4dac462f450504e0e2bc4cba) (merge `99b5603f`) | **Création de la section `observability/`** (6 pages NestJS Observe : overview, sdk, dashboard, distributed-tracing, manual-instrumentation, mcp-server). | Ajout officiel |
| 27/08/2026 | [PR #3441](https://github.com/nestjs/docs.nestjs.com/pull/3441) (`584d1007`) | Documentation v12. Les recettes `sentry.md` et `suites.md` y sont **mises à jour** (imports ESM en `.js`, `await bootstrap()`). La v12 de la doc n'a donc pas supprimé ces pages : elle les a maintenues. | Mise à jour |
| 27/08/2026 | [`97796bac`](https://github.com/nestjs/docs.nestjs.com/commit/97796bacbf1a31f4a5525173f1fdc77a3cf0f2d9) | Archive statique v11 dans `dist/v11`. | Archivage |
| **31/08/2026** | [**`44cf2550`**](https://github.com/nestjs/docs.nestjs.com/commit/44cf255075ade9d7c3b92e35cdd2f0205583b9a6) | **Suppression de 7 recettes** (TypeORM, Sequelize, Sentry, Compodoc, Mongoose, Suites, Necord) et ajout d'Observe dans la recette ALS. Commit direct sur `master`, sans PR, 1 538 lignes supprimées. | Suppression |
| 21/09/2026 | [`c306f6d4`](https://github.com/nestjs/docs.nestjs.com/commit/c306f6d4212d514d1cce378b04caa5788c509b8d) | Ajout de `observability/error-monitoring.md` (Observe). | Ajout officiel |
| 22/09/2026 | [`dcd64f72`](https://github.com/nestjs/docs.nestjs.com/commit/dcd64f725e8059a0473c4241a9ca94a8140441e3) | `techniques/` éclaté en `application/`, `data/` et `http/`. Les recettes MikroORM et Prisma passent dans `data/`. | Restructuration |
| 23/09/2026 | [PR #3545](https://github.com/nestjs/docs.nestjs.com/pull/3545) (`cc3f035b`) | Le chapitre « HTTP module » (axios / `@nestjs/axios`) est remplacé par `@nestjs/http-client`. | Remplacement officiel |
| 23/09/2026 | [`2b04ff9c`](https://github.com/nestjs/docs.nestjs.com/commit/2b04ff9c) | Ajout d'une page Drizzle (`data/drizzle.md`). | Ajout |
| 29/09/2026 | [PR #3562](https://github.com/nestjs/docs.nestjs.com/pull/3562) (`5498a5e7`) | Authentification et autorisation réécrites autour de `@nestjs/authentication` et `@nestjs/authorization`. La section « Integrating CASL » est supprimée. Ajout de `@nestjs/i18n` et `@nestjs/mail`. | Remplacement officiel |
| 05/10/2026 | [PR #3574](https://github.com/nestjs/docs.nestjs.com/pull/3574) | Terminus déplacé vers `reliability/`. | Déplacement |
| 19/10/2026 | [PR #3632](https://github.com/nestjs/docs.nestjs.com/pull/3632) (`c8ca922d`) | `/recipes/sentry` redirige vers `/observability/error-monitoring`. Motif donné dans la PR : les moteurs de recherche renvoyaient encore vers l'URL, qui retombait sur la page d'accueil. | Redirection |
| 19/10/2026 | [PR #3633](https://github.com/nestjs/docs.nestjs.com/pull/3633) (`5e0386b7`) | La bannière Devtools est remplacée par une bannière Observe, sur 10 pages. | Promotion officielle |
| 20/10/2026 | [PR #3637](https://github.com/nestjs/docs.nestjs.com/pull/3637) (`a4ba2991`) | Ajout d'une page OpenTelemetry. Elle recommande Observe, mais documente honnêtement les cas où OpenTelemetry est préférable. | Ajout tiers (standard ouvert) |

---

## 4. Tableau des références : supprimées, conservées, ajoutées, déplacées

Comptes = nombre de fichiers `content/**` qui mentionnent le terme (`grep -rliF`), aux révisions A / B / C.

### 4.1 Supprimées

| Référence | Catégorie | A / B / C | Commit | Remplacement / devenir |
|---|---|---|---|---|
| Sentry (`@sentry/nestjs`) — `recipes/sentry.md` | Outil commercial tiers (recette écrite par l'éditeur) | 1 / 1 / 0 | [`44cf2550`](https://github.com/nestjs/docs.nestjs.com/commit/44cf255075ade9d7c3b92e35cdd2f0205583b9a6) | URL redirigée vers Observe *error monitoring* ([PR #3632](https://github.com/nestjs/docs.nestjs.com/pull/3632)). Archivé sous `/v11`. |
| Suites / Automock (`@suites/unit`) — `recipes/suites.md` | Bibliothèque communautaire open source (recette écrite par son auteur) | 1 / 1 / 0 | `44cf2550` | Aucune redirection. Le chapitre *Testing* garde `useMocker()` avec un indice générique, sans nommer de bibliothèque. Archivé sous `/v11`. |
| Necord — `recipes/necord.md` | Bibliothèque communautaire (déjà signalée « third-party ») | 1 / 1 / 0 | `44cf2550` | Aucune redirection. |
| Compodoc — `recipes/documentation.md` | Outil communautaire open source | 1 / 1 / 0 | `44cf2550` | Aucune redirection. |
| `recipes/sql-typeorm.md`, `recipes/sql-sequelize.md`, `recipes/mongodb.md` | Recettes « à la main » de bibliothèques tierces, doublons des intégrations officielles `@nestjs/typeorm`, `@nestjs/sequelize`, `@nestjs/mongoose` (chaque page l'indiquait elle-même en avertissement) | — | `44cf2550` | Les pages officielles restent (`data/typeorm.md`, `data/sequelize.md`, `data/mongo.md`) : TypeORM y est même **plus** cité (15 → 22 fichiers). |
| CASL (`@casl/ability`) — section « Integrating CASL » | Bibliothèque communautaire | 1 / 1 / 0 | [PR #3562](https://github.com/nestjs/docs.nestjs.com/pull/3562) | Remplacé par `@nestjs/authorization`. |
| Chapitre « HTTP module » (axios) | Intégration officielle (`@nestjs/axios`) d'une bibliothèque tierce | page supprimée | [PR #3545](https://github.com/nestjs/docs.nestjs.com/pull/3545) | Remplacé par `@nestjs/http-client`. `@nestjs/axios` reste mentionné dans 3 fichiers (terminus, distributed-tracing, http-client). |
| `@golevelup/ts-jest` (indice du chapitre Testing) | Bibliothèque communautaire | 2 / 1 / 0 | v12 updates ([`a76c786d`](https://github.com/nestjs/docs.nestjs.com/commit/a76c786da6ce9e076511e8f6cd752b6b656a728b), PR #3441) | Remplacé par une formulation neutre. **[INFÉRENCE]** Le passage de Jest à Vitest dans la doc v12 suffit à expliquer ce retrait (le paquet est spécifique à Jest). |
| Devtools (bannière) | Produit commercial **de l'écosystème NestJS** | 12 / 12 / 3 | [PR #3633](https://github.com/nestjs/docs.nestjs.com/pull/3633) | Remplacé par une bannière Observe. Les pages Devtools elles-mêmes restent. |

### 4.2 Conservées (tiers)

| Référence | Catégorie | A / B / C |
|---|---|---|
| `nest-commander` (recette, avec avertissement « third-party ») | Communautaire | 1 / 1 / 1 |
| `nestjs-cls` (recette ALS, avec avertissement « third-party ») | Communautaire | présent en C |
| MikroORM (`@mikro-orm/nestjs`, avertissement « third-party ») | Communautaire, déplacé vers `data/` | 2 / 2 / 2 |
| Passport (recette) | Communautaire | 4 / 4 / 5 |
| Pino, Winston (chapitre Logger) | Communautaire | 3 / 3 / 4 · 1 / 1 / 1 |
| bcrypt, argon2 (désormais en option, derrière `PasswordHasher`) | Communautaire | 3 / 3 / 3 · 1 / 1 / 1 |
| Datadog, Elasticsearch, Loggly, Prometheus, New Relic, AWS CloudWatch (`deployment.md`) | Commerciaux / open source tiers | conservés |
| Apollo, Mercurius, Fastify, Redis, Helmet, SWC, Webpack | Tiers variés | stables ou en hausse |

### 4.3 Ajoutées

| Référence | Catégorie | A → C |
|---|---|---|
| **NestJS Observe** (`@nestjs/observe`), section `observability/` (8 pages), bannière sur 10 pages, mentions dans 15 pages hors section | **Produit commercial de l'écosystème NestJS** (offre Free et offres payantes, facturation à l'événement, cf. `observability/overview.md`) | 0 → 20 fichiers |
| Paquets officiels nouveaux : `@nestjs/authentication`, `authorization`, `drizzle`, `http-client`, `i18n`, `idempotency`, `locks`, `mail`, `observe`, `outbox`, `platform-node`, `resilience`, `storage`, `webhooks`, `workflows` | Intégrations officielles | 15 nouveaux paquets |
| Drizzle | ORM tiers (avec intégration officielle `@nestjs/drizzle`) | 0 → 12 |
| Prisma (désormais page `data/prisma.md`) | ORM tiers | 3 → 11 |
| Zod, Valibot (Standard Schema) | Communautaires | 1 → 14 · 0 → 11 |
| Vitest | Communautaire (devient le *test runner* par défaut de la doc) | 2 → 17 |
| OpenTelemetry, Jaeger, Grafana | Standard ouvert / outils tiers | 0 → 1 (page dédiée) |
| Stripe (exemples webhooks) | Service commercial tiers | 0 → 5 |

### 4.4 Déplacées / restructurées ([`dcd64f72`](https://github.com/nestjs/docs.nestjs.com/commit/dcd64f725e8059a0473c4241a9ca94a8140441e3) et suivants)

`techniques/{configuration,events,logger,queues,serialization,task-scheduling,validation}` → `application/` · `techniques/{caching,mongo,sql}` → `data/` (`sql` ensuite scindé en `typeorm` et `sequelize`) · `techniques/{compression,cookies,file-upload,mvc,performance,server-sent-events,sessions,versioning}` → `http/` · `recipes/{mikroorm,prisma}` → `data/` · `recipes/terminus` → `reliability/` · `techniques/streaming-files` fusionné dans `file-upload`. Les anciennes URL sont redirigées (`movedTo()` / `splitInto()` dans les fichiers `*.routes.ts`).

---

## 5. Analyse détaillée

### 5.1 Sentry

- **Introduction** **[FAIT]** : [PR #3175](https://github.com/nestjs/docs.nestjs.com/pull/3175), fusionnée le 29/01/2025. Elle ajoute `content/recipes/sentry.md` (149 lignes) et `src/app/homepage/pages/recipes/sentry/sentry.component.ts`. L'auteur dit travailler chez Sentry, et la relecture a été faite par des personnes de Sentry. Une tentative antérieure ([PR #29](https://github.com/nestjs/docs.nestjs.com/pull/29), 2018–2019) avait été fermée sans fusion.
- **Maintenance** **[FAIT]** : mises à jour en 2025 ([PR #3238](https://github.com/nestjs/docs.nestjs.com/pull/3238)), puis adaptation ESM dans la doc v12 ([PR #3441](https://github.com/nestjs/docs.nestjs.com/pull/3441)), **quatre jours avant la suppression**.
- **Suppression** **[FAIT]** : [`44cf2550`](https://github.com/nestjs/docs.nestjs.com/commit/44cf255075ade9d7c3b92e35cdd2f0205583b9a6) supprime le **contenu entier** (`content/recipes/sentry.md`), le composant, la route (`recipes.routes.ts`) et l'entrée de menu « Sentry » (`menu.component.ts`). Ce n'est donc ni un simple lien retiré ni une section isolée. Le message dit seulement « Remove the TypeORM, Sequelize, Sentry, Compodoc, Mongoose, Suites (Automock), and Necord recipes along with their routes, components, and sidebar entries », **sans justification**. Aucune PR n'y est associée (la page GitHub du commit n'en montre aucune) et le commit n'a aucun commentaire.
- **Après la suppression** **[FAIT]** : [PR #3632](https://github.com/nestjs/docs.nestjs.com/pull/3632) redirige `/recipes/sentry` vers `/observability/error-monitoring`, une page consacrée exclusivement à Observe. Le motif écrit est technique : l'URL encore indexée retombait sur la page d'accueil. Aucun mot de Sentry ne subsiste dans `content/` (0 occurrence en C). La recette reste lisible dans l'archive `/v11`.
- **Remarque** **[INFÉRENCE]** : parmi les sept recettes supprimées, Sentry est **la seule** à avoir reçu une redirection. Et cette redirection pointe vers le produit concurrent officiel plutôt que vers l'archive `/v11/recipes/sentry`. C'est un choix éditorial vérifiable, mais il ne dit rien de l'intention.

### 5.2 Automock / Suites

- **Introduction** **[FAIT]** : issue [#2288](https://github.com/nestjs/docs.nestjs.com/issues/2288) puis [PR #2340](https://github.com/nestjs/docs.nestjs.com/pull/2340) (fusionnée le 03/02/2023, `content/recipes/automock.md`), par l'auteur de la bibliothèque. Renommée en Suites par [PR #3046](https://github.com/nestjs/docs.nestjs.com/pull/3046) (18/10/2024), réécrite par [PR #3351](https://github.com/nestjs/docs.nestjs.com/pull/3351) (11/2025), corrigée en 04/2026 (PR #3399, #3249), adaptée à l'ESM dans la v12 (PR #3441).
- **Suppression** **[FAIT]** : même commit [`44cf2550`](https://github.com/nestjs/docs.nestjs.com/commit/44cf255075ade9d7c3b92e35cdd2f0205583b9a6) : contenu complet (317 lignes), composant, route et entrée de menu « Suites (Automock) ». Aucune redirection n'a été ajoutée depuis.
- **Références résiduelles** **[FAIT]** : la recette n'était liée depuis aucune autre page en A. Le chapitre `fundamentals/unit-testing.md` conserve la fonctionnalité native « Auto mocking » (`useMocker()`), avec un indice générique (« A reusable mock factory helper… ») à la place de la mention de `@golevelup/ts-jest`. Ce dernier changement date de la doc v12 ([`a76c786d`](https://github.com/nestjs/docs.nestjs.com/commit/a76c786da6ce9e076511e8f6cd752b6b656a728b)) et accompagne la migration Jest → Vitest.
- **Discussions** : aucune issue ou PR expliquant le retrait n'a été trouvée (recherches GitHub « suites OR automock », « sentry », « recipe removed »).

### 5.3 NestJS Observe

- **[FAIT]** Sa documentation apparaît le **22/08/2026** ([`87e75490`](https://github.com/nestjs/docs.nestjs.com/commit/87e754908407269e4dac462f450504e0e2bc4cba)), **9 jours avant** la suppression de Sentry, avant même la release v12 du 27/08. La page *error monitoring* arrive le 21/09, et la redirection Sentry → Observe le 19/10, le même jour que le remplacement de la bannière Devtools par une bannière Observe (PR #3632 et #3633, numéros consécutifs).
- **[FAIT]** Observe est présenté comme « the official, auto-instrumented APM and observability platform for NestJS applications ». C'est un service hébergé avec plan Free et plans payants, d'après `observability/overview.md` (tableau des plans, facturation en « Observability Events »). Il s'agit donc d'un **produit commercial de l'écosystème NestJS**, au même titre que Devtools, et non d'une simple bibliothèque.
- **[FAIT]** Observe est aussi mis en avant dans des pages générales : `task-scheduling.md` (« covers it without a third-party ping service »), `logger.md`, `exception-filters.md`, `deployment.md`, `first-steps.md`, `controllers.md`, entre autres (15 fichiers hors section).
- **[FAIT]** La doc d'Observe n'est pas exclusive pour autant : la page OpenTelemetry ([PR #3637](https://github.com/nestjs/docs.nestjs.com/pull/3637)) décrit ses limites (« NestJS on Node.js only », « doesn't export or ingest OTLP today ») et indique quand choisir OpenTelemetry. Pino et Winston restent recommandés pour certains besoins.
- **[NON CONFIRMÉ]** Aucun document trouvé (commit, PR, issue) n'exprime une stratégie commerciale ou éditoriale liant Observe au retrait de Sentry. La coïncidence est réelle, mais elle ne suffit pas à établir une motivation.

---

## 6. Évaluation des hypothèses

### H1 — Nettoyage éditorial général des paquets tiers non maintenus par NestJS

- **Pour** : 4 des 7 recettes supprimées portent sur des outils tiers sans intégration officielle (Sentry, Suites, Necord, Compodoc). CASL et `@golevelup/ts-jest` ont aussi disparu.
- **Contre** : les références tierces **augmentent** globalement (Prisma, Drizzle, Zod, Valibot, BullMQ, Vitest, Stripe, OpenTelemetry). Des recettes explicitement « third-party » sont conservées (`nest-commander`, `nestjs-cls`, MikroORM, qui vient d'ailleurs d'être mise à jour pour MikroORM v7 par [PR #3497](https://github.com/nestjs/docs.nestjs.com/pull/3497), le 28/08). Les 3 autres recettes supprimées (TypeORM, Sequelize, Mongoose) concernent des bibliothèques qui restent **officiellement intégrées** et documentées ailleurs.
- **Inconnu** : le critère qui a fait garder `nest-commander` et retirer Necord.
- **Verdict** : **réfutée dans sa forme générale.** Au mieux, elle s'applique en partie à la section Recettes.

### H2 — Recentrage sur l'écosystème officiel

- **Pour** : 15 nouveaux paquets `@nestjs/*` documentés. CASL remplacé par `@nestjs/authorization`, axios par `@nestjs/http-client`, bcrypt passé derrière `PasswordHasher`. Observe est intégré dans de nombreuses pages générales, l'URL Sentry redirige vers Observe, et la bannière Observe remplace la bannière Devtools.
- **Contre** : de nouvelles intégrations tierces sont activement ajoutées (Drizzle, Prisma, Zod, Valibot, OpenTelemetry). La page OpenTelemetry présente loyalement une alternative non officielle à Observe. Les outils commerciaux tiers de `deployment.md` (Datadog, New Relic…) restent.
- **Inconnu** : l'intention. **[INFÉRENCE]** La forte mise en avant d'Observe est un fait éditorial mesurable. L'attribuer à une stratégie commerciale n'est **pas** étayé par une source primaire.
- **Verdict** : **la mieux soutenue par les faits observables**, au sens où le contenu privilégie désormais les solutions officielles là où elles existent. Elle ne s'accompagne pas d'une éviction systématique des tiers.

### H3 — Changements ponctuels et indépendants

- **Pour** : aucun document de politique n'a été trouvé. Les retraits CASL et axios suivent chacun l'arrivée d'un paquet officiel, dans des PR distinctes.
- **Contre** : Sentry et Suites sont supprimés **dans le même commit**, au sein d'un lot de 7 recettes. Ils ne sont donc pas indépendants.
- **Verdict** : **réfutée pour Sentry et Suites.**

### H4 — Simple réorganisation documentaire

- **Pour** : une grande restructuration a bien eu lieu (techniques → application/data/http, terminus → reliability, prisma/mikroorm → data), avec des redirections. L'archive `/v11` conserve les anciennes pages.
- **Contre** : Sentry et Suites ne sont **déplacés nulle part**. Leur contenu est supprimé du `master`, sans page de remplacement qui les mentionne. La redirection Sentry pointe vers une page qui ne parle pas de Sentry.
- **Verdict** : **vraie pour une large part du site, fausse pour Sentry, Suites, Necord et Compodoc.**

---

## 7. Conclusion : ce que les preuves permettent d'affirmer

**Établi** :

1. Sentry et Suites ont été supprimés intégralement (contenu, route, menu) dans le commit [`44cf2550`](https://github.com/nestjs/docs.nestjs.com/commit/44cf255075ade9d7c3b92e35cdd2f0205583b9a6) du 31/08/2026, en même temps que 5 autres recettes, sans justification écrite ni PR.
2. Ce n'est pas une purge générale des outils tiers : leur présence globale augmente, et plusieurs paquets tiers restent documentés.
3. En parallèle, la documentation fait une place croissante aux paquets et au service officiels de NestJS. Dans plusieurs cas, un paquet officiel remplace explicitement une solution tierce (CASL, axios). Observe, produit commercial de l'équipe Nest, a reçu l'ancienne URL Sentry et une visibilité transversale.
4. Le site a été profondément restructuré, mais ce n'est pas ce qui explique la disparition de Sentry et de Suites.

**Non établi** :

- Le motif du retrait des sept recettes. On ne peut pas savoir, d'après les sources, s'il s'agit de réduire la maintenance, d'écarter des doublons, de privilégier l'écosystème officiel ou d'une raison commerciale.
- L'existence d'une politique éditoriale formalisée.

**[INFÉRENCE]** L'hypothèse la plus compatible avec l'ensemble des faits combine H2 et un élagage ciblé de la section Recettes : retrait des doublons d'intégrations officielles, et d'une partie des recettes d'outils tiers sans intégration officielle. La seule source capable de trancher sur la motivation serait une déclaration de l'équipe NestJS ; l'ouverture d'une issue sur `nestjs/docs.nestjs.com` serait le moyen direct de l'obtenir.

---

### Annexe : limites de l'enquête

- Les API GitHub (issues, PR) n'étaient pas accessibles depuis la session. Les PR et issues ont été consultées par leurs pages web publiques, ce qui exclut certaines recherches fines (par exemple les discussions GitHub, ou les commentaires sur le dépôt `nestjs/nest`).
- `infoq.com` n'était pas joignable depuis l'environnement. La couverture presse n'a donc pas été vérifiée.
- Les comptes « fichiers mentionnant X » viennent d'un `grep` insensible à la casse sur `content/`. Ils servent d'indicateur de tendance, pas de mesure exacte (par exemple, « suites » au sens commun n'a pas été compté, seul `@suites` l'a été).
