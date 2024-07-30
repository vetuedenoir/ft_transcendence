# used if we want to handle synchronous and asynchronous requests, for applications that require real-time features, such as WebSockets

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tournament_service.settings')

application = get_asgi_application()
