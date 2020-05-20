const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  type: {
    type: String,
    default: '',
    trim: true,
  },
  active: {
    type: Boolean,
    default: false,
  }
});

const Units = mongoose.model('Units', UnitSchema);

module.exports = Units;
