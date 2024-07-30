# models for the matchmaking app
# we need: Player, Tournament, Match, Score
# Player: a player in the tournament, identified by name
# Tournament: the tournament and manages the relationship with players thanks to a many-to-many relationship
    # many-to-many relationship: when multiple records in one table are related to multiple records in another table (here a Tournament can have multiple Players, and a Player can participate in multiple Tournaments)
# Match: a match between two players, with a winner and a round number
# Score: the score of a player in a tournament, with points and wins

from django.db import models
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager,
                                        PermissionsMixin)


#================================================================================================

class GlobalState(models.Model):
    # Singleton pattern to ensure only one instance exists
    _singleton = None

    in_tournament = models.BooleanField(default=False)
    
    @classmethod
    def get_instance(cls):
        if cls._singleton is None:
            cls._singleton, created = cls.objects.get_or_create(id=1)
        return cls._singleton

    @classmethod
    def set_in_tournament(cls, value):
        instance = cls.get_instance()
        instance.in_tournament = value
        instance.save()

    @classmethod
    def get_in_tournament(cls):
        instance = cls.get_instance()
        return instance.in_tournament


#================================================================================================


class Player(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name

class Tournament(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    players = models.ManyToManyField(Player)
    def __str__(self):
        players_list = ', '.join([str(player) for player in self.players.all()])
        return f"(id = {self.id}) Tournament {self.name}: on {self.created_at} with players: {players_list}"

class Match(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    player1 = models.ForeignKey(Player, related_name='player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(Player, related_name='player2', on_delete=models.CASCADE)
    winner = models.ForeignKey(Player, related_name='winner', on_delete=models.SET_NULL, null=True, blank=True)
    round = models.IntegerField()
    match_date = models.DateTimeField(auto_now_add=True)
    points_player1 = models.IntegerField(default=0)
    points_player2 = models.IntegerField(default=0)


class Score(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    points = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Crée et sauvegarde un utilisateur avec l'email et le mot de passe donnés."""
        if not email:
            raise ValueError('Les utilisateurs doivent avoir une adresse email')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Crée et sauvegarde un superutilisateur avec l'email et le mot de passe donnés."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le superutilisateur doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le superutilisateur doit avoir is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True, blank=True)
    # avatar = models.ImageField(upload_to='avatars/', default='default_avatar.png')
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    otp_enabled = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    #otp_secret = models.CharField(max_length=255)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
