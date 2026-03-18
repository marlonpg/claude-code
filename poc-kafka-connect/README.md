# Kafka Connect PostgreSQL PoC

This PoC demonstrates using Kafka Connect to capture data changes from PostgreSQL.

## Setup

1. Start PostgreSQL database with replication enabled
2. Create a publication in PostgreSQL:
   ```sql
   CREATE PUBLICATION pg_publication FOR TABLE your_table_name;
   ```

3. Configure replication slot:
   ```sql
   SELECT pg_create_logical_replication_slot('kafka-connect-replication', 'pgoutput');
   ```

## Configuration Files

- `config/postgres-source.json` - Full JSON configuration
- `config/debezium-postgres.yaml` - YAML configuration
- `start-postgres-connector.sh` - Setup script

## Run Kafka Connect

```bash
export BOOTSTRAP_SERVERS="localhost:9092"
export CONNECT_CONFIG="config/connector.properties"
export CONNECT_PLUGIN_PATH="/path/to/debezium-connector-postgres/target/debezium-connector-postgres.jar"

bin/connect-standalone.sh config/connector.properties connectors/postgres-connector.json
```

## Example

This PoC shows:
- Debezium PostgreSQL connector integration
- Logical replication slot configuration
- Change Data Capture (CDC) from PostgreSQL
- JSON format output to Kafka topics

## Dependencies

- Java JDK 11+
- Kafka 2.8+
- Debezium PostgreSQL Connector
- PostgreSQL 10+
