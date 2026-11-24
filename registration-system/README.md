# DENR-EMB Sanitary Landfill Monitoring System: Registration Page

Stack: **React (Vite)** frontend · **Python (FastAPI)** backend · **PostgreSQL** database

## Flowchart to code

| Flowchart step | Where it happens |
|---|---|
| Open sign-up page | `frontend/src/pages/Register.jsx` (route `/register`) |
| Enter email and password | Sign-up form |
| Input valid? (No: show error message, back to entry) | Checked in the browser (`validate()`) and again on the server (`validate_input()` in `backend/main.py`) |
| Email already used? (Yes: suggest logging in) | Server returns `409 EMAIL_EXISTS`; the page shows a "Go to log in" suggestion |
| Create account, password stored hashed | bcrypt hash saved in the `users` table |
| Send verification email | Link with a one-time token, valid 24 hours |
| Registration complete | Success screen; `/verify` page activates the account |

## How to run

You need: Python 3.10+, Node.js 18+, PostgreSQL 14+.

### 1. Database
Option A (Docker): `docker compose up -d`

Option B (PostgreSQL installed on your PC):
```
createdb -U postgres denr_slf
psql -U postgres -d denr_slf -f database/schema.sql
```

### 2. Backend
```
cd backend
python -m venv venv
venv\Scripts\activate          # Windows   (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env         # Mac/Linux: cp .env.example .env   then edit DATABASE_URL if needed
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173**

## Testing the verification email
If `SMTP_HOST` in `backend/.env` is empty, the verification link is **printed in the backend terminal**. Copy it into the browser to verify the account. Fill in the SMTP settings to send real emails (for example a Gmail app password).

## API
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/register` | Create account (`201`, `400` invalid input, `409` email used) |
| GET | `/api/verify?token=...` | Verify email |
| POST | `/api/login` | Log in (verified accounts only) |
| GET | `/api/health` | Health check |

Interactive API docs: http://localhost:8000/docs

## Password rules
At least 8 characters, with one uppercase letter, one lowercase letter, and one number.
