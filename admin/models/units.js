const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  type: {
    type: String,
    default: '',
    trim: true,
  },
  steps: {
    type: Array,
    default: () => [],
  },
  active: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: true,
  },
  sizes:{
    type: Array,
    default: () => [],
  },
});

const Units = mongoose.model('Units', UnitSchema);

module.exports = Units;
