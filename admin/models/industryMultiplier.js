const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IndustryMultiplierSchema = new Schema({
  industry: {
    type: Schema.Types.ObjectId, ref: 'Industries',
  },
  multiplier: {
    type: Number,
    default: 100,
  }
});

const IndustryMultiplier = mongoose.model('IndustryMultiplier', IndustryMultiplierSchema);

module.exports = IndustryMultiplier;
