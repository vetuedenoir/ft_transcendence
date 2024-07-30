#!/bin/bash


echo -e "$SSL_CERT" > /etc/ssl/certs/transcendence.pem
echo -e "$SSL_KEY"> /etc/ssl/private/transcendence.key


nginx -g "daemon off;"