const express = require('express');
const router = express.Router();
const User = require('../../models/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendLoginNotification } = require('../../services/emailService');


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validar se os campos necessários foram fornecidos
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'E-mail e senha são obrigatórios' 
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: 'E-mail ou senha incorretos' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'E-mail ou senha incorretos' 
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'segredo',
      { expiresIn: '1d' }
    );

    // Enviar email de notificação
    try {
      await sendLoginNotification(user.email, user.username);
    } catch (emailError) {
      console.error('Erro ao enviar email de notificação:', emailError);
      // Não interrompe o login se o email falhar
    }

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ 
      message: 'Erro interno do servidor. Por favor, tente novamente mais tarde.' 
    });
  }
});


router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(400).json({ message: err.message });
  }
});

// Rota para listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para buscar um usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para atualizar um usuário
router.patch('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para deletar um usuário
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json({ message: 'Usuário deletado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 