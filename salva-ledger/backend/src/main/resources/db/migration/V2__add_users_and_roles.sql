-- Flyway Migration V2__add_users_and_roles
-- Description: Add users and roles tables for JWT authentication

-- =====================================================
-- ENUM TYPE: role
-- Purpose: Define available roles for JWT authentication
-- =====================================================
DO $$
BEGIN
    -- Create role type if not exists
    IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE role AS ENUM ('ADMIN', 'DRIVER', 'ASSISTANT');
    END IF;
END
$$;

-- =====================================================
-- TABLE: users
-- Purpose: Store user account information for authentication
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role role NOT NULL DEFAULT 'ASSISTANT',
    full_name VARCHAR(200),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR USERS TABLE
-- =====================================================

-- Index for email-based authentication queries
CREATE INDEX idx_users_email ON users(email);

-- Composite index for role-based access control
CREATE INDEX idx_users_role_active ON users(role, active);

-- Index for tracking login attempts
CREATE INDEX idx_users_last_login ON users(last_login_at);

-- =====================================================
-- TRIGGER FOR USERS TABLE AUTOMATIC UPDATES
-- =====================================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATA INSERTIONS FOR INITIAL SETUP
-- =====================================================

-- Insert a sample admin user (password needs to be encoded with BCrypt)
-- Replace '<ENCRYPTED_PASSWORD>' with actual BCrypt encoded password
-- Example: BCrypt.generate('admin123', BCrypt.GENERATE_LOG_ROUNDS)
INSERT INTO users (email, password, role, full_name, active)
VALUES (
    'admin@vettransport.com.br',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldEBgdOZ1KZxLKH/3/a',
    'ADMIN',
    'Administrador',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample assistant user
INSERT INTO users (email, password, role, full_name, active)
VALUES (
    'assistente@vettransport.com.br',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldEBgdOZ1KZxLKH/3/a',
    'ASSISTANT',
    'Assistente Administrativo',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample driver user
INSERT INTO users (email, password, role, full_name, active)
VALUES (
    'driver1@vettransport.com.br',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldEBgdOZ1KZxLKH/3/a',
    'DRIVER',
    'Joao Motorista',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- END OF MIGRATION
-- ================================================
