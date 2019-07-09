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
    isBriefApproved: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        default: ''
    },
    sourceFiles: {
        type: Array,
        default: [],
        trim: true
    },
    refFiles: {
        type: Array,
        default: [],
        trim: true
    },
    genBrief: {
        type: String,
        default: ""
    }
});

const ClientRequest = mongoose.model('ClientRequest', ClientRequestSchema);

module.exports = ClientRequest;