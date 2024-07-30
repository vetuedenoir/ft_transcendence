import logging
import requests
from .models import Username
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from pathlib import Path
import base64
from PIL import Image
import io
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from pathlib import Path
from django.core.files import File

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

def image_to_base64(image_field):
    """
    Convert a Django model image field to a base64-encoded string.

    :param image_field: Django model image field (FieldFile).
    :return: Base64-encoded string of the image.
    """
    # Open the image using PIL
    with Image.open(image_field) as image:
        buffered = io.BytesIO()
        # Save the image to the buffer in JPEG format
        image.save(buffered, format="JPEG")
        # Encode the buffer to base64
        img_str = base64.b64encode(buffered.getvalue()).decode()
    return img_str

def get_user_info(self, request):
		auth_service_url = 'http://auth-service:8000/api/auth/getUserInfo/'
		response = requests.get(auth_service_url, headers=request.headers)
		# return Response(user_info, status=status.HTTP_200_OK) response line of auth service
		# if response.status_code != 200:
		# 	return Response({'message': 'Unable to get user information'}, status=response.status_code)
		username = response.json().get('username')
		if not username:
			return Response({'message': 'New username not provided'}, status=status.HTTP_400_BAD_REQUEST)
		return response

# def update_data(self, request, data_to_update):
# 	# Récupérer le token JWT depuis le header Authorization
# 	auth_service_url = 'http://auth-service:8000/api/auth/getUserInfo/'
# 	response = requests.get(auth_service_url, headers=request.headers)
# 	data = response.json().get(data_to_update)
# 	if not data:
# 		return Response({'message': 'New data not provided'}, status=status.HTTP_400_BAD_REQUEST)
# 	newdata = "new" + data_to_update
# 	new_data = request.data.get(newdata)
# 	if (Username.objects.filter(data_to_update=new_data).exists()):
# 		return Response({'message': 'Data already exists'}, status=status.HTTP_400_BAD_REQUEST)
# 	# Update data in the database
# 	user = Username.objects.get(data_to_update=data)
# 	user.data_to_update = new_data
# 	user.save()
# 	return Response({'success': True}, status=status.HTTP_200_OK)

