const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  deadline: {
    type: Date,
    default: Date.now
  },
  industry: {
    type: Schema.Types.ObjectId, ref: 'Industries',
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
  isMetricsExist: {
    type: Boolean,
    default: false
  },
  customer: {
    type: Schema.Types.ObjectId, ref: 'Clients',
  },
  projectManager: {
    type: String,
    default: '',
    trim: true
  },
  service: {
    type: Schema.Types.ObjectId, ref: 'Services',
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
  receivables: {
    type: String,
    default: ''
  },
  payables: {
    type: String,
    default: ''
  },
  roi: {
    type: String,
    default: ''
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