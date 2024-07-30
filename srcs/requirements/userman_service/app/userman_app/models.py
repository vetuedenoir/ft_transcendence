from django.db import models
from django.utils import timezone
import datetime
from django.conf import settings

# Create your models here.
class Username(models.Model):
	username = models.CharField(max_length=50)
	lastname = models.CharField(max_length=100)
	firstname = models.CharField(max_length=100)
	email = models.EmailField()
	avatar = models.ImageField(upload_to='assets/avatars/', blank=True)
	friends = models.ManyToManyField('Username', blank=True, related_name='user_friends')
	status_online = models.BooleanField()
	last_activity = models.DateTimeField(auto_now_add=True)
	matches_history = models.JSONField(default=list)
	last_seen = models.DateTimeField(default=timezone.now)

	def is_online(self):
		now = timezone.now()
		return now - self.last_activity <= datetime.timedelta(seconds=settings.USER_ONLINE_TIMEOUT)

	def __str__(self):
		return self.username
