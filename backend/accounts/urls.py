from django.urls import path
from . import views

urlpatterns = [
    # This creates the /register/ endpoint
    path('register/', views.register_user, name='register'),
]