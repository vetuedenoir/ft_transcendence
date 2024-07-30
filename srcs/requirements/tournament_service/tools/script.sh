#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e


# Wait for the PostgreSQL container to be ready
until nc -z db 5432; do
  echo "Waiting for db..."
  sleep 1
done

# auth problem - added
until nc -z auth-service 8000; do
  echo "Waiting for auth-service..."
  sleep 1
done

## auth problem - commented
## Check if a superuser exists
# if [ "$(python manage.py shell -c "from django.contrib.auth.models import User; print(User.objects.filter(is_superuser=True).exists())")" = "True" ]; then
#     # Delete the existing superuser
#     echo "from django.contrib.auth.models import User; User.objects.filter(is_superuser=True).delete()" | python manage.py shell
#     echo "Existing superuser deleted."
# fi

## auth problem - commented
## Retrieve the superuser credentials from environment variables
# DJANGO_SUPERUSER_USERNAME=${DJANGO_SUPERUSER_USERNAME:-"admin"}
# DJANGO_SUPERUSER_EMAIL=${DJANGO_SUPERUSER_EMAIL:-"admin@example.com"}
# DJANGO_SUPERUSER_PASSWORD=${DJANGO_SUPERUSER_PASSWORD:-}

## auth problem - commented
## Check if the password environment variable is set
# if [ -z "$DJANGO_SUPERUSER_PASSWORD" ]; then
#     echo "Error: The environment variable DJANGO_SUPERUSER_PASSWORD is not set."
#     exit 1
# fi

## auth problem - commented
## Create the superuser with the provided credentials
# echo "from django.contrib.auth.models import User; User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')" | python manage.py shell
# echo "Superuser created successfully!"


# sleep 2
rm -rf matchmaking/migrations
mkdir matchmaking/migrations
touch matchmaking/migrations/__init__.py
python manage.py makemigrations
python manage.py migrate

# Start the Django application using Gunicorn
# gunicorn tournament_service.wsgi:application --bind 0.0.0.0:8000
python manage.py runserver 0.0.0.0:8000

