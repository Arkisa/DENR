from django.core.mail import send_mail
from django.urls import reverse

from .models import EmailVerificationToken


def send_verification_email(request, user):
    # remove older links so only the newest one works
    user.verification_tokens.all().delete()
    record = EmailVerificationToken.objects.create(user=user)

    link = request.build_absolute_uri(reverse("verify", args=[record.token]))

    send_mail(
        subject="Verify your DENR-EMB account",
        message=(
            "Welcome to the DENR-EMB Sanitary Landfill Monitoring System.\n\n"
            "Open this link to verify your email (valid for 24 hours):\n"
            f"{link}\n\n"
            "If you didn't create this account, you can ignore this email."
        ),
        from_email=None,  # uses DEFAULT_FROM_EMAIL
        recipient_list=[user.email],
    )