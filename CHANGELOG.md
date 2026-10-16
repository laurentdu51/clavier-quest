# Journal des modifications

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et ce projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

## [Non publié]

## [0.3.0] — 2026-10-16

Version « Mise en production » : passage en HTTPS sur
`clavier-quest.duhaz.fr`, obligations légales et référencement.

### Ajouté
- **Informations légales** accessibles depuis l'accueil (liens en pied de page) :
  **Mentions légales** (éditeur, directeur de la publication, hébergement),
  **Politique de confidentialité** (RGPD, données locales, droits de l'utilisateur)
  et **Cookies & stockage local**.
- **Bandeau d'information** sur le stockage local, affiché à la première visite
  et mémorisé après validation (aucun cookie utilisé, aucun consentement requis).
- **Référencement (SEO)** : balises `description`, `robots`, `canonical`,
  `theme-color`, **Open Graph** et **Twitter Card**, données structurées
  **JSON-LD** (`WebApplication`), `favicon.svg`, `og-image.svg`,
  `robots.txt` et `sitemap.xml`.
- **Déploiement en production** : Ingress Traefik hébergé derrière HAProxy
  avec certificat Let's Encrypt (`clavier-quest.duhaz.fr`).

### Modifié
- Version des ressources passée à `?v=0.3.0` (cache navigateur).

## [0.2.0] — 2026-10-16

Version « Joueurs » et « Défi de vitesse » : mode d'entraînement chronométré,
top des scores et jusqu'à 4 profils mémorisés localement.

### Ajouté
- **Mode Défi** : une lettre à taper avant la fin d'un chrono qui se raccourcit
  à chaque réussite (accélération progressive), fin de partie sur erreur ou
  temps écoulé. Le choix des lettres s'élargit avec le niveau.
- **Top des scores** du mode Défi : meilleurs scores sauvegardés localement,
  affichage du rang et mise en avant d'un nouveau record.
- **Compte à rebours 3-2-1-GO !** avant chaque début de partie de Défi.
- **Joueurs (4 slots)** : jusqu'à 4 profils mémorisés sur l'accueil (nom, avatar
  et progression propres à chacun). Clic sur un slot pour basculer
  (« switch rapide »), clic sur un emplacement libre pour créer un joueur neuf
  repartant de zéro, boutons **Réinitialiser la progression** et **Supprimer ce
  joueur** (avec confirmation).
- **Migration automatique** du stockage v1 (profil unique) vers v2 (4 slots) :
  le nom, l'avatar et la progression existants deviennent le joueur 1 ; aucun
  score ni réglage perdu.
- **Système de points cumulés** : chaque mission rapporte des points (étoiles +
  bonus de vitesse), cumulés par joueur et utilisés pour débloquer les missions
  suivantes.
- Page « Crédits » accessible depuis l'accueil.
- Fichier `CHANGELOG.md` et documentation agent `AGENTS.md`.

### Modifié
- **Renommer un joueur ne réinitialise plus rien** : le nom est une simple
  étiquette du slot actif. Pour repartir de zéro, on crée ou on sélectionne un
  autre slot (ou on réinitialise la progression du joueur courant).
- **Modèle de stockage v2** : la progression des missions est par joueur
  (`data.slots[i].progress`) ; le **Top du mode Défi reste global** et les
  réglages (disposition AZERTY/QWERTY, son) restent globaux à la machine.
- **Équilibrage du mode Défi** : chrono de départ plus doux (6 s par lettre,
  soit ~5–8 s au début) et accélération plus progressive (‑100 ms/réussite,
  plancher 0,6 s).
- **Plus de variété dans les lettres** du Défi : pool initial élargi (20 lettres)
  et fenêtre anti-répétition (aucune lettre ne revient avant 5 tirages).

### Corrigé
- **Déblocage des missions** : les étoiles n'étaient pas transmises à
  `computePoints()`, si bien qu'une mission à 3 étoiles ne rapportait que le
  bonus de vitesse et ne débloquait jamais la suivante.
- **Carte des missions** : le total de points s'affichait plusieurs fois dans la
  barre du haut (un `<div>` ajouté à chaque rendu sans jamais être retiré).
- **Accueil** : la liste des avatars débordait du cadre de choix du nom.
- **Missions** : restauration de `missionText()` / `isChapterUnlocked()`,
  éliminant l'erreur « Missions.missionText is not a function ».
- **Cache navigateur** : nginx sert désormais les assets en `no-cache`
  (revalidation ETag) et les assets sont versionnés (`?v=`) dans `index.html`,
  pour éviter de servir un ancien `js/main.js` après un déploiement.
- **Build (infra)** : le job kaniko ne clonait pas le dépôt (mauvaise URL et
  clé SSH absente) ; il clone désormais en `root@` avec la clé montée.

## [0.1.0] — 2026-10-14

Premier socle jouable, « Étape 1 ».

### Ajouté
- **Accueil** : choix de la disposition (AZERTY / QWERTY), nom du joueur et
  avatar, sauvegarde locale du profil.
- **Carte des missions** : 4 chapitres (lettres, syllabes, mots, phrases),
  23 missions, déblocage progressif et étoiles.
- **Moteur de frappe** (`core/engine.js`) émettant les événements `correct`,
  `error`, `combo`, `progress` et `complete` (contrat prêt pour le futur runner).
- **Clavier virtuel** coloré par doigt, mise en évidence de la prochaine touche
  et indice de main (gauche / droite).
- **HUD** : vitesse (WPM), précision, combo et progression.
- **Zone de frappe** : texte cible colorié (à venir / en cours / réussi / erreur).
- **Écran de résultat** : étoiles, statistiques et enchaînement des missions.
- **Contenu pédagogique** : introduction progressive des touches, rangée de repos
  en premier ; les chapitres 2 à 4 ne réutilisent que les touches apprises.
- **Sauvegarde locale** de la progression (`localStorage`) via une couche de
  stockage abstraite (`core/storage.js`), prête pour un futur backend.
- **Déploiement** : image Docker (nginx) et manifests Kubernetes / ArgoCD
  (`kubernet/`, `DEPLOY.md`), endpoint de santé `/healthz`.
- **Documentation** : `README.md`, `AGENTS.md`, `DEPLOY.md`.

[Non publié]: https://192.168.1.240:32222/repos/clavier-quest
[0.2.0]: https://192.168.1.240:32222/repos/clavier-quest
[0.1.0]: https://192.168.1.240:32222/repos/clavier-quest