class UpdateUsernameView(APIView):
	def post(self, request):
		# Ici, nous loggons simplement un message pour vérifier que cette méthode est appelée
		auth_service_url = 'http://auth-service:8000/api/auth/getUserInfo/';
		response = requests.get(auth_service_url, headers=request.headers)
		# return Response(user_info, status=status.HTTP_200_OK) response line of auth service
		# if response.status_code != 200:
		# 	return Response({'message': 'Unable to get user information'}, status=response.status_code)
		username = response.json().get('username')
		if not username:
			return Response({'message': 'New username not provided'}, status=status.HTTP_400_BAD_REQUEST)
		new_username = request.data.get('new_username')
		if (Username.objects.filter(username=new_username).exists()):
			return Response({'message': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
		# Update username in the database
		print(username)
		user = Username.objects.get(username=username)
		user.username = new_username
		user.save()
		return Response({'success': True}, status=status.HTTP_200_OK)

class UpdatefirstnameView(APIView):
	def post(self, request):
		response = get_user_info(self, request)
		username = response.json().get('username')
		if response.status_code != 200:
			return Response({'message': 'Unable to get user information'}, status=username.status_code)
		new_firstname = request.data.get('new_firstname')
		if not new_firstname:
			return Response({'message': 'New firstname not provided'}, status=status.HTTP_400_BAD_REQUEST)
		user = Username.objects.get(username=username)
		user.firstname = new_firstname
		user.save()
		return Response({'success': True}, status=status.HTTP_200_OK)

class UpdatelastnameView(APIView):
	def post(self, request):
		response = get_user_info(self, request)
		username = response.json().get('username')
		if response.status_code != 200:
			return Response({'message': 'Unable to get user information'}, status=username.status_code)
		new_lastname = request.data.get('new_name')
		if not new_lastname:
			return Response({'message': 'New lastname not provided'}, status=status.HTTP_400_BAD_REQUEST)
		user = Username.objects.get(username=username)
		user.lastname = new_lastname
		user.save()
		return Response({'success': True}, status=status.HTTP_200_OK)

class UpdateEmailView(APIView):
	def post(self, request):
		response = get_user_info(self, request)
		username = response.json().get('username')
		if response.status_code != 200:
			return Response({'message': 'Unable to get user information'}, status=username.status_code)
		new_email = request.data.get('new_email')
		if not new_email:
			return Response({'message': 'New email not provided'}, status=status.HTTP_400_BAD_REQUEST)
		if (Username.objects.filter(email=new_email).exists()):
			return Response({'message': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
		# Update email in the database
		user = Username.objects.get(username=username)
		user.email = new_email
		user.save()
		return Response({'success': True}, status=status.HTTP_200_OK)

# class UpdatePasswordView(APIView):
# 	def post(self, request):
# 		response = get_user_info(self, request)
# 		username = response.json().get('username')
# 		if response.status_code != 200:
# 			return Response({'message': 'Unable to get user information'}, status=username.status_code)
# 		new_password = request.data.get('new_password')
# 		if not new_password:
# 			return Response({'message': 'New password not provided'}, status=status.HTTP_400_BAD_REQUEST)
# 		user = Username.objects.get(username=username)
# 		user.password = new_password
# 		user.save()
# 		return Response({'success': True}, status=status.HTTP_200_OK)

class UpdateAvatarView(APIView):
	def post(self, request):
		logging.debug(f"Request data {request.data}")
		logging.debug(f"Request file{request.FILES}")
		response = get_user_info(self, request)
		username = response.json().get('username')
		user = Username.objects.get(username=username)
		print("HERE\n")
		if 'avatar' in request.FILES:
			avatar_file = request.FILES['avatar']
			user.avatar = avatar_file
			user.save()
			return JsonResponse({'success': True, 'message': 'Avatar updated successfully'}, status=status.HTTP_200_OK)
		else:
			print(request.data)
			return JsonResponse({'success': False, 'message': 'No avatar provided'}, status=status.HTTP_400_BAD_REQUEST)

class UpdateStatusView(APIView):
	def post(self, request):
		response = get_user_info(self, request)
		print(response)
		if response.status_code != 200:
			return Response({'message': 'Unable to get user information', 'success': False}, status=response.status_code)
		username = response.json().get('username')
		user = Username.objects.get(username=username)
		status_online = request.data.get('status_online')
		user.status_online = status_online
		user.save()
		print(f"here to update status online with {status_online}")
		return Response({'message': 'Status updated successfully', 'success': True}, status=status.HTTP_200_OK)

class CreateMatchView(APIView):
	def post(self, request):
		auth_service_url = 'http://auth-service:8000/api/auth/getUserInfo/'
		response = requests.get(auth_service_url, headers=request.headers)
		username = response.json().get('username')
		if not username:
			return Response({'message': 'Unable to get user information'}, status=status.HTTP_400_BAD_REQUEST)
		user = Username.objects.get(username=username)
		user_point = request.data.get('user_point')
		date = request.data.get('date')
		opponent_point = request.data.get('opponent_point')
		opponent_name = request.data.get('opponent_name')
		winner = request.data.get('winner')
		user.matches_history.append({'opponent_name': opponent_name, 'user_point': user_point, 'opponent_point': opponent_point, 'winner': winner, 'date': date})
		user.save()
		return Response({'message': 'Match created successfully', 'success': True}, status=status.HTTP_201_CREATED)

class CreateFriendView(APIView):
    pass

class UpdateFriendsView(APIView):
	def post(self, request):
		auth_service_url = 'http://auth-service:8000/api/auth/getUserInfo/'
		response = requests.get(auth_service_url, headers=request.headers)
		username = response.json().get('username')
		if not username:
			return Response({'message': 'Unable to get user information'}, status=status.HTTP_400_BAD_REQUEST)
		user = Username.objects.get(username=username)
		friend_username = request.data.get('friend_username')
		if username == friend_username:
			return Response({'message': 'You cannot add yourself as a friend', 'success': False}, status=status.HTTP_400_BAD_REQUEST)
		if user.friends.filter(username=friend_username).exists():
			return Response({'message': 'Friend already added', 'success': False}, status=status.HTTP_400_BAD_REQUEST)
		if Username.objects.filter(username=friend_username).exists():
			friend = Username.objects.get(username=friend_username)
		else:
			return Response({'message': 'Friend not found', 'success': False}, status=status.HTTP_400_BAD_REQUEST)
		user.friends.add(friend)
		user.save()
		return Response({'message': 'Friend added successfully', 'success': True}, status=status.HTTP_201_CREATED)

class GetUserView(APIView):
	def get(self, request):
		auth_service_url = 'http://auth-service:8000/api/auth/getUserInfo/'
		response = requests.get(auth_service_url, headers=request.headers)
		username = response.json().get('username')
		if not username:
			return Response({'message': 'Unable to get user information'}, status=status.HTTP_400_BAD_REQUEST)
		user = Username.objects.get(username=username)
		# avatar = request.build_absolute_uri(user.avatar.url)
		logging.debug(f"User avatar {user.avatar.url}")
		avatar = "https://localhost:4443" + str(user.avatar.url)
		friends = []
		for friend in user.friends.all():
			print(friend.status_online)
			print(friend.is_online())
			friend_avatar = "https://localhost:4443" + str(friend.avatar.url)
			if (friend.is_online() & friend.status_online):
				status_online = "Online"
			else:
				status_online = "Offline"
			friends.append({'username': friend.username, 'status_online': status_online, 'avatar': friend_avatar})
		user_info = {'username': user.username, 'email': user.email, 'firstname': user.firstname, 'lastname': user.lastname, 'status_online': user.status_online, 'matches_history': user.matches_history, 'friends': friends, 'avatar': avatar}
		return Response(user_info, status=status.HTTP_200_OK)

class CreateUserView(APIView):
	def post(self, request):
		username = request.data.get('username')
		email = request.data.get('email')
		firstname = request.data.get('first_name')
		last_name = request.data.get('last_name')
		status_online = False
		user = Username.objects.create(username=username, email=email, firstname=firstname, lastname=last_name, status_online=status_online)
		path = Path("/app/media/avatars/avatar.jpg")
		with path.open(mode="rb") as f:
			user.avatar.save('avatar', f)
		user.save()
		return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

class HeartbeatView(APIView):
	def get(self, request):
		print("Heartbeat received")
		auth_service_url = 'http://auth-service:8000/api/auth/getUserInfo/'
		response = requests.get(auth_service_url, verify= False, headers=request.headers)
		username = response.json().get('username')
		if not username:
			return Response({'message': 'Unable to get user information'}, status=status.HTTP_400_BAD_REQUEST)
		user = Username.objects.get(username=username)
		user.last_activity = timezone.now()
		user.save()
		return Response({'message': 'Heartbeat received', 'success': True}, status=status.HTTP_200_OK)

