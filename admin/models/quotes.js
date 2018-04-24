const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

const QuoteSchema = new mongoose.Schema({
    id: { 
        type : String, 
        default : '', 
        trim : true 
    },
    companyName:{
        type: String,
        default: ''
    },
    beginDate:{
        type: String,
        default: ''
    }
    
});

const Quotes = mongoose.model('Quote', QuoteSchema);

module.exports = Quotes;