const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

const ReportSchema = new mongoose.Schema({
    projectId: {
        type: String,
        default: '',
        trim: true
    },
    projectName: {
        type: String,
        default: '',
        trim: true
    },
    beginDate: {
        type: String,
        default: '',
        trim: true
    },
    deadline: {
        type: String,
        default: '',
        trim: true
    },
    sourceLanguage: {
        type: String,
        default: '',
        trim: true
    },
    targetLanguage: {
        type: String,
        default: '',
        trim: true
    },
    projectService: {
        type: String,
        default: '',
        trim: true
    },
    commonJobId:{
        type: String,
        default: '',
        trim: true,
    },
    vendors:[{
        jobId: {
            type: String,
            default: '',
            trim: true
        },
        providerName: {
            type: String,
            default: '',
            trim: true
        },
        jobService: {
            type: String,
            default: '',
            trim: true
        },
        providerRate: {
            type: String,
            default: '',
            trim: true
        },
        wordcount: {
            type: String,
            default: '',
            trim: true
        },
        wordcountRelative: {
            type: String,
            default: '',
            trim: true
        },
        totalCost: {
            type: String,
            default: '',
            trim: true
        }
    }],    
    clientName: {
        type: String,
        default: '',
        trim: true
    },
    clientRate: {
        type: String,
        default: '',
        trim: true
    },
    wordcountReceivable: {
        type: String,
        default: '',
        trim: true
    },
    sumStep1: {
        type: String,
        default: '',
        trim: true
    },
    sumStep2: {
        type: String,
        default: '',
        trim: true
    },
    sum: {
        type: String,
        default: '',
        trim: true
    },
    totalAgreed: {
        type: String,
        default: '',
        trim: true
    },
    profit: {
        type: String,
        default: '',
        trim: true
    },
    profitPerc: {
        type: String,
        default: '',
        trim: true
    },
    instructions: {
        type: String,
        default: '',
        trim: true
    },
    invoiced: {
        type: String,
        default: '',
        trim: true
    }

});

const Reports = mongoose.model('Reports', ReportSchema);

module.exports = Reports;