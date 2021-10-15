const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StepSchema = new mongoose.Schema({
  title: {
    type: String,
    default: '',
    trim: true
  },
  calculationUnit: [{
    type: Schema.Types.ObjectId, ref: "Units"
  }],
  isActive: {
    type: Boolean,
    default: true
  },
});

const Step = mongoose.model('Step', StepSchema);

module.exports = Step;
