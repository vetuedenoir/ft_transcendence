# web server gateway interface: standard interface between web servers and Python web applications or frameworks. It is synchronous and is typically used for running Django applications in production environments using servers like Gunicorn or uWSGI.

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tournament_service.settings')

application = get_wsgi_application()
