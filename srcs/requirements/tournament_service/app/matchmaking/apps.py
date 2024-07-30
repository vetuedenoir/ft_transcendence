# file for the app configuration
	# we can set app-specific configurations
	# run custom startup code when the app is initialized
	# not mandatory but is a Django convention

from django.apps import AppConfig

class MatchmakingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'matchmaking'
