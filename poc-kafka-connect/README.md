# Kafka Connect PostgreSQL CDC PoC

## Start PostgreSQL Only

```bash
cd poc-kafka-connect
docker-compose -f docker-compose.yml up -d
```

## Start Kafka + Debezium Connector

```bash
docker-compose -f docker-compose-kafka.yml up -d
```

## Setup

1. **Wait for services to start:**
   ```bash
   docker-compose -f docker-compose-kafka.yml logs -f
   ```

2. **Connect to PostgreSQL:**
   ```bash
   docker exec -it pg-source-db psql -U postgres -d mydb
   ```

3. **Create replication and publication:**
   ```sql
   SELECT pg_create_logical_replication_slot('kafka-connect-replication', 'pgoutput');
   CREATE PUBLICATION pg_publication FOR ALL TABLES;
   CREATE TABLE users (id SERIAL, name VARCHAR(100), email VARCHAR(255));
   INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
   \q
   ```

4. **Watch Kafka Connect consume changes:**
   ```bash
   docker-compose -f docker-compose-kafka.yml logs -f debezium-connector
   ```

## Architecture

```
┌─────────┐    ┌───┐
│Postgres │    │Kafka│
└────┬────┘    └──┬─┘
     │CDC          │
     └─────────────┼────────┐
                   │        │
                   └───────┐│
                           ││
                   ┌───────┘│
                   │Debezium│
                   │ Connector│
                   └─────────┘
```

## Clean Up

```bash
docker-compose -f docker-compose-kafka.yml down -v
docker-compose -f docker-compose.yml down -v
```
