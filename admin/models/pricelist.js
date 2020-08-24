const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PricelistSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  isVendorDefault: {
    type: Boolean
  },
  isActive: {
    type: Boolean
  },
  basicPricesTable: [{
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
    gbpBasicPrice: {
      type: Number,
      default: 1,
    },
    altered: {
      type: Boolean,
      default: false
    }
  }],
  stepMultipliersTable: [{
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
    },
    defaultSize: {
      type: Boolean,
      default: false
    },
    altered: {
      type: Boolean,
      default: false
    }
  }],
  industryMultipliersTable: [{
    industry: {
      type: Schema.Types.ObjectId, ref: 'Industries',
    },
    multiplier: {
      type: Number,
      default: 100,
    },
    altered: {
      type: Boolean,
      default: false
    }
  }],
}, { minimize: false });

const Pricelist = mongoose.model('Pricelist', PricelistSchema);

module.exports = Pricelist;
