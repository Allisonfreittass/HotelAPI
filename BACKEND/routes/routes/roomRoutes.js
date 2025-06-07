const express = require('express');
const router = express.Router();
const Room = require('../../models/models/Room');
const Booking = require('../../models/models/Booking');
const { verifyToken, verifyAdmin } = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/rooms');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Apenas imagens são permitidas!'), false);
    }
    cb(null, true);
  }
});

// Rota para limpar todos os quartos
router.delete('/admin/clear', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Room.deleteMany({});
    res.json({ message: 'Todos os quartos foram removidos' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para criar quartos de teste
router.post('/create-test', async (req, res) => {
  try {
    const testRooms = [
      {
        roomNumber: '101',
        type: 'Quarto de Teste',
        price: 150,
        isAvailable: true,
        description: 'Quarto de teste para desenvolvimento',
      },
      {
        roomNumber: '201',
        type: 'Quarto Casal',
        price: 250,
        isAvailable: true,
        description: 'Quarto casal com cama king size',
      },
      {
        roomNumber: '301',
        type: 'Quarto Solteiro',
        price: 120,
        isAvailable: true,
        description: 'Quarto solteiro com cama de solteiro',
      }
    ];

    const createdRooms = await Room.insertMany(testRooms);
    res.status(201).json(createdRooms);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/rooms - Listar todos os quartos
router.get('/', async (req, res) => {
  try {
    console.log('Buscando todos os quartos');
    const rooms = await Room.find();
    console.log(`Encontrados ${rooms.length} quartos`);

    const roomsWithBookings = await Promise.all(rooms.map(async (room) => {
      const bookings = await Booking.find({ room: room._id })
        .populate('user', 'username email')
        .sort({ checkInDate: -1 });
      return {
        ...room.toObject(),
        bookings
      };
    }));

    console.log('Quartos processados com reservas');
    res.json(roomsWithBookings);
  } catch (err) {
    console.error('Erro ao buscar quartos:', err);
    res.status(500).json({ 
      message: err.message,
      details: err.stack
    });
  }
});

// POST /api/rooms - Criar um novo quarto
router.post('/', verifyToken, verifyAdmin, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Recebendo dados do quarto:', req.body);
    console.log('Arquivos recebidos:', req.files);

    // Verificar se já existe um quarto com o mesmo número
    const existingRoom = await Room.findOne({ roomNumber: req.body.roomNumber });
    if (existingRoom) {
      return res.status(400).json({ 
        message: `Já existe um quarto com o número ${req.body.roomNumber}. Por favor, escolha outro número.` 
      });
    }

    const roomData = {
      ...req.body,
      images: req.files ? req.files.map(file => `/uploads/rooms/${file.filename}`) : [],
      amenities: JSON.parse(req.body.amenities || '[]'),
      price: Number(req.body.price)
    };

    console.log('Dados processados do quarto:', roomData);

    const room = new Room(roomData);
    const newRoom = await room.save();
    
    console.log('Quarto salvo com sucesso:', newRoom);
    res.status(201).json(newRoom);
  } catch (err) {
    console.error('Erro ao criar quarto:', err);
    res.status(400).json({ 
      message: err.message,
      details: err.stack
    });
  }
});

// PUT /api/rooms/:id - Atualizar um quarto
router.put('/:id', verifyToken, verifyAdmin, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Recebendo atualização do quarto:', req.params.id);
    console.log('Dados recebidos:', req.body);
    console.log('Arquivos recebidos:', req.files);

    // Verificar se o quarto existe
    const existingRoom = await Room.findById(req.params.id);
    if (!existingRoom) {
      console.log('Quarto não encontrado:', req.params.id);
      return res.status(404).json({ message: 'Quarto não encontrado' });
    }

    const roomData = {
      ...req.body,
      amenities: JSON.parse(req.body.amenities || '[]'),
      price: Number(req.body.price)
    };

    // Manter as imagens existentes se não houver novas imagens
    if (!req.files || req.files.length === 0) {
      roomData.images = existingRoom.images;
    } else {
      roomData.images = req.files.map(file => `/uploads/rooms/${file.filename}`);
    }

    console.log('Dados processados para atualização:', roomData);

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      roomData,
      { 
        new: true,
        runValidators: true // Garante que as validações do schema sejam executadas
      }
    );

    console.log('Quarto atualizado com sucesso:', updatedRoom);
    res.json(updatedRoom);
  } catch (err) {
    console.error('Erro ao atualizar quarto:', err);
    res.status(400).json({ 
      message: err.message,
      details: err.stack
    });
  }
});

// DELETE /api/rooms/:id - Deletar um quarto
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Quarto não encontrado' });
    }
    res.json({ message: 'Quarto removido com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 