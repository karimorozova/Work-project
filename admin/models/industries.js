const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IndustriesSchema = new mongoose.Schema({
    icon: {
        type: String,
        default: ''
    },
    name: {
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
    },
    package: {
        type: Number,
        default: 200,
    }
});

const Industries = mongoose.model('Industries', IndustriesSchema);

module.exports = Industries;