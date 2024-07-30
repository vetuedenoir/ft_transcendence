#!/bin/bash


# This script is used to run the userman service in the background

until nc -z db 5432; do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

until nc -z auth-service 8000; do
  echo "Waiting for auth-service..."
  sleep 1
done

python manage.py makemigrations userman_app

python manage.py migrate

python manage.py runserver 0.0.0.0:8000