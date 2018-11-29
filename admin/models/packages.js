const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    name: { 
        type : String, 
        default : '', 
        trim : true 
    },
    size: { 
        type : String, 
        default : '', 
        trim : true 
    }    
});

const Package = mongoose.model('Package', PackageSchema);

module.exports = Package;