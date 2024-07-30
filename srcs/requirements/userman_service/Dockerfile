FROM python:3.11-slim

WORKDIR /app

COPY tools/requirements.txt .

RUN apt-get update && \
    apt-get install -y  curl postgresql-client iputils-ping netcat-openbsd && \
    pip install --no-cache-dir -r requirements.txt

RUN pip install --no-cache-dir daphne

COPY app/ .

ENV PYTHONUNBUFFERED 1

EXPOSE 8000

COPY tools/script.sh .
RUN chmod +x script.sh

CMD ["sh", "script.sh"]

# CMD ["sh", "-c", "until pg_isready -h db -p 5432; do sleep 1; done && python manage.py makemigrations userman_app && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]

#daphne -b 0.0.0.0 -p 8000 userman_service.asgi:application
