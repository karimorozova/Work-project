const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
    title: { 
        type : String, 
        default : '', 
        trim : true 
    },
    calculationUnit: {
        type: String,
        default: 'Words',
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
    },
    symbol: {
        type : String, 
        default : '', 
        trim : true
    }
});

const Step = mongoose.model('Step', StepSchema);

module.exports = Step;