const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const driverSchema = new Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  carModel: {
    type: String,
  },
  plateNumber: {
    type: String,
  },
  capacity: {
    type: Number,
    default: 1
  },
  accountNumber: {
    type: String
  },
  accountName: {
    type: String
  },
  bankName: {
    type: String,
  },
  rating: {
    type: Number,
    default: 5.0
  },
  available: {
    type: Boolean,
    default: false
  }
})

const driverModel = mongoose.model('driver', driverSchema);

module.exports = driverModel
