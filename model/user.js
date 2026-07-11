const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: String,
  phone: String,
  email:String,
  qrId: {
    type: String,
    unique: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  password: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
