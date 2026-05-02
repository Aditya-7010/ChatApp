from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'password']
        # This makes sure the password is encrypted and never sent back to the internet
        extra_kwargs = {'password': {'write_only': True}} 

    def create(self, validated_data):
        # We use 'create_user' so Django safely hashes the password
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user