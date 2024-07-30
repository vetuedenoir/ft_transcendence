# middleware.py

import datetime
from django.utils import timezone
from django.conf import settings

class UpdateLastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.user.is_authenticated:
            now = timezone.now()
            if 'last_activity' in request.session:
                last_activity = request.session['last_activity']
                if now - last_activity > datetime.timedelta(seconds=settings.USER_ONLINE_TIMEOUT):
                    request.user.last_activity = now
                    request.user.save(update_fields=['last_activity'])
            request.session['last_activity'] = now
        return response
