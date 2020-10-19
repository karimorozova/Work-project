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
  newLangPairs: {
    type: Array,
    default: []
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
    },
    isActive: {
      type: Boolean,
      default: true
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
    },
    isActive: {
      type: Boolean,
      default: true
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
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  discountChart: {
    type: Object,
    default: {
      xTranslated: { text: "X translated", rate: 10 },
      repeat: { text: "Repetition", rate: 20 },
      contextMatch: { text: "Context match", rate: 20 },
      repeat100: { text: "100%", rate: 20 },
      repeat50: { text: "50-74%", rate: 100 },
      repeat75: { text: "75-84%", rate: 80 },
      repeat85: { text: "85-94%", rate: 60 },
      repeat95: { text: "95-99%", rate: 25 },
      noMatch: { text: "No match", rate: 100 }
    }
  }
}, { minimize: false });

const Pricelist = mongoose.model('Pricelist', PricelistSchema);

module.exports = Pricelist;
