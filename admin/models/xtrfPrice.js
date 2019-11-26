const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const XtrfPriceSchema = new mongoose.Schema({
    language: { 
        type : Schema.Types.ObjectId, ref: 'XtrfReportLang',
    },
    prices: {
        type: Object,
        default: null
    },
    updatedAt: {
        type: Date,
        default: new Date()
    }
});

const XtrfPrice = mongoose.model('XtrfPrice', XtrfPriceSchema);

module.exports = XtrfPrice;