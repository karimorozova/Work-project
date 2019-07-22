const mongoose = require('mongoose');

const CancelReasonSchema = new mongoose.Schema({
    reason: { 
        type : String, 
        default : '', 
        trim : true 
    }
});

const CancelReason = mongoose.model('CancelReason', CancelReasonSchema);

module.exports = CancelReason;