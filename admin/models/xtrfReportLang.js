const mongoose = require('mongoose');

const XtrfReportLangSchema = new mongoose.Schema({
    lang: { 
        type : String,
        default: "",
        trim: true
    }
});

const XtrfReportLang = mongoose.model('XtrfReportLang', XtrfReportLangSchema);

module.exports = XtrfReportLang;