# Kafka Connect PostgreSQL CDC PoC

Simple Docker-based PoC using Kafka Connect + Debezium to capture PostgreSQL changes.

## Quick Start

```bash
cd poc-kafka-connect
docker-compose up -d
```

## Steps After Start

1. **Wait for services to be ready:**
   ```bash
   docker-compose logs -f | grep "Ready"
   ```

2. **Connect to PostgreSQL and create a publication:**
   ```bash
   docker exec -it pg-source-db psql -U postgres -d mydb
   ```

3. **In PostgreSQL, create publication:**
   ```sql
   -- Create replication slot
   SELECT pg_create_logical_replication_slot('kafka-connect-replication', 'pgoutput');

   -- Create publication
   CREATE PUBLICATION pg_publication FOR ALL TABLES;
   ```

4. **Create a test table and insert data:**
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100),
     email VARCHAR(255)
   );

   INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
   ```

5. **Watch Kafka Connect consume changes:**
   ```bash
   docker-compose logs -f connectors
   ```

## Architecture

```
┌──────────┐    ┌──────┐
│PostgreSQL│    │ Kafka │
└────┬─────┘    └──┬───┘
     │CDC changes  │
     └─────────────┼────────────┐
                   │            │
┌────▼────┐        │            │
│Debezium │◀───────┼◀───────────┤
│Connector│        │ Connect    │
└────┬────┘        └────────────┘
     │
     └──────────▶ Kafka Topics
```

## Services

- `postgres` - PostgreSQL 15 with CDC setup
- `kafka` - Kafka broker
- `zookeeper` - Zookeeper
- `connector` - Debezium PostgreSQL connector (all-in-one)

## Cleanup

```bash
docker-compose down -v
```
