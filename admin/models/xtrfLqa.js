const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const XtrfLqaSchema = new mongoose.Schema({
    vendor: { 
        type : Schema.Types.ObjectId, ref: 'XtrfVendor',
    },
    wordcounts: {
        type: Object,
        default: null
    },
    updatedAt: {
        type: Date,
        default: new Date()
    }
});

const XtrfLqa = mongoose.model('XtrfLqa', XtrfLqaSchema);

module.exports = XtrfLqa;