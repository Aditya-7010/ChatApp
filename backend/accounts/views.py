from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import UserSerializer, ContactSerializer  # <-- We added ContactSerializer here
from .models import CustomUser  # <-- We added CustomUser here so we can search the database

# --- STEP 2: REGISTRATION API ---
@api_view(['POST'])
def register_user(request):
    # 1. Grab the data sent from the internet
    serializer = UserSerializer(data=request.data)
    
    # 2. Check if the data is valid
    if serializer.is_valid():
        # 3. Save it to the database!
        serializer.save()
        return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)
    
    # 4. If there was an error, send the error back
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- STEP 3: CONTACT LIST API ---
@api_view(['GET'])
def get_contacts(request):
    # 1. Grab every single user from the database
    users = CustomUser.objects.all()
    
    # 2. Pass them to the translator (many=True tells it there is a list!)
    serializer = ContactSerializer(users, many=True)
    
    # 3. Send the translated list back to the internet
    return Response(serializer.data)

@api_view(['POST'])
def login_user(request):
    # 1. Grab the username and password from React
    username = request.data.get('username')
    password = request.data.get('password')

    # 2. Ask Django to verify if they match the database
    user = authenticate(username=username, password=password)

    # 3. If they match, send a success message back!
    if user is not None:
        return Response({
            "message": "Login successful!", 
            "id": user.id, 
            "username": user.username
        })
    else:
        # 4. If they don't match, send an error
        return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)