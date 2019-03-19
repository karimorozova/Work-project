const mongoose = require('mongoose');

const ZohoSchema = new mongoose.Schema({
    access_token: { 
        type : String, 
        default : '', 
        trim : true 
    },
    refresh_token: { 
        type : String, 
        default : '', 
        trim : true 
    },
    lastRefreshed: {
        type: Date,
        default: Date.now
    },  
}, { minimize: false });

const Zoho = mongoose.model('Zoho', ZohoSchema);

module.exports = Zoho;