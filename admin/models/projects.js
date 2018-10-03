const mongoose = require('mongoose');

const ProjectsSchema = new mongoose.Schema({
  projectId: {
    type: String,
    default: '',
    trim: true
  },
  xtmId: {
    type: Number,
    default: 0
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
    type: Date,
    default: Date.now
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
  tasks: {
    type: Array,
    default: []
  },
  totalCost: {
    type: String,
    default: '',
    trim: true
  },
  metrics: {
    type: Boolean,
    default: false
  },
  customer: {
    type: String,
    default: '',
    trim: true
  },
  projectManager: {
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
    default: {},
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
  notes: {
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

const Projects = mongoose.model('Projects', ProjectsSchema);

module.exports = Projects;