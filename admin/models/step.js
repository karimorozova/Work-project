const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
    title: { 
        type : String, 
        default : '', 
        trim : true 
    },
    isStage1: {
        type: Boolean
    },
    isStage2: {
        type: Boolean
    },
    isEditor: {
        type: Boolean
    },
    isActive: {
        type: Boolean
    }
});

const Step = mongoose.model('Step', StepSchema);

module.exports = Step;