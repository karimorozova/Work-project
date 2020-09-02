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
  discountChart: {
    type: Object,
    default: {
      xTranslated: { text: "X translated", rate: 0.1 },
      repeat: { text: "Repetition", rate: 0.2 },
      contextMatch: { text: "Context match", rate: 0.2 },
      repeat100: { text: "100%", rate: 0.2 },
      repeat50: { text: "50-74%", rate: 1 },
      repeat75: { text: "75-84%", rate: 0.8 },
      repeat85: { text: "85-94%", rate: 0.6 },
      repeat95: { text: "95-99%", rate: 0.25 },
      noMatch: { text: "No match", rate: 1 }
    }
  }
}, { minimize: false });

const Pricelist = mongoose.model('Pricelist', PricelistSchema);

module.exports = Pricelist;
