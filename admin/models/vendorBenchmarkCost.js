const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const vendorBenchmarkCost = new mongoose.Schema({
  languagePair: {
    type: String,
    trim: true,
  },
  sourceLanguage: {
    type: Schema.Types.ObjectId, ref: 'Language',
    default: null
  },
  targetLanguage: {
    type: Schema.Types.ObjectId, ref: 'Language',
    default: null
  },
  industries: [
    {
      industry: {
        type: Schema.Types.ObjectId,
        ref: 'Industries',
        default: null
      },
      stepInfo: [
        {
          step: {
            type: Schema.Types.ObjectId,
            ref: 'Industries',
            default: null
          },
          unit: {
            type: Schema.Types.ObjectId,
            ref: 'Industries',
            default: null
          },
          benchmark: {
            type: Number,
            default: 0
          },
          vendorInfo: [{
            baseRate: {
              type: Number,
              default: 0
            },
            margin: {
              type: Number,
              default: 0
            },
            vendorName: {
              type: String,
              default: 0
            },
            vendor: {
              type: Schema.Types.ObjectId, ref: 'Vendors',
              default: null
            },
          }]
        }
      ],
    }
  ],
});

const VendorBenchmarkCost = mongoose.model('VendorBenchmarkCost', vendorBenchmarkCost);

module.exports = VendorBenchmarkCost;
