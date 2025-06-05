const express = require('express');
const router = express.Router();
const Booking = require('../../models/models/Booking');
const Room = require('../../models/models/Room');

// Rota para criar uma nova reserva
router.post('/', async (req, res) => {
  try {
    const { user, room, checkInDate, checkOutDate } = req.body;

    // Verificar se o quarto está disponível
    const existingRoom = await Room.findById(room);
    if (!existingRoom || !existingRoom.isAvailable) {
      return res.status(400).json({ message: 'Quarto não disponível ou não encontrado.' });
    }

    // Calcular o preço total (exemplo simples)
    const oneDay = 24 * 60 * 60 * 1000; // horas*minutos*segundos*milisegundos
    const firstDate = new Date(checkInDate);
    const secondDate = new Date(checkOutDate);
    const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
    const totalPrice = diffDays * existingRoom.price;

    const newBooking = new Booking({
      user,
      room,
      checkInDate,
      checkOutDate,
      totalPrice,
    });
    await newBooking.save();

    // Atualizar o status de disponibilidade do quarto
    existingRoom.isAvailable = false;
    await existingRoom.save();

    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para listar todas as reservas
router.get('/', async (req, res) => {
  try {
    const { user } = req.query;
    let query = {};
    if (user) {
      query.user = user;
    }
    const bookings = await Booking.find(query).populate('user').populate('room');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para buscar uma reserva por ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user').populate('room');
    if (!booking) return res.status(404).json({ message: 'Reserva não encontrada' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para atualizar uma reserva
router.patch('/:id', async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBooking) return res.status(404).json({ message: 'Reserva não encontrada' });
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para cancelar uma reserva (exemplo: mudar status para 'cancelled')
router.patch('/cancel/:id', async (req, res) => {
  try {
    const cancelledBooking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!cancelledBooking) return res.status(404).json({ message: 'Reserva não encontrada' });

    // Se a reserva for cancelada, tornar o quarto disponível novamente
    const room = await Room.findById(cancelledBooking.room);
    if (room) {
      room.isAvailable = true;
      await room.save();
    }

    res.json(cancelledBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para deletar uma reserva
router.delete('/:id', async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) return res.status(404).json({ message: 'Reserva não encontrada' });

    // Se a reserva for deletada, tornar o quarto disponível novamente
    const room = await Room.findById(deletedBooking.room);
    if (room) {
      room.isAvailable = true;
      await room.save();
    }

    res.json({ message: 'Reserva deletada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 