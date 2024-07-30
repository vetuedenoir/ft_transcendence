import base64
import io

import pyotp
import qrcode
from django.contrib.auth import authenticate
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework import serializers, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(
        max_length=128,
        min_length=1,
        write_only=True
    )

    qr_code = serializers.CharField(read_only=True)
    error = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2', 'otp_enabled', 'qr_code', 'error']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    class ValidationError(ValidationError):
        pass

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'error': 'Les mots de passe doivent correspondre.'})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'error': 'Un utilisateur avec cet email existe déjà.'})
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({'error': 'Un utilisateur avec ce nom d\'utilisateur existe déjà.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)

        if validated_data.get('otp_enabled') == True:
            device = TOTPDevice.objects.create(user=user, confirmed=False)
            user.qr_code = self.get_qr_code(device.config_url)
        else:
            user.qr_code = None

        return user

    def get_qr_code(self, config_url):
        img = qrcode.make(config_url)
        img_byte_array = io.BytesIO()
        img.save(img_byte_array, format='PNG')
        return 'data:image/png;base64,' + base64.b64encode(img_byte_array.getvalue()).decode('utf-8')




class UserLoginSerializer(TokenObtainPairSerializer):

    class ValidationError(ValidationError):
        pass

    email = serializers.EmailField()
    password = serializers.CharField(
        max_length=128,
        min_length=1,
        write_only=True
    )
    otp_token = serializers.CharField(
        max_length=6,
        min_length=6,
        required=False
    )
    def validate(self, attrs):
        #authentification initiale avec email et mot de passe
        user = authenticate(request=self.context.get('request'), email=attrs['email'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError('Impossible de se connecter avec les informations fournies.')
        if not user.otp_enabled:
            refresh = self.get_token(user)
            data = {}
            data['refresh'] = str(refresh)
            data['access'] = str(refresh.access_token)
            return data

        if user.otp_enabled and not attrs.get('otp_token'):
            raise serializers.ValidationError({'otp_required': True})
        if user.otp_enabled and attrs.get('otp_token'):
            device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
            token = attrs['otp_token']

        if not device:
            raise serializers.ValidationError({'otp_user': 'Utilisateur introuvable.'})
        if device.verify_token(token):
            refresh = self.get_token(user)
            data = {}
            data['refresh'] = str(refresh)
            data['access'] = str(refresh.access_token)
            return data
        else:
            raise serializers.ValidationError({'otp_token': 'Code 2FA invalide.'})

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['username', 'email', 'first_name', 'last_name', 'otp_enabled', 'qr_code']
