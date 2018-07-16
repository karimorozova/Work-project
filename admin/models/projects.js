const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  date: {
    type: String,
    default: '',
    trim: true
  },
  industry: {
    type: String,
    default: '',
    trim: true
  },
  jobs: {
    type: Array,
    default: []
  },
  customer: {
    type: String,
    default: '',
    trim: true
  },
  service: {
    type: String,
    default: '',
    trim: true
  },
  status: {
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
    type: Array,
    default: [],
    trim: true
  },
  refFiles: {
    type: Array,
    default: [],
    trim: true
  },
  jsession: {
    type: String,
    default: ""
  },
  genBrief: {
    type: String,
    default: ""
  }
});

const Projects = mongoose.model('Projects', RequestSchema);

module.exports = Projects;