const mongoose = require('mongoose');

const DiscountChartSchema = new mongoose.Schema({
    name: { 
        type : String, 
        default : '', 
        trim : true 
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isClientDefault: {
        type: Boolean,
        default: false
    },
    isVendorDefault: {
        type: Boolean,
        default: false
    },
    matrixes: {
        client: {type: Object},
        vendor: {type: Object},
    }
});

const DiscountChart = mongoose.model('DiscountChart', DiscountChartSchema);

module.exports = DiscountChart;