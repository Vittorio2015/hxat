"""
Django settings for hx_lti_tools project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
from django.contrib import messages
from secure import SECURE_SETTINGS

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

SECRET_KEY = SECURE_SETTINGS['django_secret_key']

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = SECURE_SETTINGS.get('debug', True)

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = SECURE_SETTINGS.get('allowed_hosts', [])

# Application definition
INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'django_extensions',
    'django_jenkins',
    'bootstrap3',
    'crispy_forms',
    'ims_lti_py',
    'hx_lti_initializer',
    'hx_lti_assignment',
    'target_object_database',
    'django_app_lti',
    'ws4redis'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'annotationsx.middleware.XFrameOptionsMiddleware',
    #'annotationsx.middleware.SessionMiddleware',
)

ROOT_URLCONF = 'annotationsx.urls'

WSGI_APPLICATION = 'annotationsx.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': SECURE_SETTINGS.get('db_default_name', 'annotationsx'),
        'USER': SECURE_SETTINGS.get('db_default_user', 'annotationsx'),
        'PASSWORD': SECURE_SETTINGS.get('db_default_password'),
        'HOST': SECURE_SETTINGS.get('db_default_host', 'localhost'),
        'PORT': SECURE_SETTINGS.get('db_default_port', '5432'),
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'http_static/')

TEMPLATE_DIRS = [os.path.join(BASE_DIR, 'templates')]

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.contrib.messages.context_processors.messages',
    'ws4redis.context_processors.default',
)

MESSAGE_TAGS = {
            messages.SUCCESS: 'success success',
            messages.WARNING: 'warning warning',
            messages.ERROR: 'danger error'
}

# Jenkins configuration
PROJECT_APPS = (
    'hx_lti_initializer',
    'hx_lti_assignment',
    'target_object_database',
)
JENKINS_TASKS = (
    'django_jenkins.tasks.run_pep8',
    'django_jenkins.tasks.run_pylint',
)

CRISPY_TEMPLATE_PACK = "bootstrap3"

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': SECURE_SETTINGS.get('django_log_level', 'ERROR'),
        },
        'hx_lti_initializer': {
            'handlers': ['console'],
            'level': SECURE_SETTINGS.get('django_log_level', 'ERROR'),
        },
        'hx_lti_assignment': {
            'handlers': ['console'],
            'level': SECURE_SETTINGS.get('django_log_level', 'ERROR'),
        },
        'target_object_database': {
            'handlers': ['console'],
            'level': SECURE_SETTINGS.get('django_log_level', 'ERROR'),
        },
    },
}

WEBSOCKET_URL = '/ws/'
WS4REDIS_EXPIRE = 5
WS4REDIS_PREFIX = 'ws'
WS4REDIS_CONNECTION = {
    'host': 'localhost',
    'port': 6379
}
WS4REDIS_HEARTBEAT = '--heartbeat--'


LTI_COURSE_ID = "context_id"
LTI_COLLECTION_ID = "custom_collection_id"
LTI_OBJECT_ID = "custom_object_id"
LTI_ROLES = "roles"
LTI_DEBUG = SECURE_SETTINGS.get('debug', False)
ADMIN_ROLES = SECURE_SETTINGS.get('ADMIN_ROLES', {'Administrator'})
X_FRAME_ALLOWED_SITES = SECURE_SETTINGS.get('X_FRAME_ALLOWED_SITES')
X_FRAME_ALLOWED_SITES_MAP = SECURE_SETTINGS.get('X_FRAME_ALLOWED_SITES_MAP')
SERVER_NAME = SECURE_SETTINGS.get('SERVER_NAME')
ORGANIZATION = SECURE_SETTINGS.get('ORGANIZATION')

LTI_SETUP = {
    "TOOL_TITLE": "AnnotationsX",
    "TOOL_DESCRIPTION": "Tool for annotating texts ported from HarvardX",

    "LAUNCH_URL": "hx_lti_initializer:launch_lti",  #"lti_init/launch_lti"
    "LAUNCH_REDIRECT_URL": "hx_lti_initializer:launch_lti",
    "INITIALIZE_MODELS": False,  # Options: False|resource_only|resource_and_course|resource_and_course_users

    "EXTENSION_PARAMETERS": {
        "canvas.instructure.com": {
            "privacy_level": "public",
            "course_navigation": {
                "enabled": "true",
                "default": "enabled",
                "text": "AnnotationsX",
            }
        }
    }
}

CONSUMER_KEY = SECURE_SETTINGS['CONSUMER_KEY']
LTI_SECRET = SECURE_SETTINGS['LTI_SECRET'] # ignored if using django_auth_lti

ANNOTATION_MANUAL_URL = SECURE_SETTINGS.get("annotation_manual_url", None)
ANNOTATION_MANUAL_TARGET = SECURE_SETTINGS.get("annotation_manual_target", None)
ANNOTATION_DB_URL = SECURE_SETTINGS.get("annotation_database_url")
ANNOTATION_DB_API_KEY = SECURE_SETTINGS.get("annotation_db_api_key")
ANNOTATION_DB_SECRET_TOKEN = SECURE_SETTINGS.get("annotation_db_secret_token")
ANNOTATION_PAGINATION_LIMIT_DEFAULT = SECURE_SETTINGS.get("annotation_pagination_limit_default", 20)
ANNOTATION_TRANSCRIPT_LINK_DEFAULT = SECURE_SETTINGS.get("annotation_transcript_link_default", None)
ANNOTATION_HTTPS_ONLY = SECURE_SETTINGS.get("https_only", False)

if ANNOTATION_HTTPS_ONLY:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True
    SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies"
    SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# Organization-specific configuration
# Try to minimize this as much as possible in favor of configuration
if ORGANIZATION == "ATG":
    pass
elif ORGANIZATION == "HARVARDX":
    pass
