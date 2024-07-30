#!/bin/bash
until nc -z db 5432; do
    sleep 1
done

# Wait for the PostgreSQL container to be ready
until nc -z db 5432; do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

# echo -e "$SSL_KEY" > /etc/ssl/private/localhost.key
# echo -e "$SSL_CERT" > /etc/ssl/certs/localhost.pem

# chmod 600 /etc/ssl/private/localhost.key
# chmod 644 /etc/ssl/certs/localhost.pem

# cat /etc/ssl/certs/localhost.pem
# cat /etc/ssl/private/localhost.key

python manage.py migrate

python manage.py runserver 0.0.0.0:8000

# daphne -b 0.0.0.0 -p 8000 auth_service.asgi:application
