require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Importar rotas
const userRoutes = require('../BACKEND/routes/routes/userRoutes');
const roomRoutes = require('../BACKEND/routes/routes/roomRoutes');
const bookingRoutes = require('../BACKEND/routes/routes/bookingRoutes');
const reviewRoutes = require('./routes/reviews');

// Middleware para parsear JSON e CORS
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static('uploads'));

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB!'))
.catch(err => console.error('Erro de conexão ao MongoDB:', err));

// Usar rotas
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API do Hotel - Backend');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 