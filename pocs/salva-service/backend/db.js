const Database = require('better-sqlite3');
const path = require('path');

// Create in-memory database
const db = new Database(':memory:');

// Create lancamentos table
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS lancamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor REAL NOT NULL,
    veterinario TEXT,
    valorVeterinario REAL,
    motorista TEXT,
    valorMotorista REAL,
    mesReferente TEXT NOT NULL,
    data TEXT NOT NULL,
    valorImposto REAL,
    resultadoLiquido REAL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`;

db.exec(createTableSQL);

// Export the database instance
module.exports = db;