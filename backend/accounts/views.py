from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import UserSerializer, ContactSerializer, MessageSerializer
from .models import CustomUser, Message

@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        # FIXED: Returning full database properties so React context is populated instantly
        return Response({
            "message": "Login successful!", 
            "id": user.id, 
            "username": user.username,
            "display_name": user.display_name,
            "email": user.email,
            "gender": user.gender,
            "age": user.age
        })
    else:
        return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_contacts(request):
    users = CustomUser.objects.all()
    serializer = ContactSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_messages(request):
    messages = Message.objects.all().order_by('timestamp')[:50]
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)


# --- NEW: PROFILE UPDATE ENDPOINT ---
@api_view(['PUT'])
def update_profile(request):
    # For testing simplicity without full middleware auth tokens, we fetch by username sent or match context
    username = request.data.get('username') or request.user.username
    try:
        user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return Response({"detail": "User context not found."}, status=status.HTTP_404_NOT_FOUND)
        
    user.display_name = request.data.get('display_name', user.display_name)
    user.email = request.data.get('email', user.email)
    user.gender = request.data.get('gender', user.gender)
    user.age = request.data.get('age', user.age)
    user.save()
    
    return Response({
        "username": user.username,
        "display_name": user.display_name,
        "email": user.email,
        "gender": user.gender,
        "age": user.age
    }, status=status.HTTP_200_OK)


# --- NEW: PASSWORD ALTERATION POPUP ENDPOINT ---
@api_view(['POST'])
def change_password(request):
    username = request.data.get('username') or request.user.username
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    try:
        user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return Response({"detail": "User context not found."}, status=status.HTTP_404_NOT_FOUND)
        
    # Verify the current password matches
    if not user.check_password(current_password):
        return Response({"detail": "Incorrect old password verification."}, status=status.HTTP_400_BAD_REQUEST)
        
    user.set_password(new_password)
    user.save()
    return Response({"message": "Password changed successfully!"}, status=status.HTTP_200_OK)