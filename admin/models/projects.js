const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectsSchema = new mongoose.Schema({
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
  clientProjectNumber: {
    type: String,
    default: '',
    trim: true
  },
  startDate: {
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
  tasks: {
    type: Array,
    default: []
  },
  steps: [{
    vendor: {type: Schema.Types.ObjectId, ref: 'Vendors'},
    stepId: "",
    taskId: "",
    serviceStep: {},
    name: "",
    catName: "",
    sourceLanguage: "",
    targetLanguage: "",
    memoqProjectId: "",
    memoqSource: "",
    memoqTarget: "",
    memoqDocIds: [],
    packageSize: "",
    hours: "",
    quantity: "",
    totalWords: "",
    start: {},
    deadline: {},
    progress: "",
    status: "",
    clientRate: "",
    clientDiscount: "",
    targetFile: "",
    finance: {
      'Wordcount': {
        receivables: "", 
        payables: "",
        halfReceivables: "", 
        halfPayables: "",
      },
      'Price': {
        receivables: "", 
        payables: "",
        halfReceivables: "", 
        halfPayables: "",
      }
    },
    vendorRate: "",
    vendorDiscount: "",
    check: false,
    vendorsClickedOffer: Array,
    isVendorRead: {type: Boolean, default: false}
  }],
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
    type: Schema.Types.ObjectId, ref: 'Clients'
  },
  projectManager: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  accountManager: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  service: {
    type: Schema.Types.ObjectId, ref: 'Services'
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
  sourceFiles: {
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
    type: String | Object,
    default: ""
  },
  isClientOfferClicked: {
    type: Boolean,
    default: false
  },
  finance: {
    type: Object,
    default: {
      'Wordcount': {},
      'Price': {}
    }
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  isAutoDelivery: {
    type: Boolean,
    default: false
  },
  isStartAccepted: {
    type: Boolean,
    default: false
  },
  isInvoice: {
    type: Boolean,
    default: false
  } 
},{ minimize: false, strict: false });

const Projects = mongoose.model('Projects', ProjectsSchema);

module.exports = Projects;