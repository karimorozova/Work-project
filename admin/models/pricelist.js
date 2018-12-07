const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PricelistSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    default: {
        type: Boolean
    },
    active: {
        type: Boolean
    },
    combinations: [{ 
        source: {
            type: Schema.Types.ObjectId, ref: 'Language',
        },
        target: {
            type: Schema.Types.ObjectId, ref: 'Language'
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