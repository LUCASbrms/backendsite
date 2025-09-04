// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importar rotas
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000; // A porta que o backend vai rodar

// Middlewares
app.use(cors()); // Permite que o frontend (em outra porta) se comunique com o backend
app.use(express.json()); // Permite que o servidor entenda JSON

// Conexão com o Banco de Dados (MongoDB)
// ATENÇÃO: Substitua pela sua string de conexão do MongoDB Atlas ou local
mongoose.connect('mongodb://localhost:27017/meuprojeto_db')
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Usar as Rotas
// Todas as rotas em auth.js começarão com /api/auth
app.use('/api/auth', authRoutes);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});