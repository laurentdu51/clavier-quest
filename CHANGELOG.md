# Journal des modifications

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et ce projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

## [Non publié]

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
- Page « Crédits » accessible depuis l'accueil.
- Fichier `CHANGELOG.md`.

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
- **Cache navigateur** : nginx sert désormais les assets en `no-cache`
  (revalidation ETag) et les assets sont versionnés (`?v=`) dans `index.html`,
  pour éviter de servir un ancien `js/main.js` après un déploiement.

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
[0.1.0]: https://192.168.1.240:32222/repos/clavier-quest
