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
- Page « Crédits » accessible depuis l'accueil.
- Fichier `CHANGELOG.md`.

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
