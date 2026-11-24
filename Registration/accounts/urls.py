from django.urls import path
from . import views

urlpatterns = [
    path("", views.register, name="register"),
    path("registered/", views.registered, name="registered"),
    path("verify/<str:token>/", views.verify, name="verify"),
    path("resend/", views.resend, name="resend"),
    path("login/", views.login_placeholder, name="login"),
]