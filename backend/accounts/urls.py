from django.urls import path
from . import views

urlpatterns = [
    # This creates the /register/ endpoint
    path('register/', views.register_user, name='register'),
    # This creates the /contacts/ endpoint
    path('contacts/', views.get_contacts, name='contacts'),
]