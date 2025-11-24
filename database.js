const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB conectado com sucesso!");
    return client.db(process.env.MONGO_DB_NAME);
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
  }
}

module.exports = connectDB;
