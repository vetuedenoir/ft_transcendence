from django.urls import path

from .views import TOTPverifyView, UserLoginView, UserRegistrationView, TokenRefreshView, VerifyJWTView, GetUserInfoView, UserUpdateEmailView, UserUpdatePasswordView, UserUpdateUsernameView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('verify/', TOTPverifyView.as_view(), name='otp'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('verifyJWT/', VerifyJWTView.as_view(), name='verifyJWT'),
    path('getUserInfo/', GetUserInfoView.as_view(), name='getUserInfo'),

    path('updateEmail/', UserUpdateEmailView.as_view(), name='updateEmail'),
    path('updatePassword/', UserUpdatePasswordView.as_view(), name='updatePassword'),
	path('updateUsername/', UserUpdateUsernameView.as_view(), name='updateUsername'),
]
