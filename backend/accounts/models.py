from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # AbstractUser gives you username, email, and password for free.
    # You can add custom fields here later
    
    def __str__(self):
        return self.username