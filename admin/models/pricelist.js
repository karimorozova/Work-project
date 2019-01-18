const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PricelistSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    isDefault: {
        type: Boolean
    },
    isActive: {
        type: Boolean
    },
    combinations: [{ 
        source: {
            type: Schema.Types.ObjectId, ref: 'Language',
        },
        target: {
            type: Schema.Types.ObjectId, ref: 'Language'
        },
        package: {
            type: String,
            trim: true
        },
        industries: [{
            industry: {
                type: Schema.Types.ObjectId, ref: 'Industries'
            },
            rates: {
                type: Object,
                default: {}
            }
        }]
    }]
},{ minimize: false });

const Pricelist = mongoose.model('Pricelist', PricelistSchema);

module.exports = Pricelist;