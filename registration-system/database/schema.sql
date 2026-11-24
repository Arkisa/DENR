-- DENR-EMB Sanitary Landfill Monitoring System: user registration schema
CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    email               VARCHAR(254) NOT NULL,
    password_hash       VARCHAR(100) NOT NULL,          -- bcrypt hash, never plain text
    is_verified         BOOLEAN      NOT NULL DEFAULT FALSE,
    verification_token  VARCHAR(100),
    token_expires_at    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Emails are stored lowercase; this index enforces "Email already used?" at DB level
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS users_token_idx ON users (verification_token);
