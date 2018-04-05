const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

const RequestSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    contactName: {
        type: String,
        default: '',
        trim: true
    },
    industry: {
        type: String,
        default: '',
        trim: true
    },
    contactEmail: {
        type: String,
        default: '',
        trim: true
    },
    web: {
        type: String,
        default: '',
        trim: true
    },
    skype: {
        type: String,
        default: '',
        trim: true
    },
    phone: {
        type: String,
        default: '',
        trim: true
    },
    service: {
        type: Object,
        default: null,
        trim: true
    },
    industry: {
        type: String,
        default: '',
        trim: true
    },
    status: {
        type: String,
        default: '',
        trim: true
    },
    accountManager: {
        type: String,
        default: 'Non selected',
        trim: true
    },
    companyName: {
        type: String,
        default: '',
        trim: true
    },
    sourceLanguage: {
        type: Object,
        default: null,
        trim: true
    },
    targetLanguages: {
        type: Array,
        default: [],
        trim: true
    },
    brief: {
        type: String,
        default: ''
    },
    detailFiles: {
        type: String,
        default: ''
    },
    refFiles: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Requests = mongoose.model('Requests', RequestSchema);

module.exports = Requests;