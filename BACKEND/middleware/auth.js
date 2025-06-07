const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'Não autorizado. Por favor, faça login para continuar.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo');
    
    // Garantir que o ID do usuário seja um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ 
        message: 'Token inválido. Por favor, faça login novamente.' 
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Sua sessão expirou. Por favor, faça login novamente.' 
      });
    }
    return res.status(401).json({ 
      message: 'Token inválido. Por favor, faça login novamente.' 
    });
  }
};

// Middleware para verificar se o usuário é admin
const verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ 
      message: 'Acesso negado. Você precisa ser um administrador para realizar esta ação.' 
    });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin }; 