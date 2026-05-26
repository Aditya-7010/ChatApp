from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # 'username' and 'password' are automatically included by AbstractUser!
    # 'username' will act as your unique Instagram-style handle (e.g., @adarsh_99)

    # 1. Display Name (What other users actually see)
    display_name = models.CharField(max_length=100, blank=True, null=True)
    
    # 2. Email ID (Making sure no two users have the same email)
    # Change this line:
    # email = models.EmailField(unique=True)
    
    # TO THIS:
    email = models.EmailField( null=True, blank=True)
    
    # 3. Gender (Using a dropdown choice system)
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('P', 'Prefer not to say')
    )
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    
    # 4. Age
    age = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.username

class Message(models.Model):
    # 1. The sender's name
    sender = models.CharField(max_length=150)
    
    # 2. The text of the message
    text = models.TextField()
    
    # 3. A timestamp that automatically records the exact second it was created
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.text}"