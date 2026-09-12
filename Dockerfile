FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 DJANGO_SETTINGS_MODULE=config.settings
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libjpeg62-turbo zlib1g && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py seed && python manage.py runserver 0.0.0.0:8000"]