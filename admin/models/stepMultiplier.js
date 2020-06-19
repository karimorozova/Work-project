const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StepMultiplierSchema = new Schema({
  step: {
    type: Schema.Types.ObjectId, ref: 'Step',
  },
  unit: {
    type: Schema.Types.ObjectId, ref: 'Units',
  },
  multiplier: {
    type: Number,
    default: 0,
  },
  euroMinPrice: {
    type: Number,
    default: 0,
  },
  usdMinPrice: {
    type: Number,
    default: 0,
  },
  bgpMinPrice: {
    type: Number,
    default: 0,
  }
});

const StepMultiplier = mongoose.model('StepMultiplier', StepMultiplierSchema);

module.exports = StepMultiplier;
