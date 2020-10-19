const mongoose = require('mongoose');

const IndustriesSchema = new mongoose.Schema({
    icon: {
        type: String,
        default: '',
        trim: true
    },
    name: {
        type: String,
        default: '',
        trim: true
    },
    generic: {
        type: String,
        default: '',
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    },
});

const Industries = mongoose.model('Industries', IndustriesSchema);

module.exports = Industries;
