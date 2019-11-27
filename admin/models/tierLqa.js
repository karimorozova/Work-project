const mongoose = require('mongoose');

const TierLqaSchema = new mongoose.Schema({
    category: { 
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
    }
});

const TierLqa = mongoose.model('TierLqa', TierLqaSchema);

module.exports = TierLqa;