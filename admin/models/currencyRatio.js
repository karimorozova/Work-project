const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CurrencyRatioSchema = new Schema({
  USD: {
    type: Number
  },
  GBP: {
    type: Number
  }
});

const CurrencyRatio = mongoose.model('CurrencyRatio', CurrencyRatioSchema);

module.exports = CurrencyRatio;
