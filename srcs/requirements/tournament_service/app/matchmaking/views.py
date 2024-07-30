# views for the matchmaking app
# usinng Django Rest Framework's viewsets
# they all inherit from viewsets.ModelViewSet, which provides CRUD operations
    # CRUD = Create, Read, Update, Delete
# each viewset has a queryset and a serializer_class
    # queryset is the list of objects that will be returned
    # serializer_class is the class that will be used to serialize the queryset (convert it to/from JSON)
# we will also use the services we implemented in services.py to create a tournament, update scores, and determine the winner
    # The @action decorator in Django REST Framework (DRF) is used to create custom actions that can be called on viewsets. It allows us to add custom endpoints to our viewsets beyond the standard CRUD operations
    # The @action decorator takes the following arguments:
        # detail: A boolean that indicates whether the action is intended to be performed on a single instance (true) or a collection of instances (false)
        # methods: A list of HTTP methods that the action will handle
        # url_path: The URL path for the custom action (if none, the method name will be used)
        # url_name: The name of the URL pattern for the custom action (if none, the method name will be used) => not used here

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import Player, Tournament, Match, Score
from .serializers import PlayerSerializer, TournamentSerializer, MatchSerializer, ScoreSerializer
from .services import create_round_robin_matches, update_scores, get_tournament_results
from django.views.decorators.csrf import csrf_exempt
from .models import GlobalState

#================================================================================================

class GlobalStateViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['get'])
    def in_tournament(self, request):
    # for the GET request - call function get_in_tournament from GlobalState model
        # => return the value of in_tournament
        in_tournament = GlobalState.get_in_tournament()
        return Response({'in_tournament': in_tournament})

    @action(detail=False, methods=['post'])
    @csrf_exempt
    def set_in_tournament(self, request):
    # for the POST request - call function set_in_tournament from GlobalState model
        # => set the value of in_tournament to the value passed in the POST request
        try:
            value = request.data.get('in_tournament') == 'true'
            GlobalState.set_in_tournament(value)
            return Response({'success': True})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

#================================================================================================

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def create(self, request, *args, **kwargs):
        players_data = request.data.pop('players', [])
        tournament = Tournament.objects.create(**request.data)

        for player_name in players_data:
            player, created = Player.objects.get_or_create(name=player_name)
            tournament.players.add(player)

        tournament.save()
        create_round_robin_matches(tournament)
        serializer = self.get_serializer(tournament)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post']) # action applies to a single tournament instance // handles POST requests // URL for this action will be /api/tournaments/tournaments/<pk>/create-matches/
    def create_matches(self, request, pk=None):
        tournament = self.get_object()
        matches = create_round_robin_matches(tournament)
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='results')
    def get_results(self, request, pk=None):
        tournament = self.get_object()
        results = get_tournament_results(tournament)
        if results['winner']:
            return Response({'winner': results['winner'].name, 'ranking': results['ranking']}, status=status.HTTP_200_OK)
        return Response({'error': 'No results found'}, status=status.HTTP_404_NOT_FOUND)

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

    @action(detail=True, methods=['post'], url_path='record')
    def record(self, request, pk=None):
        match = self.get_object()
        points_player1 = request.data.get('points_player1')
        points_player2 = request.data.get('points_player2')

        if points_player1 is None or points_player2 is None:
            return Response({"VIEW ERROR for this API call": "Both player scores are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            points_player1 = int(points_player1)
            points_player2 = int(points_player2)
        except ValueError:
            return Response({"VIEW ERROR for this API call": "Invalid points format."}, status=status.HTTP_400_BAD_REQUEST)

        # Determine the winner based on scores
        if points_player1 > points_player2:
            winner_id = match.player1.id
        elif points_player2 > points_player1:
            winner_id = match.player2.id
        else:
            return Response({"VIEW ERROR for this API call": "Scores are tied, no winner can be determined."}, status=status.HTTP_400_BAD_REQUEST)

        # Update the match scores and winner
        match.points_player1 = points_player1
        match.points_player2 = points_player2
        match.winner_id = winner_id
        match.save()

        # Call the service function to update scores and winner
        update_scores(match, winner_id)

        # Return the updated match data
        serializer = self.get_serializer(match)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='tournament/(?P<tournament_id>[^/.]+)')
    def get_matches_by_tournament(self, request, tournament_id=None):
        matches = Match.objects.filter(tournament=tournament_id)
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)


class ScoreViewSet(viewsets.ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer

    @action(detail=False, methods=['get'], url_path='tournament/(?P<tournament_pk>[^/.]+)') # action applies to a list of scores // handles GET requests // url_path='tournament/(?P<tournament_pk>[^/.]+)': This custom URL path captures the tournament ID as a URL parameter
    def tournament_scores(self, request, tournament_pk=None):
        scores = Score.objects.filter(tournament_id=tournament_pk)
        serializer = self.get_serializer(scores, many=True)
        return Response(serializer.data)
