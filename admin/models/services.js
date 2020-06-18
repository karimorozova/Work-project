const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServicesSchema = new mongoose.Schema({
    sortIndex: {
        type: Number,
        default: 100,
    },
    title: {
        type: String,
        default: '',
        trim: true
    },
    symbol: {
        type: String,
        default: '',
        trim: true
    },
    formType: {
        type: String,
        default: '',
        trim: true
    },
    icon: {
        type: String,
        default: '',
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    },
    isRequestQuote: {
        type: Boolean,
        default: false
    },
    crud: {
        type: Boolean,
        default: false
    },
    calculationUnit: {
        type: Array,
        default: [],
    },
    languageForm: {
        type: String,
        default: 'Duo',
        trim: true
    },
    steps: [{
        stage: {
            type: String,
            trim: true
        },
        step: { type: Schema.Types.ObjectId, ref: 'Step' }
    }],
    source: {
        type: Boolean,
        default: false
    },
    languages: {
        type: Array,
        default: []
    },
    xtrf: {
        type: String,
        default: '',
        trim: true
    },
    projectType: {
        type: String,
        default: "regular",
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Services = mongoose.model('Services', ServicesSchema);

module.exports = Services;
