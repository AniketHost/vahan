const mongoose = require('mongoose');

const qrSchema = new mongoose.Schema({

  qrId: {
    type: String,
    required: true,
    unique: true
  },

  status: {
    type: String,
    enum: ['unused', 'used'],
    default: 'unused'
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model('QrCode', qrSchema);