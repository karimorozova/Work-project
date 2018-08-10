const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

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
    source: {
        type: Boolean,
        default: false
    },
    languages: {
        type: Array,
        default: []
    },
    languageCombinations: {
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