const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ZohoReportSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    grade: "",
    percent: Number,
    leads: Number,
    calls: Number,
    communications: Number,
    meetings: Number,
    notes: "",
    isUserAvailable: {
        type: Boolean,
        default: true
    },
    user: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
},{ minimize: false, strict: false });

const ZohoReport = mongoose.model('ZohoReport', ZohoReportSchema);

module.exports = ZohoReport;