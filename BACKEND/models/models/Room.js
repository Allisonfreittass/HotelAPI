const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
  },
  images: [{
    type: String, // URLs das imagens
    required: false
  }],
  amenities: [{
    type: String, // Lista de comodidades (ex: "Wi-Fi", "Ar condicionado", etc)
    required: false
  }]
});

module.exports = mongoose.model('Room', roomSchema); 