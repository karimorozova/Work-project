const mongoose = require('mongoose');

const IndustriesSchema = new mongoose.Schema({
    icon: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    crud: {
        type: Boolean,
        default: false
    },
    download: {
        type: String,
        default: ''
    },
    generic: {
        type: String,
        default: ''
    },
    active: {
        type: Boolean,
        default: true
    },
    rate: {
        type: Number,
        default: 0
    }
});

const Industries = mongoose.model('Industries', IndustriesSchema);

module.exports = Industries;