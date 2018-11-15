const mongoose = require('mongoose');

const LeadSourceSchema = new mongoose.Schema({
    source: { 
        type : String, 
        default : '', 
        trim : true 
    }    
});

const LeadSource = mongoose.model('LeadSource', LeadSourceSchema);

module.exports = LeadSource;