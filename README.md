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
- Success page after registration
- Responsive layout (desktop, tablet, phone)
- Django admin set up to view and manage users

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
    ├── models.py      # Custom User model
    ├── forms.py       # RegisterForm and server-side validation
    ├── views.py       # register, registered, login placeholder
    ├── urls.py
    ├── admin.py
    ├── templates/accounts/   # base, register, registered, login
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

## Notes

- The login page is a placeholder for now.
- Django's users table is `accounts_user` (not `users`).
- Verification emails are not sent yet, so new accounts stay unverified.

## Next steps

- Email verification: token link with 24-hour expiry, verify page, resend option
- Real login page and sessions
- Deployment setup (gunicorn, whitenoise, environment variables for secrets, secure cookies)
- Move `SECRET_KEY` into `.env` before deploying
- Agree on one password policy with the group
- Add a `requirements.txt` and a `.env.example`
