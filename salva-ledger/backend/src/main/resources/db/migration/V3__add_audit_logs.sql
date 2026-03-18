-- Flyway Migration V3__add_audit_logs
-- Description: Add audit log tables for financial traceability

-- =====================================================
-- ENUM TYPE: audit_action
-- Purpose: Define available audit actions
-- =====================================================
DO $$
BEGIN
    -- Create audit_action type if not exists
    IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'audit_action') THEN
        CREATE TYPE audit_action AS ENUM (
            'CREATE',
            'UPDATE',
            'DELETE',
            'LOGIN',
            'LOGOUT',
            'PASSWORD_CHANGE',
            'SERVICE_COMPLETED',
            'SERVICE_CANCELLED',
            'EXPORT_REPORT',
            'SETTINGS_CHANGE'
        );
    END IF;
END
$$;

-- =====================================================
-- TABLE: audit_logs
-- Purpose: Track all significant actions for audit trail
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action audit_action NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_system BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- INDEXES FOR AUDIT LOGS
-- =====================================================

-- Index for filtering by action type
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Index for filtering by user
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Index for filtering by entity
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Composite index for time-based range queries
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Composite index for user + time queries
CREATE INDEX idx_audit_logs_user_created_at ON audit_logs(user_id, created_at);

-- Index for recent activity (last 24 hours)
CREATE INDEX idx_audit_logs_created_at_24h ON audit_logs(created_at DESC)
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours';

-- =====================================================
-- PARTITION TABLE: audit_logs_archive
-- Purpose: Archive old audit logs for performance
-- Note: Create this as a regular table initially, use partitioning later if needed
-- =====================================================
CREATE TABLE audit_logs_archive (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action audit_action NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_system BOOLEAN DEFAULT FALSE
) INHERITS (audit_logs);

-- =====================================================
-- FUNCTION: Helper to create audit log entry
-- Purpose: Automatically log significant operations
-- =====================================================
CREATE OR REPLACE FUNCTION log_audit_action()
RETURNS TRIGGER AS $$
DECLARE
    v_action audit_action;
    v_entity_type VARCHAR(50);
    v_entity_id UUID;
BEGIN
    -- Determine action type
    IF TG_OP = 'DELETE' THEN
        v_action := 'DELETE';
    ELSIF TG_OP = 'UPDATE' THEN
        IF (TG_COLUMNS ~ 'updated_at') THEN
            v_action := 'UPDATE'; -- Just timestamp update
        ELSE
            v_action := 'UPDATE';
        END IF;
    ELSIF TG_OP = 'INSERT' THEN
        v_action := 'CREATE';
    END IF;

    -- Determine entity type and ID
    IF TG_TABLE_NAME = 'services' THEN
        v_entity_type := 'service';
        v_entity_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'expenses' THEN
        v_entity_type := 'expense';
        v_entity_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'drivers' THEN
        v_entity_type := 'driver';
        v_entity_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'veterinarians' THEN
        v_entity_type := 'veterinarian';
        v_entity_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'users' THEN
        v_entity_type := 'user';
        v_entity_id := NEW.id;
    END IF;

    -- Insert audit log entry
    INSERT INTO audit_logs (action, entity_type, entity_id, user_id, created_by_system)
    VALUES (
        v_action,
        v_entity_type,
        v_entity_id,
        COALESCE(NEW.id, (SELECT id FROM users WHERE email = COALESCE(NEW.email, 'system'))),
        TRUE
    );

    -- For DELETE, capture old values
    IF TG_OP = 'DELETE' THEN
        UPDATE audit_logs
        SET old_values = to_jsonb(OLD),
            new_values = NULL
        WHERE id = NEW.id;
        RETURN OLD;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC AUDIT LOGGING
-- =====================================================

-- Create triggers for each entity table
CREATE TRIGGER trg_audit_services
    AFTER INSERT OR UPDATE OR DELETE ON services
    FOR EACH ROW EXECUTE FUNCTION log_audit_action();

CREATE TRIGGER trg_audit_expenses
    AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION log_audit_action();

CREATE TRIGGER trg_audit_drivers
    AFTER INSERT OR UPDATE OR DELETE ON drivers
    FOR EACH ROW EXECUTE FUNCTION log_audit_action();

CREATE TRIGGER trg_audit_veterinarians
    AFTER INSERT OR UPDATE OR DELETE ON veterinarians
    FOR EACH ROW EXECUTE FUNCTION log_audit_action();

CREATE TRIGGER trg_audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_audit_action();

-- =====================================================
-- INDEXES FOR AUDIT LOGS (additional)
-- =====================================================

-- Index for action + time combination (common query pattern)
CREATE INDEX idx_audit_logs_action_time ON audit_logs(action, created_at);

-- Index for recent activity (last 7 days)
CREATE INDEX idx_audit_logs_created_at_7d ON audit_logs(created_at DESC)
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days';

-- =====================================================
-- VIEW: Audit summary for dashboard
-- Purpose: Quick access to audit summaries
-- =====================================================
CREATE OR REPLACE VIEW v_audit_summary AS
SELECT
    action,
    entity_type,
    COUNT(*) as count,
    MAX(created_at) as last_occurred,
    MIN(created_at) as first_occurred
FROM audit_logs
WHERE created_by_system = FALSE
GROUP BY action, entity_type
ORDER BY count DESC;

-- =====================================================
-- END OF MIGRATION
-- ================================================
