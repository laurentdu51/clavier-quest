# ⌨️ Clavier Quest

Jeu web d'apprentissage de la frappe au clavier : simple pour les enfants,
motivant pour les adultes. Progression par missions, du plus simple au plus
rapide.

## Lancer le jeu

Les modules ES nécessitent un petit serveur local (pas d'ouverture directe en
`file://`) :

```bash
# à la racine du projet
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

(Zéro build, zéro dépendance : uniquement HTML/CSS/JS natifs.)

## Contenu

4 chapitres, 23 missions :

1. **Les lettres** — découverte des touches, rangée de repos d'abord, puis
   rangée haute et basse.
2. **Les syllabes** — enchaînements de 2 puis 3 lettres.
3. **Les mots** — courts, fréquents, avec accents, longs.
4. **Les phrases** — deux mots, phrases courtes, ponctuation, défi vitesse.

**Règle pédagogique** : les chapitres 2 à 4 ne réutilisent que des touches
déjà apprises au chapitre 1.

## Dispositions

- **AZERTY** (français) et **QWERTY** (anglais), sélectionnables à l'accueil.
- Clavier virtuel coloré par doigt + prochaine touche mise en évidence.

## Structure

```
index.html
css/    reset · styles · keyboard
js/
  core/   layout (claviers/doigts) · storage · state · engine · stats
  ui/     keyboardView · hud · typingView
  data/   curriculum (ordre des touches) · missions (contenu)
  utils/  dom · emitter
```

## Progression & sauvegarde

Sauvegarde locale (`localStorage`) via `storage.js`. L'interface de stockage est
isolée pour brancher plus tard un backend (comptes, classements).

## Déploiement

Site statique servi par **nginx** (Docker) et déployable sur le cluster
**Kubernetes** (Traefik/ArgoCD). Tout est décrit dans [DEPLOY.md](DEPLOY.md).

```bash
docker compose up --build          # local -> http://localhost:8080
./kubernet/build-push.sh docker    # build + push vers le registry
kubectl apply -k kubernet/         # déploiement K8s
```

## Roadmap

- [x] **Étape 1 — Socle jouable** : accueil, choix de disposition, moteur de
      frappe, clavier virtuel, HUD, carte des missions, résultats, sauvegarde.
- [ ] **Étape 2** — enrichir/affiner le contenu du chapitre 1, checkpoints.
- [ ] **Étape 3** — équilibrage des chapitres 2 à 4, objectifs de vitesse.
- [ ] **Étape 4 — Fun** : mascotte « runner » (le personnage avance avec les
      réussites et tombe si on rate), animations, sons, badges, combos.
- [ ] **Étape 5** — options (son, reset), accessibilité, responsive fin.
- [x] **Déploiement** — Docker (nginx) + manifests Kubernetes + ArgoCD (`DEPLOY.md`).
- [ ] Hors MVP — comptes, classements, défi du jour.

Le moteur émet déjà les événements (`correct`, `error`, `combo`, `progress`,
`complete`) que le futur runner consommera sans refonte.
