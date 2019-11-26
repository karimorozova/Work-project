const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const XtrfVendorSchema = new mongoose.Schema({
    name: {
        type : String, 
        default : '', 
        trim : true
    },
    language: { 
        type : Schema.Types.ObjectId, ref: 'XtrfReportLang',
    },
    basicPrice: {
        type : String, 
        default : '', 
        trim : true
    },
    tqi: {
        type : String, 
        default : '', 
        trim : true
    },
    lqa1: {
        type : String, 
        default : '', 
        trim : true
    },
    lqa2: {
        type : String, 
        default : '', 
        trim : true
    },
    lqa3: {
        type : String, 
        default : '', 
        trim : true
    },
    steps: [{
        type : String, 
        default : 'Translator', 
        trim : true
    }],
    type: {
        type : String, 
        default : 'Pangea', 
        trim : true
    },
    wordcount: {
        type: String,
        default: "",
        trim: true
    }
});

const XtrfVendor = mongoose.model('XtrfVendor', XtrfVendorSchema);

module.exports = XtrfVendor;