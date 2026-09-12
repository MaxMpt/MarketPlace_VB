ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;

CREATE TABLE IF NOT EXISTS user_settings (
    user_id         BIGINT        PRIMARY KEY,
    theme           VARCHAR(8)    NOT NULL DEFAULT 'light'
                                  CHECK (theme IN ('light', 'dark')),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_settings_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE CASCADE
);
