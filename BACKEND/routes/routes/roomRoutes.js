const express = require('express');
const router = express.Router();
const Room = require('../../models/models/Room');

// Rota para limpar todos os quartos
router.delete('/admin/clear', async (req, res) => {
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

// Rota para criar um novo quarto
router.post('/', async (req, res) => {
  try {
    // Verificar se já existe um quarto com o mesmo número
    const existingRoom = await Room.findOne({ roomNumber: req.body.roomNumber });
    if (existingRoom) {
      return res.status(400).json({ 
        message: `Já existe um quarto com o número ${req.body.roomNumber}. Por favor, escolha outro número.` 
      });
    }

    const newRoom = new Room(req.body);
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para listar todos os quartos
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para buscar um quarto por ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Quarto não encontrado' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para atualizar um quarto
router.patch('/:id', async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRoom) return res.status(404).json({ message: 'Quarto não encontrado' });
    res.json(updatedRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para deletar um quarto
router.delete('/:id', async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) return res.status(404).json({ message: 'Quarto não encontrado' });
    res.json({ message: 'Quarto deletado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 