const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // Se não houver token, retorna 401 Não Autorizado
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Se o token for inválido, retorna 403 Proibido
      return res.status(403).json({ message: 'Token inválido.' });
    }

    req.user = user; // Anexa as informações do usuário ao objeto de requisição
    next(); // Continua para a próxima função middleware ou rota
  });
};

module.exports = { verifyToken }; 