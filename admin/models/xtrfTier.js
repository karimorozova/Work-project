const mongoose = require('mongoose');

const XtrfTierSchema = new mongoose.Schema({
    languages: { 
        type : Array,
        default: []
    },
    industry: {
        type : String, 
        default : 'All', 
        trim : true
    },
    start: {
        type : Date, 
        default : new Date()
    },
    end: {
        type : Date, 
        default : new Date()
    },
});

const XtrfTier = mongoose.model('XtrfTier', XtrfTierSchema);

module.exports = XtrfTier;