-- Flyway Migration V2__add_users_and_roles
-- Description: Add users and roles tables for JWT authentication
-- Updated: 2026-03-18 - Aligned with JPA entity definition

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
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role role NOT NULL DEFAULT 'ASSISTANT',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR USERS TABLE
-- =====================================================

-- Index for email-based authentication queries
CREATE INDEX idx_users_email ON users(email);

-- Composite index for role-based access control
CREATE INDEX idx_users_role_active ON users(role, active);

-- =====================================================
-- TRIGGER FOR USERS TABLE AUTOMATIC UPDATES
-- =====================================================
CREATE TRIGGER update_users_created_at BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATA INSERTIONS FOR INITIAL SETUP
-- =====================================================

-- Insert a sample admin user (password is BCrypt encoded)
-- Password: admin123 -> $2a$10$r7JzQjXKpYqFzKpYqFzKpYqFzKpYqFzKpYqFzKpYqFzKpYqFzKpYqF
INSERT INTO users (email, password, role, active)
VALUES (
    'admin@vettransport.com.br',
    '$2a$10$r7JzQjXKpYqFzKpYqFzKpYqFzKpYqFzKpYqFzKpYqFzKpYqFzKpYqF',
    'ADMIN',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample assistant user
INSERT INTO users (email, password, role, active)
VALUES (
    'assistente@vettransport.com.br',
    '$2a$10$r7JzQjXKpYqFzKpYqFzKpYqFzKpYqFzKpYqFzKpYqFzKpYqFzKpYqF',
    'ASSISTANT',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample driver user
INSERT INTO users (email, password, role, active)
VALUES (
    'driver1@vettransport.com.br',
    '$2a$10$r7JzQjXKpYqFzKpYqFzKpYqFzKpYqFzKpYqFzKpYqFzKpYqFzKpYqF',
    'DRIVER',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- END OF MIGRATION
-- ====================================================
