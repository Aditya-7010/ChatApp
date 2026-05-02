from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import UserSerializer

@api_view(['POST'])
def register_user(request):
    # 1. Grab the data sent from the internet
    serializer = UserSerializer(data=request.data)
    
    # 2. Check if the data is valid (e.g., the username isn't already taken)
    if serializer.is_valid():
        # 3. Save it to the database!
        serializer.save()
        return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)
    
    # 4. If there was an error, send the error back
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)