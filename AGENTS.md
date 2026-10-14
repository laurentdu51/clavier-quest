# AGENTS.md — Clavier Quest

## Project Overview

Jeu web d'apprentissage de la frappe au clavier, **fun pour les enfants** et
**motivant pour les adultes**. Progression par missions guidées, du plus simple
au plus rapide : lettres → syllabes → mots → phrases. Toute l'interface est en
**français**.

## Tech Stack

- **HTML/CSS/JS vanilla**, modules ES natifs. **Zéro build, zéro dépendance.**
- **Zéro backend** : la progression est stockée côté navigateur (`localStorage`)
  via une couche de stockage abstraite (prête pour un futur backend).
- **Serveur** : nginx (image `nginx:1.27-alpine`) pour Docker/Kubernetes.
- **Déploiement** : Docker + Kubernetes (Traefik/ArgoCD) — voir `DEPLOY.md`.

> ⚠️ Les modules ES ne fonctionnent **pas** en `file://`. Toujours servir via
> un serveur HTTP local (voir Key Commands).

## Project Structure

```
index.html            — Squelette : 4 écrans (accueil, carte, jeu, résultat)
css/
  reset.css           — Reset minimal
  styles.css          — Thème, écrans, cartes, boutons, HUD, layout général
  keyboard.css        — Clavier virtuel
js/
  main.js             — Contrôleur : navigation, branchement moteur↔vues
  core/
    layout.js         — Claviers AZERTY/QWERTY + mapping touche→doigt→couleur
    engine.js         — Moteur de frappe (émet les événements du jeu)
    stats.js          — WPM, précision, calcul des étoiles
    state.js          — État applicatif (profil, réglages, progression)
    storage.js        — Interface Storage + LocalStorageAdapter
  ui/
    keyboardView.js   — Rendu/animation du clavier virtuel
    hud.js            — Vitesse / précision / combo / progression
    typingView.js     — Texte cible colorié (pending/done/current/error)
  data/
    curriculum.js     — Ordre d'apprentissage des touches + chapitres
    missions.js       — Contenu des missions + helpers (unlock, resolve…)
  utils/
    dom.js            — Helpers DOM ($, el, clear, starRow)
    emitter.js        — Mini EventEmitter (on/off/emit)
kubernet/             — Manifests Kubernetes + ArgoCD + kaniko
Dockerfile, nginx.conf, docker-compose.yml
DEPLOY.md             — Procédure de déploiement complète
```

## Key Commands

```bash
# Lancer le site en local (obligatoire : modules ES)
python3 -m http.server 8000          # http://localhost:8000

# Vérifier la syntaxe de tous les modules JS
for f in $(find js -name '*.js'); do node --check "$f"; done

# Tester la logique moteur/missions hors navigateur (Node ESM)
node /tmp/opencode/cq-test.mjs       # script ad hoc (voir « Testing »)

# Docker
docker compose up --build            # http://localhost:8080
docker build -t clavier-quest:latest .

# Kubernetes
kubectl kustomize kubernet/          # build/valide les manifests (client-only)
kubectl apply -k kubernet/
./kubernet/build-push.sh docker      # build + push vers le registry
```

## Code Conventions

- **Langue UI** : français (libellés, titres de missions, messages).
- **Identifiants, noms de fichiers, fonctions** : anglais. Fonctions/vars en
  `camelCase`, classes en `PascalCase`, constantes en `UPPER_SNAKE_CASE`.
- **Modules ES** (`import`/`export`), imports **relatifs** avec extension `.js`.
- Indentation **2 espaces**. Chaînes en guillemets **doubles** en JS.
- **Pas de dépendance externe** : ne pas ajouter de lib ni de build step sans
  raison forte. Le projet doit rester ouvrable par un simple serveur statique.
- Pas de commentaires superflus ; en commentaire uniquement l'intention/le
  contrat non évident (ex. les événements du moteur).

## Architecture & Patterns

### Moteur ↔ vues (contrat d'événements)
`core/engine.js` (`TypingEngine`) émet ces événements ; `main.js` les branche :

| Événement | Charge utile | Usage |
|---|---|---|
| `correct` | `{ index, key, combo }` | marquer le caractère réussi, avancer |
| `error` | `{ index, expected, got, combo }` | flash d'erreur |
| `progress` | `{ cursor, length, ratio }` | HUD + surlignage prochaine touche |
| `combo` | `{ combo, max }` | futur runner |
| `complete` | `stats` | fin de mission, calcul des étoiles |

> **Le futur « runner »** (personnage qui avance avec les réussites et tombe si
> on rate) consommera **ces mêmes événements** sans refonte du moteur
> (voir `startRunnerPlaceholder()` dans `main.js`). Ne pas casser ce contrat.

