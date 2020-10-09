const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MemoqProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
    trim: true
  },
  creatorUser: {
    type: String,
    default: '',
    trim: true
  },
  client: {
    type: String,
    default: '',
    trim: true
  },
  customer: {
    type: Schema.Types.ObjectId, ref: 'Clients'
  },
  clientContacts: [],
  creationTime: {
    type: Date,
    default: new Date(),
  },
  deadline: {
    type: Date,
    default: new Date(),
  },
  projectStatus: {
    type: String,
    default: '',
    trim: true
  },
  domain: {
    type: String,
    default: '',
    trim: true
  },
  serverProjectGuid: {
    type: String,
    default: '',
    trim: true
  },
  sourceLanguage: {
    type: Object,
    default: {}
  },
  targetLanguages: {
    type: Array,
    default: []
  },
  totalWordCount: {
    type: String,
    default: '',
    trim: true
  },
  documents: {
    type: Array,
    default: []
  },
  users: {
    type: Array,
    default: []
  },
  isTest: {
    type: Boolean,
    default: false
  },
  tasks: {
    type: Array,
    default: [],
  },
  steps: {
    type: Array,
    default: []
  },
  projectManager: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  accountManager: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  finance: {},
  billingDate: {
    type: Date,
  },
});

const MemoqProject = mongoose.model('MemoqProject', MemoqProjectSchema);

module.exports = MemoqProject;
