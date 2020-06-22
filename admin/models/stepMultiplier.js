const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StepMultiplierSchema = new Schema({
  step: {
    type: Schema.Types.ObjectId, ref: 'Step',
  },
  unit: {
    type: Schema.Types.ObjectId, ref: 'Units',
  },
  size: {
    type: Number,
  },
  multiplier: {
    type: Number,
    default: 100,
  },
  euroMinPrice: {
    type: Number,
    default: 1,
  },
  usdMinPrice: {
    type: Number,
    default: 1,
  },
  gbpMinPrice: {
    type: Number,
    default: 1,
  }
});

const StepMultiplier = mongoose.model('StepMultiplier', StepMultiplierSchema);

module.exports = StepMultiplier;
