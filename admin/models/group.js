const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: { 
        type : String, 
        default : '', 
        trim : true 
    }    
});

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;