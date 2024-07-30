# serialazers for our matchmaking app
# serializers for our models classes, so we can convert them to JSON format
	# for TournamentSerializer, we have a nested serialization for players (PlayerSerializer) because of the many-to-many relationship

from rest_framework import serializers
from .models import Player, Tournament, Match, Score

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['name']

class TournamentSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True, read_only=True)

    class Meta:
        model = Tournament
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    player1 = PlayerSerializer()
    player2 = PlayerSerializer()

    class Meta:
        model = Match
        fields = ['id', 'tournament', 'player1', 'player2', 'winner', 'round', 'match_date', 'points_player1', 'points_player2']

class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = '__all__'