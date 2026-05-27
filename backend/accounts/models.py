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
    # We add room_name so the database knows where this message belongs
    room_name = models.CharField(max_length=255, default='general')
    sender = models.CharField(max_length=150)
    is_read = models.BooleanField(default=False) # New field to track if the message has been read
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.room_name}] {self.sender}: {self.text}"