const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/models/User'); // Importar modelo de usuário se a referência for usada
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth'); // Corrigir importação do middleware de auth

// Middleware para obter o usuário logado (se houver)
const getUserFromToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    req.user = null; 
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null; 
    } else {
      req.user = user; // Usuário decodificado do token
    }
    next();
  });
};

// Aplicar middleware para todas as rotas de review
router.use(getUserFromToken);

// GET /api/reviews - Listar todas as avaliações
router.get('/', async (req, res) => {
  try {
    // Popular o campo 'user' com nome de usuário e email (opcional, ajuste conforme necessário)
    const reviews = await Review.find().populate('user', 'username email');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews - Criar uma nova avaliação (requer autenticação)
router.post('/', verifyToken, async (req, res) => {
  const review = new Review({
    author: req.body.author,
    location: req.body.location,
    quote: req.body.quote,
    rating: req.body.rating,
    // Associar avaliação ao usuário logado
    user: req.user ? req.user._id : null, 
  });

  try {
    const newReview = await review.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/reviews/:id - Deletar uma avaliação (exemplo, pode adicionar verificação de quem pode deletar)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (review == null) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }
    
    // Opcional: Verificar se o usuário logado é o autor da avaliação ou um admin para permitir a exclusão
    // if (review.user.toString() !== req.user._id && !req.user.isAdmin) {
    //   return res.status(403).json({ message: 'Você não tem permissão para deletar esta avaliação' });
    // }

    await review.remove();
    res.json({ message: 'Avaliação removida' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 