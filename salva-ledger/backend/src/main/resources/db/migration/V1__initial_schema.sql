-- Flyway Migration V1__initial_schema
-- Description: Create all database tables and indexes for Vet Transport Ledger

-- Enable UUID OS extension if not present (PostgreSQL 12+)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for JPA @Enumerated support
DO $$
BEGIN
    -- Create if not exists to avoid duplicate errors
    IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'service_status') THEN
        CREATE TYPE service_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
    END IF;

    IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'expense_category') THEN
        CREATE TYPE expense_category AS ENUM ('FUEL', 'MAINTENANCE', 'EQUIPMENT', 'TAX', 'OTHER');
    END IF;
END
$$;

-- =====================================================
-- TABLE: business_settings
-- Purpose: Store business configuration (tax percentage, currency)
-- =====================================================
CREATE TABLE business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tax_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: drivers
-- Purpose: Store driver information
-- =====================================================
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    default_fee DECIMAL(10, 2),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: veterinarians
-- Purpose: Store veterinarian information
-- =====================================================
CREATE TABLE veterinarians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    default_fee DECIMAL(10, 2),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: services
-- Purpose: Store transport service records
-- =====================================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER UNIQUE,
    description VARCHAR(500) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    requester_name VARCHAR(200),
    veterinarian_id UUID REFERENCES veterinarians(id),
    driver_id UUID REFERENCES drivers(id),
    extra_cost DECIMAL(10, 2) DEFAULT 0.00,
    driver_cost DECIMAL(10, 2) DEFAULT 0.00,
    vet_cost DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    net_profit DECIMAL(10, 2) DEFAULT 0.00,
    status service_status NOT NULL DEFAULT 'PENDING',
    service_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: expenses
-- Purpose: Store operational expense records
-- =====================================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category expense_category NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR OPTIMIZED QUERIES
-- =====================================================

-- Index on services.service_date for date range queries and monthly reports
CREATE INDEX idx_services_service_date ON services(service_date);

-- Index on services.status for filtering pending/completed services
CREATE INDEX idx_services_status ON services(status);

-- Index on services.created_at for date ordering
CREATE INDEX idx_services_created_at ON services(created_at);

-- Index on services.updated_at for recent updates
CREATE INDEX idx_services_updated_at ON services(updated_at);

-- Composite index for monthly filtering by date and status
CREATE INDEX idx_services_date_status ON services(service_date, status);

-- Composite index for monthly filtering by year/month
CREATE INDEX idx_services_date_month ON services((EXTRACT(YEAR FROM service_date)), (EXTRACT(MONTH FROM service_date)));

-- Index on services.veterinarian_id for vet-specific queries
CREATE INDEX idx_services_veterinarian_id ON services(veterinarian_id);

-- Index on services.driver_id for driver-specific queries
CREATE INDEX idx_services_driver_id ON services(driver_id);

-- Index on services.number for quick lookup by service number
CREATE INDEX idx_services_number ON services(number);

-- Index on expenses.category for category filtering
CREATE INDEX idx_expenses_category ON expenses(category);

-- Index on expenses.date for date range queries
CREATE INDEX idx_expenses_date ON expenses(date);

-- Composite index for expense monthly reports by date and category
CREATE INDEX idx_expenses_date_category ON expenses(date, category);

-- Index on expenses.date for date ordering
CREATE INDEX idx_expenses_created_at ON expenses(created_at);

-- =====================================================
-- DATA INSERTIONS FOR INITIAL SETUP
-- =====================================================

-- Insert default business settings (tax: 10%, currency: BRL)
INSERT INTO business_settings (tax_percentage, currency)
VALUES (10.00, 'BRL')
ON CONFLICT (id) DO UPDATE SET
    tax_percentage = EXCLUDED.tax_percentage,
    currency = EXCLUDED.currency;

-- Insert sample veterinarians (replace with actual data as needed)
INSERT INTO veterinarians (name, default_fee, active) VALUES
    ('Dr. Silva - Cirurgias', 800.00, TRUE),
    ('Dr. Costa - Interna', 700.00, TRUE),
    ('Dra. Mendes - Pediatria', 750.00, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert sample drivers (replace with actual data as needed)
INSERT INTO drivers (name, default_fee, active) VALUES
    ('Joao Santos', 300.00, TRUE),
    ('Maria Oliveira', 300.00, TRUE),
    ('Carlos Ferreira', 350.00, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert sample expense categories (already defined as type, no insert needed)
-- Sample expense entries (optional seed data)
INSERT INTO expenses (description, amount, category, date)
VALUES
    ('Combustível - Diesel', 150.00, 'FUEL', CURRENT_DATE - INTERVAL '5 days'),
    ('Manutenção Pneus', 200.00, 'MAINTENANCE', CURRENT_DATE - INTERVAL '10 days'),
    ('Equipamento Vet - Sugador', 850.00, 'EQUIPMENT', CURRENT_DATE - INTERVAL '15 days'),
    ('Imposto de Renda Mensal', 320.00, 'TAX', CURRENT_DATE - INTERVAL '20 days'),
    ('Peças Alternativas', 450.00, 'MAINTENANCE', CURRENT_DATE - INTERVAL '25 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- TRIGGER FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with updated_at column
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_veterinarians_updated_at BEFORE UPDATE ON veterinarians
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF MIGRATION
-- =====================================================
