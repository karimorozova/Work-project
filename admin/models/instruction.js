const mongoose = require('mongoose');

const InstructionSchema = new mongoose.Schema({
    type: { 
        type : String, 
        default : '', 
        trim : true 
    },
    content: { 
        type : String, 
        default : '', 
        trim : true 
    },
    isSpecific: {
        type: Boolean,
        default: false
    }
});

const Instruction = mongoose.model('Instruction', InstructionSchema);

module.exports = Instruction;