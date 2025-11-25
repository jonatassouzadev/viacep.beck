const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com MongoDB (SEM opções antigas)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado com sucesso!"))
  .catch(err => console.error("Erro ao conectar no MongoDB:", err));

// Schema e Model
const EnderecoSchema = new mongoose.Schema({
  cep: { type: String, required: true, unique: true },
  logradouro: String,
  bairro: String,
  cidade: String,
  uf: String
});

const Endereco = mongoose.model("Endereco", EnderecoSchema);

// Rota inicial
app.get("/", (req, res) => {
  res.json({ message: "Backend funcionando com MongoDB!" });
});

// Listar todos os endereços
app.get("/enderecos", async (req, res) => {
  try {
    const enderecos = await Endereco.find().sort({ cep: 1 });
    res.json(enderecos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar endereços", details: err });
  }
});

// Criar / Salvar endereço
app.post("/enderecos", async (req, res) => {
  const { cep, logradouro, bairro, cidade, uf } = req.body;

  try {
    const existe = await Endereco.findOne({ cep });
    if (existe) {
      return res.status(400).json({ error: "CEP já está salvo" });
    }

    const novoEndereco = new Endereco({
      cep,
      logradouro,
      bairro,
      cidade,
      uf
    });

    await novoEndereco.save();

    res.status(201).json({
      message: "Endereço salvo com sucesso!",
      endereco: novoEndereco
    });

  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar endereço", details: err });
  }
});

// Deletar endereço
app.delete("/enderecos/:cep", async (req, res) => {
  const { cep } = req.params;

  try {
    const deletado = await Endereco.findOneAndDelete({ cep });

    if (!deletado) {
      return res.status(404).json({ error: "CEP não encontrado" });
    }

    res.json({ message: "Endereço deletado com sucesso" });

  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar endereço", details: err });
  }
});

// Porta do servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
