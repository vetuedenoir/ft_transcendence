FROM python:3.11-slim

RUN apt-get update && apt-get install -y netcat-openbsd openssl
WORKDIR /app

COPY tools/requirements.txt .


RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir daphne

# RUN apt-get install --reinstall ca-certificates

# RUN apt-get install -y wget

# RUN wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64 -O mkcert && \
#     chmod +x mkcert && \
#     mv mkcert /usr/local/bin/


# RUN mkcert -install && mkcert localhost

# RUN mkcert localhost 127.0.0.1 ::1

# RUN \
#     mv localhost.pem /etc/ssl/certs/localhost.pem && \
#     mv localhost-key.pem /etc/ssl/private/localhost.key

COPY app/ .

ENV PYTHONUNBUFFERED 1

EXPOSE 8000

COPY tools/script.sh .

CMD ["sh", "script.sh"]