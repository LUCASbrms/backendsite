// Importações necessárias
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg'); // Exemplo usando o 'pg'
const salt = await bcrypt.genSalt(10);
const senhaHash = await bcrypt.hash(senhaDoUsuario, salt);
// Salve a 'senhaHash' no banco de dados, e não a 'senhaDoUsuario'

const router = express.Router();

// Configuração da conexão com o PostgreSQL
// (Idealmente, isso vem de variáveis de ambiente)
const pool = new Pool({
  user: 'seu_usuario',
  host: 'localhost',
  database: 'seu_banco',
  password: 'sua_senha',
  port: 5432,
});

// Rota de Login: POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // 1. Validação básica dos dados de entrada
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // 2. Buscar o usuário no banco de dados pelo email
    const userQuery = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    
    if (userQuery.rows.length === 0) {
      // Se não encontrou nenhum usuário com esse email
      return res.status(404).json({ message: 'Credenciais inválidas.' }); // Mensagem genérica por segurança
    }

    const user = userQuery.rows[0];

    // 3. Comparar a senha enviada com a senha hash salva no banco
    // A senha no banco DEVE estar com hash (ex: user.senha_hash)
    const isPasswordMatch = await bcrypt.compare(senha, user.senha_hash);

    if (!isPasswordMatch) {
      // Se as senhas não batem
      return res.status(401).json({ message: 'Credenciais inválidas.' }); // Mensagem genérica por segurança
    }

    // 4. Se tudo deu certo, gerar o token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email }, // Informações que você quer guardar no token (payload)
      'SEU_SEGREDO_SUPER_SECRETO_DO_JWT',       // Chave secreta (deve vir de uma variável de ambiente)
      { expiresIn: '1h' }                     // Tempo de expiração do token
    );

    // 5. Enviar o token de volta para o cliente
    res.status(200).json({
      message: 'Login realizado com sucesso!',
      token: token,
      userId: user.id
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Ocorreu um erro no servidor.' });
  }
});

module.exports = router;