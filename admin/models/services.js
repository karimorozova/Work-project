const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServicesSchema = new mongoose.Schema({
    title: {
        type: String,
        default: '',
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    },
    languageForm: {
        type: String,
        default: 'Duo',
        trim: true
    },
    steps: [{
        step: { type: Schema.Types.ObjectId, ref: 'Step' }
    }],
});

const Services = mongoose.model('Services', ServicesSchema);

module.exports = Services;
