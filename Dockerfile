# Site statique (HTML/CSS/JS) servi par nginx.
# Aucune étape de build : on copie les fichiers et on sert.
FROM nginx:1.27-alpine

# Configuration nginx (cache, gzip, endpoint de santé /healthz)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Contenu du site
COPY index.html /usr/share/nginx/html/index.html
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
