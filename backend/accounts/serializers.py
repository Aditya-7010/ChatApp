from rest_framework import serializers
from .models import CustomUser, Message

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        # Included all explicit demographic identifiers
        fields = ['id', 'username', 'password', 'display_name', 'email', 'gender', 'age']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Securely maps every input argument into the active Django user instantiation flow
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            display_name=validated_data.get('display_name', ''),
            email=validated_data.get('email', ''),
            gender=validated_data.get('gender', 'P'),
            age=validated_data.get('age', None)
        )
        return user
    
class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'text', 'timestamp']