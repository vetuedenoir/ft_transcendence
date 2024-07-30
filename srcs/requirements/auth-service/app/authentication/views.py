
import time

import pyotp
from django.shortcuts import render
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
import requests
from rest_framework.views import APIView

from .models import User
from .serializers import UserLoginSerializer, UserRegistrationSerializer


# Create your views here.

class UserUpdateUsernameView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = None
    def post(self, request):
        user = request.user
        if not user:
            return Response({'success': False}, status=status.HTTP_404_NOT_FOUND)
        username = request.data.get('new_username')
        if User.objects.filter(username=username).exists():
            return Response({'success': False, 'message': 'Nom d\'utilisateur déjà utilisé'}, status=status.HTTP_400_BAD_REQUEST)
        user.username = username
        user.save()
        return Response({'success': True}, status=status.HTTP_200_OK)

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

    def create (self, request, *args, **kwargs):
        print(request.data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # ipAdress = "172.18.0.3"
        ipAdress = 'userman-service'
        userman_url = f'http://{ipAdress}:8000/api/userman/create_user/'
        token = request.headers.get('Authorization', None)
        headers = {
			'Authorization': token,
			'Content-Type': 'application/json'
		}
        createUserRequest = requests.post(userman_url, data={'username': user.username, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name})
        if (createUserRequest.status_code != 201):
            user.delete()
            return Response({'error': 'Erreur lors de la création de l\'utilisateur'}, status=status.HTTP_400_BAD_REQUEST)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class UserLoginView(TokenObtainPairView):
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except serializer.ValidationError as e:
            if ('otp_required' in e.detail):
                return Response({'otp_required': True}, status=status.HTTP_400_BAD_REQUEST)
            elif ('otp_token' in e.detail):
                return Response({'otp_token': 'Code 2FA invalide.'}, status=status.HTTP_400_BAD_REQUEST)
            elif ('otp_user' in e.detail):
                return Response({'otp_user': 'Utilisateur introuvable.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                raise e
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class TOTPverifyView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def get_serializer_class(self, args, **kwargs):
        return None

    def post(self, request):

        try:
            email = request.data.get('email')
            user = User.objects.get(email=email)
            device = TOTPDevice.objects.filter(user=user, confirmed=False).first()
            token = request.data.get('otp_token')
            if not device:
                return Response({'otp_token': 'Utilisateur introuvable.'}, status=status.HTTP_401_UNAUTHORIZED)
            if device.verify_token(token):
                device.confirmed = True
                device.save()
                return Response({'success': 'success', }, status=status.HTTP_200_OK)
            return Response({'otp_token': 'Code 2FA invalide.'}, status=status.HTTP_401_UNAUTHORIZED)

        except TOTPDevice.DoesNotExist:
            return Response({'otp_token': 'User introuvable.'}, status=status.HTTP_401_UNAUTHORIZED)

class TokenRefreshView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = None
    def post(self, request):
        refresh_token = request.data['refresh']
        try:
            token = RefreshToken(refresh_token)
            return Response({'access': str(token.access_token)}, status=status.HTTP_200_OK)
        except:
            return Response({'error': 'Token invalide'}, status=status.HTTP_400_BAD_REQUEST)



class VerifyJWTView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = None
    def get(self, request):
        return Response({'success': 'success'}, status=status.HTTP_200_OK)

class GetUserInfoView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = None
    def get(self, request):
        user = request.user
        if not user:
            return Response({'error': 'Utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)
        user_info = {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        return Response(user_info, status=status.HTTP_200_OK)


class UserUpdateEmailView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = None
    def post(self, request):
        user = request.user
        if not user:
            return Response({'message': 'Utilisateur introuvable', 'success': False}, status=status.HTTP_404_NOT_FOUND)
        email = request.data.get('email')
        if User.objects.filter(email=email).exists():
            return Response({'message': 'Email déjà utilisé', 'success': False}, status=status.HTTP_400_BAD_REQUEST)
        user.email = email
        user.save()
        return Response({'success': True}, status=status.HTTP_200_OK)

class UserUpdatePasswordView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = None
    def post(self, request):
        user = request.user
        if not user:
            return Response({'message': 'Utilisateur introuvable', 'success': False}, status=status.HTTP_404_NOT_FOUND)
        password = request.data.get('password')
        user.set_password(password)
        user.save()
        return Response({'success': True}, status=status.HTTP_200_OK)
