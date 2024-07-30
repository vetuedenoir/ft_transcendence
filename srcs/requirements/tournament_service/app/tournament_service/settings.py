# app/tournament_service/settings.py
import os
from pathlib import Path
import dj_database_url
import django

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'your-secret-key'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]

# Application definition
INSTALLED_APPS = [
    # 'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'matchmaking.apps.MatchmakingConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    # 'DEFAULT_PERMISSION_CLASSES': [                                 # auth problem - commented
    #     'rest_framework.permissions.IsAuthenticated',
    # ],
}

ROOT_URLCONF = 'tournament_service.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'tournament_service.wsgi.application'

# auth problem - commented --> si pas precisé, il prend le model par defaut qui est auth.User
AUTH_USER_MODEL = 'matchmaking.User'


## auth problem - commented
database_url = os.getenv('DATABASE_URL');


DATABASES = {
    'default': dj_database_url.config(
        default=database_url,
        conn_max_age=600,
    )
}

CORS_ALLOW_ALL_ORIGINS = True

# auth problem - added
# CORS_ALLOWED_ORIGINS = [
#     'http://localhost:8080',
#     "http://127.0.0.1:8080",
#     "http://localhost:5500",
#     "http://127.0.0.1:5500",
# ]

# Use a different database for tests
# if 'test' in os.getenv('DJANGO_SETTINGS_MODULE', ''):
#     DATABASES['default'] = {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': 'test_tournament_db',
#         'USER': 'test_user',
#         'PASSWORD': 'test_password',
#         'HOST': 'localhost',  # Use localhost for tests
#         'PORT': '5432',
#     }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'

# auth problem - added
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
