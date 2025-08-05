from django.urls import path
from . import views


urlpatterns = [
    path('register/', views.register),
    path('login/', views.login_page),
    path('profile_page', views.profile_page),
    path('logout_user', views.logout_user, name="logout_user")
]
