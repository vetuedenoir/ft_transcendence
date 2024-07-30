
from django.urls import path
from .views import UpdateUsernameView, UpdateEmailView, UpdateAvatarView, UpdateStatusView, UpdateFriendsView, GetUserView, CreateUserView, CreateMatchView, UpdatefirstnameView, UpdatelastnameView
from . import views

urlpatterns = [
	path('create_user/', CreateUserView.as_view(), name='create_user'),
	path('create_match/', CreateMatchView.as_view(), name='create_match'),

	path('update_username/', UpdateUsernameView.as_view(), name='update_username'),
	path('update_firstname/', UpdatefirstnameView.as_view(), name='update_firstname'),
	path('update_lastname/', UpdatelastnameView.as_view(), name='update_lastname'),
	path('update_email/', UpdateEmailView.as_view(), name='update_email'),
	# path('update_password/', UpdatePasswordView.as_view(), name='update_password'),
	path('update_avatar/', UpdateAvatarView.as_view(), name='update_avatar'),
	path('update_status/', UpdateStatusView.as_view(), name='update_status'),
	path('update_friends/', UpdateFriendsView.as_view(), name='update_friends'),

	path('get_user/', GetUserView.as_view(), name='get_user'),
	path('heartbeat/', views.HeartbeatView.as_view(), name='heartbeat'),
	# path('get-avatar-url/<str:username>/', views.get_avatar_url, name='get_avatar_url'),
]