### Données de mission (`data/missions.js`)
Une mission :
```js
{
  id: "c1m1",
  chapter: "letters" | "syllables" | "words" | "phrases",
  title: "Les repères : F et J",
  keys:  ["f", "j"]  |  { azerty: [...], qwerty: [...] },
  items: ["ff", "jj", ...]  |  { azerty: [...], qwerty: [...] },
  stars: { two: { accuracy, wpm }, three: { accuracy, wpm } },
}
```
`keys`/`items` sont soit un **tableau** (identique aux 2 dispositions), soit un
**objet `{ azerty, qwerty }`** quand le contenu diffère (ex. accents FR).
Toujours passer par `resolveKeys()`, `resolveItems()`, `missionText()`.

### Règles pédagogiques (NE PAS contourner)
1. Introduction des touches **par rangée**, en commençant par la rangée de repos,
   des index (repères `f`/`j`) vers l'extérieur — ordre dans
   `data/curriculum.js` (`KEY_ORDER`).
2. Les chapitres 2 à 4 ne réutilisent **que** des touches déjà apprises au
   chapitre 1. Vérifier en ajoutant une mission.

### Ajouter une mission
1. Ajouter l'entrée dans `MISSIONS` (`data/missions.js`), dans l'ordre du parcours.
2. Respecter les touches déjà débloquées (règle pédagogique ci-dessus).
3. Vérifier la résolution : `missionText(mission, 'azerty')` et `'qwerty'`.

### Ajouter / ajuster une disposition clavier
Tout est dans `core/layout.js` : `LAYOUTS` (rangées `keys` + `fingers`),
`FINGER_COLORS`, `KEY_ORDER` (`data/curriculum.js`). Le clavier virtuel et les
indices de main en découlent automatiquement.

### Stockage
`core/storage.js` expose une interface (`load/save/clear`) + `LocalStorageAdapter`.
`core/state.js` l'utilise. Pour brancher un backend plus tard : créer un nouvel
adapter avec la même interface, sans toucher au reste.

## Testing

- Pas de framework de test. Vérifications manuelles :
  1. `node --check` sur chaque fichier JS (syntaxe).
  2. Script Node ESM ad hoc important `engine.js` / `missions.js` pour valider la
     logique (frappe correcte → `complete`, erreurs → précision, résolution du
     texte des missions). Voir l'historique de conversation pour le gabarit.
  3. Test navigateur : accueil → carte → une mission → résultat.
- Toujours servir via HTTP (jamais `file://`).

## Deployment

Voir **`DEPLOY.md`** pour la procédure complète. En résumé :

- **Image** : `192.168.1.250:5000/clavier-quest:latest` (registry `127.0.0.1:30500`
  via mirror Talos). Build/push : `./kubernet/build-push.sh docker|kaniko`.
- **Namespace** : `clavier-quest`. Manifests dans `kubernet/` (kustomize +
  ArgoCD `argocd-application.yaml`).
- **Host Ingress** : `clavier-quest.duhaz.fr` (Traefik), TLS via HAProxy/HAProxy ACL.
- Pas de DB, pas de volume, pas de secret (site 100% statique, progression locale).
- Santé : `GET /healthz` → `200 ok`.

## Git

- Branche principale : `main`. Auteur local : `OpenCode <opencode@duhaz.fr>`.
- Remote : `ssh://git@192.168.1.240:32222/repos/clavier-quest.git` (Gitea).
- Style de commit : `feat:`, `fix:`, `chore:`, `docs:` (messages concis).
- Ne committer que ce qui est voulu ; jamais de secrets.

## Roadmap

- [x] **Étape 1 — socle jouable** : accueil, disposition, moteur, clavier
      virtuel, HUD, carte, résultats, sauvegarde locale.
- [x] **Déploiement** Docker/Kubernetes.
- [ ] **Étape 2/3** — affiner le contenu, équilibrage, checkpoints, objectifs.
- [ ] **Étape 4 — fun** : mascotte « runner » (avance/tombe selon la frappe),
      animations, sons, badges, combos.
- [ ] **Étape 5** — options (son, reset), accessibilité, responsive fin.
- [ ] Hors MVP — comptes, classements, défi du jour.

## Important Notes

- Le graphisme (mascotte, sprites, thème final) est prévu **dans un second
  temps** : ne pas bloquer les évolutions fonctionnelles dessus.
- Ne pas introduire de build step / bundler sans demande explicite.
- Garder la progression **100% côté client** tant que les comptes ne sont pas
  demandés.
