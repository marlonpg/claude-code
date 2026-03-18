-- Flyway Migration V4__add_api_audit_logs
-- Description: Add API audit logs for request/response tracking
-- This table stores detailed request/response information for debugging

-- =====================================================
-- ENUM TYPE: audit_log_status
-- Purpose: Define request outcome status
-- =====================================================
DO $$
BEGIN
    -- Create status type if not exists
    IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'audit_log_status') THEN
        CREATE TYPE audit_log_status AS ENUM ('SUCCESS', 'FAILURE');
    END IF;
END
$$;

-- =====================================================
-- TABLE: api_audit_logs
-- Purpose: Track all API requests and responses for debugging/auditing
-- =====================================================
CREATE TABLE api_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(200) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status audit_log_status NOT NULL,
    request_body JSONB,
    response_body JSONB,
    user_agent VARCHAR(500),
    request_time_ms INTEGER,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR API AUDIT LOGS
-- =====================================================

-- Index for endpoint-based filtering
CREATE INDEX idx_api_audit_logs_endpoint ON api_audit_logs(endpoint);

-- Index for method + endpoint queries
CREATE INDEX idx_api_audit_logs_method_endpoint ON api_audit_logs(method, endpoint);

-- Index for status filtering
CREATE INDEX idx_api_audit_logs_status ON api_audit_logs(status);

-- Index for time-based queries
CREATE INDEX idx_api_audit_logs_created_at ON api_audit_logs(created_at);

-- Composite index for failed requests
CREATE INDEX idx_api_audit_logs_failed ON api_audit_logs(endpoint, created_at)
    WHERE status = 'FAILURE';

-- Composite index for recent API usage
CREATE INDEX idx_api_audit_logs_recent ON api_audit_logs(endpoint, status)
    WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour';

-- =====================================================
-- DATA INSERTIONS FOR INITIAL SETUP
-- =====================================================

-- No sample data needed for audit logs (they are system-generated)

-- =====================================================
-- TRIGGERS FOR AUTOMATIC AUDIT LOGGING
-- Note: These are handled by interceptors/filters, not triggers
-- =====================================================

-- =====================================================
-- END OF MIGRATION
-- ================================================
