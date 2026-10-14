# Déploiement — Docker & Kubernetes

Le site est **100% statique** (HTML/CSS/JS, zéro build, zéro dépendance) :
il est servi par **nginx**. La progression des joueurs est stockée côté
navigateur (`localStorage`), donc **aucune base de données, aucun volume,
aucun secret** n'est nécessaire.

## Fichiers

```
Dockerfile              # image nginx + fichiers du site
nginx.conf              # cache, gzip, endpoint /healthz
.dockerignore
docker-compose.yml      # test local
kubernet/
  namespace.yaml
  deployment.yaml       # nginx, probes /healthz, resources, HPA-track
  service.yaml          # ClusterIP :80
  ingress.yaml          # Traefik -> clavier-quest.duhaz.fr
  hpa.yaml              # 1..3 replicas (CPU 70%)
  kustomization.yaml
  argocd-application.yaml
  kaniko-job.yaml       # build dans le cluster
  build-push.sh         # script build+push
```

## 1. Test local (Docker)

```bash
# avec docker compose
docker compose up --build      # http://localhost:8080

# ou à la main
docker build -t clavier-quest:latest .
docker run --rm -p 8080:80 clavier-quest:latest
```

## 2. Build & push de l'image

Le registry du cluster est exposé sur `192.168.1.250:5000` (LoadBalancer) et
`127.0.0.1:30500` (mirror Talos).

```bash
# Build local + push
./kubernet/build-push.sh docker

# Build dans le cluster via kaniko
./kubernet/build-push.sh kaniko
kubectl -n registry logs -f job/kaniko-build-clavier-quest
```

> Le kaniko-job clone `ssh://git@192.168.1.240:32222/repos/clavier-quest.git`.
> Adaptez cette URL (et `--dockerfile`) si le dépôt change.

## 3. Déploiement Kubernetes

### Option A — ArgoCD (recommandé, comme les autres apps)

1. Copier le dossier `kubernet/` dans le dépôt `k8s-manifests`
   (branche `main`), sous `clavier-quest/kubernet/`.
2. Appliquer l'Application :

   ```bash
   kubectl apply -f kubernet/argocd-application.yaml
   ```

3. Forcer une sync si besoin :

   ```bash
   kubectl patch application clavier-quest -n argocd --type merge \
     -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{"revision":"main","syncStrategy":{"apply":{}}}}}'
   ```

### Option B — application manuelle

```bash
kubectl kustomize kubernet/ | kubectl apply -f -
# ou
kubectl apply -k kubernet/
```

Vérifications :

```bash
kubectl -n clavier-quest get pods,svc,ingress,hpa
kubectl -n clavier-quest rollout status deploy/clavier-quest
```

## 4. DNS & accès

- **Host Ingress** : `clavier-quest.duhaz.fr` (à adapter dans
  `kubernet/ingress.yaml`).
- Faire pointer le DNS selon la cible :
  - `192.168.1.249` — Traefik (interne)
  - `192.168.1.253` — HAProxy (TLS Let's Encrypt)

### Ajout dans HAProxy (terminaison TLS)

Dans `haproxy.cfg` :

```
acl is_clavier_quest hdr(Host) -i clavier-quest.duhaz.fr
use_backend traefik if is_clavier_quest
```

Puis ajouter le `Certificate` dans `certificates.yaml` et le volume TLS
correspondant dans `haproxy-deployment.yaml` (voir la méthode HAProxy du dépôt
`k8s-manifests`). Commit & push → ArgoCD resynchronise.

## 5. Mise à jour du site

1. Modifier le contenu (HTML/CSS/JS).
2. Rebuild + push l'image :

   ```bash
   ./kubernet/build-push.sh docker
   ```

3. Redémarrer le déploiement pour tirer `latest` :

   ```bash
   kubectl -n clavier-quest rollout restart deploy/clavier-quest
   ```

## 6. Endpoint de santé

`GET /healthz` → `200 ok` (utilisé par les probes `livenessProbe` /
`readinessProbe` et le `HEALTHCHECK` Docker).

## Checklist

- [ ] Image buildée et poussée dans le registry
- [ ] `kubernet/` copié dans `k8s-manifests` (ou `kubectl apply -k`)
- [ ] ArgoCD App créée et sync
- [ ] Pod `Running 1/1`
- [ ] Service `clavier-quest` + Ingress présents
- [ ] DNS `clavier-quest.duhaz.fr` pointe vers Traefik/HAProxy
- [ ] `curl -I https://clavier-quest.duhaz.fr` → `200`
