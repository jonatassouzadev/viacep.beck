const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado com sucesso!"))
  .catch(err => console.error("Erro ao conectar no MongoDB:", err));

// Modelo
const EnderecoSchema = new mongoose.Schema({
  cep: { type: String, unique: true, required: true },
  logradouro: String,
  bairro: String,
  cidade: String,
  uf: String
});

const Endereco = mongoose.model("Endereco", EnderecoSchema);

// Rota teste
app.get("/", (req, res) => {
  res.send("Backend funcionando com MongoDB!");
});

// Listar endereços
app.get("/enderecos", async (req, res) => {
  try {
    const enderecos = await Endereco.find().sort({ cep: 1 });
    res.json(enderecos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar endereços" });
  }
});

// Salvar endereço
app.post("/enderecos", async (req, res) => {
  const { cep, logradouro, bairro, cidade, uf } = req.body;

  try {
    const existe = await Endereco.findOne({ cep });
    if (existe) return res.status(400).json({ error: "CEP já salvo" });

    const novo = new Endereco({ cep, logradouro, bairro, cidade, uf });
    await novo.save();
    res.status(201).json({ message: "Endereço salvo com sucesso" });

  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar endereço" });
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
    res.status(500).json({ error: "Erro ao deletar endereço" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor rodando na porta ${PORT}`)
);
