const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PricelistSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    isClientDefault: {
        type: Boolean
    },
    isVendorDefault: {
        type: Boolean
    },
    isActive: {
        type: Boolean
    },
    duoRates: [{ 
        source: {
            type: Schema.Types.ObjectId, ref: 'Language',
        },
        target: {
            type: Schema.Types.ObjectId, ref: 'Language'
        },
        industries: [{
            type: Schema.Types.ObjectId, ref: 'Industries'
        }],
        rates: {
            type: Object,
            default: {}
        }
    }],
    monoRates: [{ 
        target: {
            type: Schema.Types.ObjectId, ref: 'Language'
        },
        packageSize: {
            type: String,
            trim: true
        },
        industries: [{    
            type: Schema.Types.ObjectId, ref: 'Industries'
        }],
        rates: {
            type: Object,
            default: {}
        }
    }]
},{ minimize: false });

const Pricelist = mongoose.model('Pricelist', PricelistSchema);

module.exports = Pricelist;