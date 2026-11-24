import logging
from datetime import timedelta

from django.db import IntegrityError
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .emails import send_verification_email
from .forms import RegisterForm
from .models import EmailVerificationToken, User

logger = logging.getLogger(__name__)
RESEND_COOLDOWN = timedelta(seconds=60)


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
                    user = User.objects.create_user(email=email, password=password)
                except IntegrityError:
                    # two people registering the same email at the same moment
                    email_taken = True
                else:
                    try:
                        send_verification_email(request, user)
                    except Exception:
                        # account exists; the user can use "Resend" on the next page
                        logger.exception("Could not send verification email")
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
    status = request.session.pop("resend_status", None)
    return render(
        request,
        "accounts/registered.html",
        {"email": email, "resend_status": status},
    )


def verify(request, token):
    record = (
        EmailVerificationToken.objects.select_related("user").filter(token=token).first()
    )
    if record is None:
        return render(request, "accounts/verify.html", {"state": "invalid"})

    if record.is_expired():
        # remember who this is so the "send a new link" button works
        request.session["registered_email"] = record.user.email
        return render(request, "accounts/verify.html", {"state": "expired"})

    if request.method == "POST":
        user = record.user
        user.is_verified = True
        user.save(update_fields=["is_verified"])
        user.verification_tokens.all().delete()
        return render(request, "accounts/verify.html", {"state": "success"})

    return render(
        request,
        "accounts/verify.html",
        {"state": "confirm", "email": record.user.email},
    )


@require_POST
def resend(request):
    email = request.session.get("registered_email")
    if not email:
        return redirect("register")

    user = User.objects.filter(email__iexact=email).first()
    if user and not user.is_verified:
        latest = user.verification_tokens.order_by("-created_at").first()
        if latest and timezone.now() - latest.created_at < RESEND_COOLDOWN:
            request.session["resend_status"] = "wait"
        else:
            try:
                send_verification_email(request, user)
                request.session["resend_status"] = "sent"
            except Exception:
                logger.exception("Could not resend verification email")
                request.session["resend_status"] = "failed"

    return redirect("registered")


def login_placeholder(request):
    return render(request, "accounts/login.html")