from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # AbstractUser gives you username, email, and password for free.
    # You can add custom fields here later
    
    def __str__(self):
        return self.username
    # Leave your CustomUser code above this!

class Message(models.Model):
    # 1. The sender's name
    sender = models.CharField(max_length=150)
    
    # 2. The text of the message
    text = models.TextField()
    
    # 3. A timestamp that automatically records the exact second it was created
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.text}"