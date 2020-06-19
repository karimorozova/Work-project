const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const BasicPriceSchema = new Schema({
  type: {
    type: String,
    trim: true
  },
  sourceLanguage: {
    type: Schema.Types.ObjectId, ref: 'Language',
  },
  targetLanguage: {
    type: Schema.Types.ObjectId, ref: 'Language',
  },
  euroBasicPrice: {
    type: Number,
    default: 0,
  },
  usdBasicPrice: {
    type: Number,
    default: 0,
  },
  bgpBasicPrice: {
    type: Number,
    default: 0,
  }
}, { minimize: false });

const BasicPrice = mongoose.model('BasicPrice', BasicPriceSchema);

module.exports = BasicPrice;
