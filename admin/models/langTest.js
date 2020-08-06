const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LangTestSchema = new mongoose.Schema({
    evaluationName: {
        type: String,
        default: '',
        trim: true
    },
    evaluationType: {
        type: String,
        default: '',
        trim: true
    },
    languageType: {
        type: String,
        default: '',
        trim: true
    },
    source: {
        type: Schema.Types.ObjectId, ref: 'Language'
    },
    targets: [{
        type: Schema.Types.ObjectId, ref: 'Language'
    }],
    fileName: {
        type: String,
        default: '',
        trim: true
    },
    path: {
        type: String,
        default: '',
        trim: true
    },
    uploadDate: {
        type: Date,
        default: new Date()
    },
    industries: [{
        type: Schema.Types.ObjectId, ref: 'Industries'
    }],
    steps: [{
        type: Schema.Types.ObjectId, ref: 'Step'
    }]
});

const LangTest = mongoose.model('LangTest', LangTestSchema);

module.exports = LangTest;