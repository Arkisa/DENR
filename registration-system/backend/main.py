"""
DENR-EMB Sanitary Landfill Monitoring System - Registration API
Stack: FastAPI + PostgreSQL (psycopg2) + bcrypt

Flow (matches the registration flowchart):
  1. Enter email and password
  2. Input valid?            -> No:  400 INVALID_INPUT (frontend shows error message)
  3. Email already used?     -> Yes: 409 EMAIL_EXISTS  (frontend suggests logging in)
  4. Create account          -> password stored hashed (bcrypt)
  5. Send verification email -> link with one-time token
  6. Registration complete   -> 201
"""
import os
import re
import secrets
import smtplib
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

import bcrypt
import psycopg2
import psycopg2.errors
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from psycopg2.pool import ThreadedConnectionPool
from pydantic import BaseModel

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/denr_slf")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
TOKEN_HOURS = 24

app = FastAPI(title="DENR-EMB SLF Registration API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

pool: ThreadedConnectionPool | None = None


@app.on_event("startup")
def startup():
    global pool
    pool = ThreadedConnectionPool(1, 10, DATABASE_URL)
    # Create the table automatically so the app works even without running schema.sql
    schema_path = os.path.join(os.path.dirname(__file__), "..", "database", "schema.sql")
    if os.path.exists(schema_path):
        with db() as cur:
            cur.execute(open(schema_path, encoding="utf-8").read())


@app.on_event("shutdown")
def shutdown():
    if pool:
        pool.closeall()


@contextmanager
def db():
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        pool.putconn(conn)


# ---------- validation ----------
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")


class Credentials(BaseModel):
    email: str
    password: str


def validate_input(email: str, password: str) -> list[str]:
    errors = []
    if not email or not EMAIL_RE.match(email) or len(email) > 254:
        errors.append("Enter a valid email address, for example name@denr.gov.ph.")
    if len(password) < 8:
        errors.append("Password must be at least 8 characters.")
    if not re.search(r"[A-Z]", password):
        errors.append("Password needs at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        errors.append("Password needs at least one lowercase letter.")
    if not re.search(r"\d", password):
        errors.append("Password needs at least one number.")
    if len(password.encode()) > 72:  # bcrypt limit
        errors.append("Password is too long (72 characters maximum).")
    return errors


# ---------- email ----------
def send_verification_email(to_email: str, token: str):
    link = f"{FRONTEND_URL}/verify?token={token}"
    host = os.getenv("SMTP_HOST")
    if not host:
        print(f"\n[DEV] Verification link for {to_email}:\n{link}\n")
        return
    msg = EmailMessage()
    msg["Subject"] = "Verify your DENR-EMB SLF Monitoring account"
    msg["From"] = os.getenv("SMTP_FROM", "no-reply@denr-emb.local")
    msg["To"] = to_email
    msg.set_content(
        "Welcome to the DENR-EMB Sanitary Landfill Monitoring System.\n\n"
        f"Verify your email to activate your account (link valid for {TOKEN_HOURS} hours):\n{link}\n\n"
        "If you did not create this account, you can ignore this email."
    )
    try:
        with smtplib.SMTP(host, int(os.getenv("SMTP_PORT", "587"))) as smtp:
            smtp.starttls()
            if os.getenv("SMTP_USER"):
                smtp.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASSWORD", ""))
            smtp.send_message(msg)
    except Exception as exc:  # account is already created; don't crash the request
        print(f"[EMAIL ERROR] {exc}\nVerification link: {link}")


# ---------- routes ----------
@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/register", status_code=201)
def register(data: Credentials, background: BackgroundTasks):
    email = data.email.strip().lower()

    # Input valid?
    errors = validate_input(email, data.password)
    if errors:
        raise HTTPException(400, detail={"code": "INVALID_INPUT", "message": errors[0], "errors": errors})

    # Email already used?
    with db() as cur:
        cur.execute("SELECT 1 FROM users WHERE LOWER(email) = %s", (email,))
        if cur.fetchone():
            raise HTTPException(409, detail={
                "code": "EMAIL_EXISTS",
                "message": "This email is already registered. Try logging in instead.",
            })

    # Create account (password stored hashed)
    pw_hash = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS)
    try:
        with db() as cur:
            cur.execute(
                "INSERT INTO users (email, password_hash, verification_token, token_expires_at) "
                "VALUES (%s, %s, %s, %s)",
                (email, pw_hash, token, expires),
            )
    except psycopg2.errors.UniqueViolation:  # two people registering at the same moment
        raise HTTPException(409, detail={
            "code": "EMAIL_EXISTS",
            "message": "This email is already registered. Try logging in instead.",
        })

    # Send verification email
    background.add_task(send_verification_email, email, token)

    # Registration complete
    return {"message": "Registration complete. Check your email to verify your account.", "email": email}


@app.get("/api/verify")
def verify(token: str):
    with db() as cur:
        cur.execute(
            "SELECT id, token_expires_at FROM users WHERE verification_token = %s", (token,)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(400, detail={"code": "INVALID_TOKEN", "message": "This verification link is invalid or was already used."})
        user_id, expires = row
        if expires < datetime.now(timezone.utc):
            raise HTTPException(400, detail={"code": "TOKEN_EXPIRED", "message": "This verification link has expired. Register again to get a new one."})
        cur.execute(
            "UPDATE users SET is_verified = TRUE, verification_token = NULL, token_expires_at = NULL WHERE id = %s",
            (user_id,),
        )
    return {"message": "Email verified. You can now log in."}


@app.post("/api/login")
def login(data: Credentials):
    email = data.email.strip().lower()
    with db() as cur:
        cur.execute("SELECT password_hash, is_verified FROM users WHERE LOWER(email) = %s", (email,))
        row = cur.fetchone()
    if not row or not bcrypt.checkpw(data.password.encode(), row[0].encode()):
        raise HTTPException(401, detail={"code": "BAD_CREDENTIALS", "message": "Email or password is incorrect."})
    if not row[1]:
        raise HTTPException(403, detail={"code": "NOT_VERIFIED", "message": "Verify your email first. Check your inbox for the link."})
    return {"message": "Login successful.", "email": email}
