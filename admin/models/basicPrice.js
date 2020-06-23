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
    default: 1,
  },
  usdBasicPrice: {
    type: Number,
    default: 1,
  },
  bgpBasicPrice: {
    type: Number,
    default: 1,
  }
}, { minimize: false });

const BasicPrice = mongoose.model('BasicPrice', BasicPriceSchema);

module.exports = BasicPrice;
