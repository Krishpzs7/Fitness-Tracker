const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  height: {
    type: Number,
    required: true // in cm
  },
  weight: {
    type: Number,
    required: true // in kg
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);
