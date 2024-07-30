# defines the URL routing for the Django project, directing different URL paths to their respective views in the matchmaking app

# # auth problem - commented
# from django.contrib import admin
# from django.urls import include, path
# from rest_framework.authtoken.views import obtain_auth_token

## auth problem - added
# from django.contrib import admin
from django.urls import path
from django.urls.conf import include

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('api/tournaments/', include('matchmaking.urls')),
    # path('api-auth/', include('rest_framework.urls')),
    # path('api/token/', obtain_auth_token, name='api_token_auth'), # auth problem - commented
]
