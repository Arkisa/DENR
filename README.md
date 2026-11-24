# DENR-EMB Sanitary Landfill Monitoring System: Registration

Sign-up (registration) module for the DENR-EMB Sanitary Landfill Monitoring System.
Built with Django and PostgreSQL. School/OJT project.

## What's done

- Sign-up page with a split layout, matching the dashboard look (dark green header, blue/green accents, Inter font)
- Live client-side validation (email format, password rules, confirm match)
- Password strength meter and rules checklist
- Show/hide password toggle and Caps Lock warning
- Double-submit protection with a loading spinner
- Server-side validation in Django (the client-side checks are never trusted alone)
- "Email already registered" alert with a link to log in
- Accounts saved to PostgreSQL, with passwords stored hashed (PBKDF2)
- Custom Django user model: email login, `is_verified`, `is_active`, `is_staff`, `created_at`
- Case-insensitive unique emails (`Test@x.com` and `test@x.com` count as the same)
- **Email verification**: single-use token link that expires after 24 hours, a confirm page, and a resend option with a 60-second cooldown
- Responsive layout (desktop, tablet, phone)
- Django admin set up to view and manage users

## How email verification works

1. After sign-up, the account is created with `is_verified = False` and a random token (valid for 24 hours) is emailed as a link: `/verify/<token>/`.
2. Opening the link shows a **Verify my email** button. Verifying only happens when the button is clicked, so email scanners that pre-open links can't use up the token.
3. Clicking the button sets `is_verified = True` and deletes the token, so the link works only once.
4. Expired links show a **Send a new link** button. Resending replaces older links, so only the newest one works.

## Password rules

- 8 to 64 characters
- At least one uppercase letter, one lowercase letter, and one number
- Not only spaces
- Confirm password must match

## Tech stack

### Back end

- Python 3.14
- Django 6.1
- PostgreSQL 18
- `psycopg` (database driver) and `python-dotenv` (loads `.env`)

### Front end

No frameworks or build tools. Everything is served straight from Django.

- **HTML**: Django templates (`base.html` plus page templates that extend it)
- **CSS**: one hand-written stylesheet (`style.css`)
  - CSS variables for the green/blue theme
  - Flexbox and Grid for layout
  - Media queries for responsive breakpoints (900px and 520px)
  - `:has()` selector for red invalid-field borders
- **JavaScript**: vanilla JS (`register.js`), no libraries
  - Live validation on input/blur
  - Password strength meter and rules checklist
  - Show/hide password toggle, Caps Lock warning
  - Blocks double submit and shows a spinner
- **Font**: Inter (Google Fonts)
- **Icons**: inline SVG (no icon library)
- **Logo**: placeholder `logo.svg` (grey circle)

## Project structure

```
Registration/
├── manage.py
├── config/            # Django project settings and root URLs
└── accounts/          # Registration app
    ├── models.py      # Custom User model + EmailVerificationToken
    ├── forms.py       # RegisterForm and server-side validation
    ├── views.py       # register, registered, verify, resend, login placeholder
    ├── emails.py      # builds the token and sends the verification email
    ├── urls.py
    ├── admin.py
    ├── templates/accounts/   # base, register, registered, verify, login
    └── static/accounts/      # style.css, register.js, logo.svg
```

## Setup

1. Create and activate a virtual environment (PowerShell):

   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

2. Install the packages:

   ```powershell
   python -m pip install django "psycopg[binary]" python-dotenv
   ```

3. Create an empty PostgreSQL database named `denr_db` (pgAdmin: right-click Databases > Create > Database).

4. Create a file named `.env` next to `manage.py`:

   ```
   DB_NAME=denr_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   EMAIL_MODE=console
   ```

   `.env` is in `.gitignore`. Never commit it.

5. Create the tables and an admin account:

   ```powershell
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. Run the server:

   ```powershell
   python manage.py runserver
   ```

   - Sign-up page: http://127.0.0.1:8000/
   - Admin: http://127.0.0.1:8000/admin/

`.env` is only read when the server starts, so restart `runserver` after changing it.

## Email modes

Set `EMAIL_MODE` in `.env`:

| Mode | What happens | Use for |
|---|---|---|
| `console` (default) | The verification email is printed in the `runserver` terminal. Copy the link from there. | Development and testing |
| `smtp` | The email is really sent through an SMTP server (set up for Gmail by default). | Real delivery |

For `smtp` mode, add these to `.env` (Gmail needs 2-Step Verification and an [app password](https://myaccount.google.com/apppasswords), not your normal password):

```
EMAIL_MODE=smtp
EMAIL_HOST_USER=yourgmail@gmail.com
EMAIL_HOST_PASSWORD=your_16_character_app_password
DEFAULT_FROM_EMAIL=yourgmail@gmail.com
```

The link in the email points to the address the site is served from. During local development that is `127.0.0.1`, so it only opens on the same computer.

## Notes

- The login page is a placeholder for now.
- Django's users table is `accounts_user` (not `users`).
- Accounts created with `createsuperuser` are verified automatically.
- Use an incognito window for test sign-ups to avoid CSRF cookie clashes with the admin login.

## Next steps

- Real login page and sessions (block unverified accounts)
- Deployment setup (gunicorn, whitenoise, environment variables for secrets, secure cookies)
- Move `SECRET_KEY` into `.env` before deploying
- Real email service for production instead of a personal Gmail
- Agree on one password policy with the group
- Add a `requirements.txt` and a `.env.example`
