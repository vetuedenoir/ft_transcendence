FROM nginx:alpine

RUN apk update && apk add openssl

WORKDIR /usr/share/nginx/html


COPY app/ .

COPY tools/nginx.conf /etc/nginx/conf.d/default.conf
COPY tools/script.sh .

RUN chmod +x script.sh

EXPOSE 443

CMD ["sh", "script.sh"]

# RUN openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
#     -keyout /etc/ssl/private/localhost.key \
#     -out /etc/ssl/certs/localhost.cert\
#     -subj "/C=FR/ST=Paris/L=Paris/O=42 School/OU=transcendence/CN=transcendence/"