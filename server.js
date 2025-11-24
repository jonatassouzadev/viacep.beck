// Importando dependências
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config(); // Lê variáveis do .env

// Criando o app Express
const app = express();

// Middlewares
app.use(cors()); // Permite que o frontend acesse o backend
app.use(express.json()); // Permite receber JSON no corpo das requisições

// Configuração do PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Backend funcionando!');
});

// Iniciando o servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
// --- Rota para listar todos os endereços ---
app.get('/enderecos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM enderecos ORDER BY cep');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar endereços' });
  }
});

// --- Rota para salvar um endereço ---
app.post('/enderecos', async (req, res) => {
  console.log('Requisição recebida:', req.body); // <--- adicione isso
  const { cep, logradouro, bairro, cidade, uf } = req.body;

  if (!cep || !logradouro || !bairro || !cidade || !uf) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const exists = await pool.query('SELECT * FROM enderecos WHERE cep = $1', [cep]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'CEP já salvo' });
    }

    await pool.query(
      'INSERT INTO enderecos (cep, logradouro, bairro, cidade, uf) VALUES ($1, $2, $3, $4, $5)',
      [cep, logradouro, bairro, cidade, uf]
    );

    res.status(201).json({ message: 'Endereço salvo com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar endereço' });
  }
});


// --- Rota para deletar um endereço pelo CEP ---
app.delete('/enderecos/:cep', async (req, res) => {
  const { cep } = req.params;

  try {
    const result = await pool.query('DELETE FROM enderecos WHERE cep = $1', [cep]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'CEP não encontrado' });
    }

    res.json({ message: 'Endereço deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar endereço' });
  }
});
