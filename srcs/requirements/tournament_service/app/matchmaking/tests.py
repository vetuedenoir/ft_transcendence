# matchmaking/tests.py

from django.test import TestCase
from matchmaking.models import Player, Tournament, Match, Score

class PlayerModelTest(TestCase):

    def setUp(self):
        self.player = Player.objects.create(name="Test Player")

    def test_player_creation(self):
        self.assertEqual(self.player.name, "Test Player")

class TournamentModelTest(TestCase):

    def setUp(self):
        self.tournament = Tournament.objects.create(name="Test Tournament")

    def test_tournament_creation(self):
        self.assertEqual(self.tournament.name, "Test Tournament")

class MatchModelTest(TestCase):

    def setUp(self):
        self.player1 = Player.objects.create(name="Player 1")
        self.player2 = Player.objects.create(name="Player 2")
        self.tournament = Tournament.objects.create(name="Test Tournament")
        self.match = Match.objects.create(player1=self.player1, player2=self.player2, tournament=self.tournament)

    def test_match_creation(self):
        self.assertEqual(self.match.player1.name, "Player 1")
        self.assertEqual(self.match.player2.name, "Player 2")
        self.assertEqual(self.match.tournament.name, "Test Tournament")

class ScoreModelTest(TestCase):

    def setUp(self):
        self.player1 = Player.objects.create(name="Player 1")
        self.player2 = Player.objects.create(name="Player 2")
        self.tournament = Tournament.objects.create(name="Test Tournament")
        self.match = Match.objects.create(player1=self.player1, player2=self.player2, tournament=self.tournament)
        self.score = Score.objects.create(match=self.match, player=self.player1, points=10)

    def test_score_creation(self):
        self.assertEqual(self.score.match.player1.name, "Player 1")
        self.assertEqual(self.score.points, 10)
