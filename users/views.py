from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.shortcuts import redirect, render
from django.contrib.auth import login, logout

# Create your views here.
def register(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid:
            login(request, form.save())
            return redirect('/')
    else:
        form = UserCreationForm()
    return render(request, "users/register.html", {'form': form})

def login(request):
    return render(request, "users/login.html")

def profile_page(request):
    return render(request, "users/profile_page.html")
