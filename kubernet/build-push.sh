#!/usr/bin/env bash
# Build et push de l'image clavier-quest vers le registry du cluster.
#
#   ./kubernet/build-push.sh              -> utilisera docker
#   ./kubernet/build-push.sh kaniko       -> build dans le cluster (kaniko)
#
set -euo pipefail

APP="clavier-quest"
REGISTRY_LB="192.168.1.250:5000"      # registry via LoadBalancer
REGISTRY_LOCAL="127.0.0.1:30500"      # registry via mirror Talos
IMAGE_LB="${REGISTRY_LB}/${APP}:latest"

MODE="${1:-docker}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "${MODE}" in
  docker)
    echo ">> Build local : ${REGISTRY_LOCAL}/${APP}:latest"
    docker build -t "${REGISTRY_LOCAL}/${APP}:latest" "${ROOT_DIR}"
    docker tag "${REGISTRY_LOCAL}/${APP}:latest" "${IMAGE_LB}"
    echo ">> Push"
    docker push "${IMAGE_LB}"
    ;;
  kaniko)
    echo ">> Build kaniko dans le namespace registry"
    kubectl -n registry delete job "kaniko-build-${APP}" --ignore-not-found
    kubectl -n registry apply -f "${ROOT_DIR}/kubernet/kaniko-job.yaml"
    echo ">> Suivi : kubectl -n registry logs -f job/kaniko-build-${APP}"
    ;;
  *)
    echo "Usage: $0 [docker|kaniko]" >&2
    exit 1
    ;;
esac

echo ">> Terminé."
