from django.urls import path
from . import views

urlpatterns = [
    # This creates the /register/ endpoint
    path('register/', views.register_user, name='register'),
    # This creates the /contacts/ endpoint
    path('contacts/', views.get_contacts, name='contacts'),
    
    path('login/', views.login_user, name='login'), # <-- Add this line!

    path('messages/', views.get_messages, name='messages'),

    # Add this line into your existing urlpatterns list:
    path('messages/<str:room_name>/', views.get_room_messages, name='room_messages'),
]