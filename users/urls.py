from django.urls import path
from . import views


urlpatterns = [
    path('register/', views.register),
    path('login/', views.login),
    path('profile_page', views.profile_page)
]
