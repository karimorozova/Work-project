const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientRequestSchema = new mongoose.Schema({
   requestId: {
        type: String,
        default: '',
        trim: true
    },
    type: {
        type: String,
        default: '',
        trim: true
    },
    projectName: {
        type: String,
        default: '',
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    deadline: {
        type: Date,
        default: Date.now
    },
    isDeadlineApproved: {
        type: Boolean,
        default: false
    },
    industry: {
        type: Schema.Types.ObjectId, ref: 'Industries'
    },
    service: {
        type: Schema.Types.ObjectId, ref: 'Services'
    },
    status: {
        type: String,
        default: '',
        trim: true
    },
    accountManager: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    projectManager: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    customer: {
        type: Schema.Types.ObjectId, ref: 'Clients'
    },
    sourceLanguage: {
        type: Object,
        default: null
    },
    targetLanguages: {
        type: Array,
        default: []
    },
    packageSize: {
        type: Object,
        default: null
    },
    brief: {
        type: String,
        default: '',
        trim: true
    },
    isBriefApproved: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        default: '',
        trim: true
    },
    tones: {
        type: Array,
        default: []
    },
    sourceFiles: {
        type: Array,
        default: []
    },
    refFiles: {
        type: Array,
        default: []
    },
    genBrief: {
        type: Object,
        default: null
    },
    structure: {
        type: String,
        default: '',
        trim: true
    },
    style: {
        type: String,
        default: '',
        trim: true
    },
    designs: {
        type: Array,
        default: []
    },
    seo: {
        type: Array,
        default: []
    }
});

const ClientRequest = mongoose.model('ClientRequest', ClientRequestSchema);

module.exports = ClientRequest;