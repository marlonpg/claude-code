# Flyway Migrations for Vet Transport Ledger

This directory contains Flyway migration scripts for the Vet Transport Ledger PostgreSQL database.

## Migration Order

The migrations are executed in alphabetical (Vn__) order:

1. **V1__initial_schema.sql** - Core database tables
2. **V2__add_users_and_roles.sql** - User management for JWT authentication
3. **V3__add_audit_logs.sql** - Audit trail for financial operations

## Tables Created

### V1: Core Tables
- `business_settings` - Business configuration (tax %, currency)
- `drivers` - Driver information
- `veterinarians` - Veterinarian information
- `services` - Transport service records
- `expenses` - Operational expenses

### V2: User Tables
- `users` - User accounts for JWT authentication

### V3: Audit Tables
- `audit_logs` - Audit trail for all operations
- `audit_logs_archive` - Partition for archived logs

## Enum Types

- `service_status` (PENDING, COMPLETED, CANCELLED)
- `expense_category` (FUEL, MAINTENANCE, EQUIPMENT, TAX, OTHER)
- `role` (ADMIN, DRIVER, ASSISTANT)

## Indexes Created

All indexes are documented in the migration SQL files. Key indexes:
- Date-based indexes for services (service_date, created_at)
- Foreign key indexes (veterinarian_id, driver_id)
- Status filters for pending/completed queries
- Expense category filtering
- Audit log indexes for performance

## Initial Data

The migrations include sample data for:
- Business settings (10% tax, BRL currency)
- Sample veterinarians and drivers (can be customized)
- Sample expenses for initial testing

## Running Migrations

Flyway is automatically executed on application startup:

```bash
# Via Maven
mvn clean package

# The migrations run automatically on database startup
# Configure datasource in application.properties
```

## Customizing

Edit the migration files directly. Flyway version control allows:
- Adding new migrations in Vn__ sequence
- Reverting changes with Flyway's undo functionality
- Database version control across environments

## Production Considerations

Before deploying to production:
1. Remove sample/demo data from migrations
2. Update initial user passwords
3. Configure production business settings
4. Review security settings (password hashing, rate limiting)
