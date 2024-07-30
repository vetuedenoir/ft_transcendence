FROM python:3.11-slim

# Install netcat (nc) for the db check in the script.sh
RUN apt-get update && apt-get install -y netcat-openbsd && apt-get install -y curl

WORKDIR /app

COPY tools/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app/ .

	# legacy format
# ENV PYTHONUNBUFFERED 1
	# key-value format
ENV PYTHONUNBUFFERED=1


EXPOSE 8000

COPY tools/script.sh .

CMD ["sh", "script.sh"]

# Optional: Alternative way to start the Django development server directly
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]