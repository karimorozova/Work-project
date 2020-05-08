const mongoose = require('mongoose');

const MemoqProjectSchema = new mongoose.Schema({
    name: { 
        type : String, 
        default : '', 
        trim : true 
    },
    creatorUser: {
        type : String, 
        default : '', 
        trim : true 
    },
    client: { 
        type : String, 
        default : '', 
        trim : true 
    },
    creationTime: {
        type : Date, 
        default : new Date(),
    },
    deadline: {
        type : Date, 
        default : new Date(), 
    },
    domain: {
        type : String, 
        default : '', 
        trim : true 
    },
    serverProjectGuid: {
        type : String, 
        default : '', 
        trim : true 
    },
    sourceLanguage: {
        type : Object, 
        default : {} 
    },
    targetLanguages: {
        type : Array, 
        default : [] 
    },
    totalWordCount: {
        type : String, 
        default : '', 
        trim : true 
    },
    documents: {
        type : Array, 
        default : []
    },
    users: {
        type : Array, 
        default : []
    }
});

const MemoqProject = mongoose.model('MemoqProject', MemoqProjectSchema);

module.exports = MemoqProject;