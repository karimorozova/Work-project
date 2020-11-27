const mongoose = require('mongoose');

const discountsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true
  }
});

const Discounts = mongoose.model('Discounts', discountsSchema);

module.exports = Discounts;
