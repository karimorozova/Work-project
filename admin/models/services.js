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
        default: ''
    },
    formType: {
        type: String,
        default: '' 
    },
    icon: {
        type: String,
        default: ''
    },
    active: {
        type: Boolean,
        default: true
    },
    crud: {
        type: Boolean,
        default: false
    },
    languageForm: {
        type: String,
        default: 'Mono'
    },
    calculationUnit: {
        type: String,
        default: 'Words'
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
    },
    projectType: {
        type: String,
        default: "regular",
    },
    createdAt: {
        type: Date,
        default: Date.now
    }    
});

const Services = mongoose.model('Services', ServicesSchema);

module.exports = Services;