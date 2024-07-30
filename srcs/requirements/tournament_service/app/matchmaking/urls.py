# urls for the matchmaking app

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import PlayerViewSet, TournamentViewSet, MatchViewSet, ScoreViewSet
from .views import GlobalStateViewSet

router = DefaultRouter()
router.register(r'players', PlayerViewSet)
router.register(r'tournaments', TournamentViewSet)
router.register(r'matches', MatchViewSet)
router.register(r'scores', ScoreViewSet)
router.register(r'global-state', GlobalStateViewSet, basename='global-state')

urlpatterns = [
    path('', include(router.urls)),
]
