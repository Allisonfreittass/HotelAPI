const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/models/User'); // Importar modelo de usuário se a referência for usada
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { verifyToken, verifyAdmin } = require('../middleware/auth'); // Corrigir importação do middleware de auth

// Middleware para obter o usuário logado (se houver)
const getUserFromToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    req.user = null; 
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo');
    
    // Garantir que o ID do usuário seja um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      req.user = null;
      return next();
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Aplicar middleware para todas as rotas de review
router.use(getUserFromToken);

// GET /api/reviews - Listar todas as avaliações
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 }); // Ordenar por data de criação, mais recentes primeiro
    
    // Formatar as avaliações para incluir informações do usuário
    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      quote: review.quote,
      author: review.author || (review.user ? review.user.username : 'Anônimo'),
      location: review.location,
      rating: review.rating,
      user: review.user,
      createdAt: review.createdAt,
      image: review.image
    }));

    res.json(formattedReviews);
  } catch (err) {
    console.error('Erro ao buscar avaliações:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews - Criar uma nova avaliação (requer autenticação)
router.post('/', verifyToken, async (req, res) => {
  try {
    // Verificar se o usuário existe
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ 
        message: 'Usuário não encontrado. Por favor, faça login novamente.' 
      });
    }

    const review = new Review({
      author: req.body.author,
      location: req.body.location,
      quote: req.body.quote,
      rating: req.body.rating,
      user: req.user.id
    });

    const newReview = await review.save();
    
    // Popular os dados do usuário antes de retornar
    const populatedReview = await Review.findById(newReview._id).populate('user', 'username email');
    
    res.status(201).json(populatedReview);
  } catch (err) {
    console.error('Erro ao criar avaliação:', err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/reviews/:id - Deletar uma avaliação
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (review == null) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }
    
    // Verificar se o usuário logado é o autor da avaliação ou um admin
    if (review.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Você não tem permissão para deletar esta avaliação' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Avaliação removida' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para admin deletar todas as avaliações
router.delete('/admin/clear', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Review.deleteMany({});
    res.json({ message: 'Todas as avaliações foram removidas' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 