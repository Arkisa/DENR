from django.db import IntegrityError
from django.shortcuts import redirect, render

from .forms import RegisterForm
from .models import User


def register(request):
    email_taken = False

    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            password = form.cleaned_data["password"]

            if User.objects.filter(email__iexact=email).exists():
                email_taken = True
            else:
                try:
                    # create_user hashes the password
                    User.objects.create_user(email=email, password=password)
                except IntegrityError:
                    # two people registering the same email at the same moment
                    email_taken = True
                else:
                    # TODO: send verification email
                    request.session["registered_email"] = email
                    return redirect("registered")
    else:
        form = RegisterForm()

    return render(
        request,
        "accounts/register.html",
        {"form": form, "email_taken": email_taken},
    )


def registered(request):
    email = request.session.get("registered_email")
    if not email:
        return redirect("register")
    return render(request, "accounts/registered.html", {"email": email})


def login_placeholder(request):
    return render(request, "accounts/login.html")