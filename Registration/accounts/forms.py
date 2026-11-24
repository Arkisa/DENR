import re
from django import forms

# Fake "already registered" emails. Replace with a database lookup later.
MOCK_TAKEN_EMAILS = {"taken@example.com"}


class RegisterForm(forms.Form):
    email = forms.EmailField(
        max_length=254,
        error_messages={
            "required": "Enter your email address.",
            "invalid": "Enter a valid email, like name@school.edu.",
        },
        widget=forms.EmailInput(attrs={"autocomplete": "email"}),
    )
    password = forms.CharField(
        max_length=64,
        strip=False,  # don't silently trim spaces from passwords
        error_messages={"required": "Enter a password."},
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
    )
    confirm = forms.CharField(
        max_length=64,
        strip=False,
        error_messages={"required": "Re-enter your password."},
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
    )

    def clean_email(self):
        # Normalize: trim + lowercase so "A@B.com " and "a@b.com" are the same
        return self.cleaned_data["email"].strip().lower()

    def clean_password(self):
        pw = self.cleaned_data["password"]
        if not pw.strip():
            raise forms.ValidationError("Password can't be only spaces.")
        if len(pw) < 8:
            raise forms.ValidationError("Use at least 8 characters.")
        if not re.search(r"[A-Za-z]", pw) or not re.search(r"\d", pw):
            raise forms.ValidationError("Include at least one letter and one number.")
        return pw

    def clean(self):
        data = super().clean()
        if data.get("password") and data.get("confirm") and data["password"] != data["confirm"]:
            self.add_error("confirm", "Passwords don't match.")
        return data