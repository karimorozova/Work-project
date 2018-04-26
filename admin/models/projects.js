const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

const ProjectsSchema = new mongoose.Schema({
  xtrfId: {
    type: String,
    default: ''
  },
  projectName: {
    type: String,
    default: ''
  },
  startDate: {
    type: String,
    default: ''
  },
  deadline: {
    type: String,
    default: ''
  },
  sourceLang: {
    type: String,
    default: ''
  },
  targetLang: {
    type: String,
    default: ''
  },
  service: {
    type: String,
    default: '',
  },
  vendorName: {
    type: String,
    default: '',
  },
  vendorService: {
    type: String,
    default: '',
  },
  vendorRate: {
    type: String,
    default: '',
  },
  vendorWordCount: {
    type: String,
    default: '',
  },
  vendorRelativeWordcount: {
    type: String,
    default: '',
  },
  vendorCost: {
    type: String,
    default: '',
  },
  clientName: {
    type: String,
    default: '',
  },
  clientRate: {
    type: String,
    default: '',
  },
  clientWordcount: {
    type: String,
    default: '',
  },
  clientSum1: {
    type: String,
    default: '',
  },
  clientSum2: {
    type: String,
    default: '',
  },
  clientSumRec: {
    type: String,
    default: '',
  },
  clientSumTotal: {
    type: String,
    default: '',
  },
  profit: {
    type: String,
    default : '',
  },
  profitPercentage: { 
    type: String,
    default : '',
  }
});

const Projects = mongoose.model('projects', ProjectsSchema);

module.exports = Projects;
