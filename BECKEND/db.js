const mysql = require('mysql2');

// Criação do pool de conexões
const pool = mysql.createPool({
  host: 'srv1661.hstgr.io',
  user: 'u453797977_Gabriel',
  password: 'Gabriel@41526579',
  database: 'u453797977_VERIFIQ',
  waitForConnections: true,  // Isso faz o pool esperar por uma conexão livre
  queueLimit: 0              // Sem limite de fila
});

// Fazendo as consultas usando o pool
const db = pool.promise(); // Isso permite usar promessas

module.exports = db;
