from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
def register(request):
    return render(request, "users/register.html")

def login(request):
    return render(request, "users/login.html")

def profile_page(request):
    return render(request, "users/profile_page.html")
