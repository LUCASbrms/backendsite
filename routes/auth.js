const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Importa o modelo que criamos

// ROTA: /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Expira em 1 hora
    await user.save();

    // --- Configuração do Nodemailer ---
    // ATENÇÃO: Substitua com suas credenciais de e-mail reais
    // É altamente recomendável usar variáveis de ambiente (.env) para isso
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Ex: Gmail, Outlook, etc.
      auth: {
        user: 'seu-email@gmail.com', // SEU E-MAIL
        pass: 'sua-senha-de-app-do-email', // SUA SENHA DE APP (não a senha normal)
      },
    });

    const mailOptions = {
      from: 'seu-email@gmail.com',
      to: user.email,
      subject: 'Recuperação de Senha',
      text: `Você solicitou a redefinição de senha.\n\n
             Clique no link a seguir para completar o processo:\n\n
             http://localhost:5173/resetar-senha/${token}\n\n
             Se você não solicitou isso, ignore este e-mail.\n`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'E-mail de recuperação enviado.' });
  } catch (error) {
    console.error('Erro em forgot-password:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// ROTA: /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token de recuperação inválido ou expirado.' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Senha alterada com sucesso.' });
  } catch (error) {
    console.error('Erro em reset-password:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;