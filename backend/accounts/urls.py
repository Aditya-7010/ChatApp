from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('contacts/', views.get_contacts, name='contacts'),
    path('messages/', views.get_messages, name='messages'),
    
    # Your Private Chat History Endpoint
    path('messages/<str:room_name>/', views.get_room_messages, name='room_messages'),
    
    # Your Friend's Profile Management Endpoints
    path('profile/update/', views.update_profile, name='update_profile'),
    path('password/change/', views.change_password, name='change_password'),
]