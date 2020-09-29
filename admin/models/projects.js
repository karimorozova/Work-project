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
  isUrgent: {
    type: Boolean,
    default: false
  },
  clientContacts: [],
  paymentProfile: {
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
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendors' },
    stepId: "",
    taskId: "",
    serviceStep: {
      step: { type: Schema.Types.ObjectId, ref: 'Step' },
      unit: { type: Schema.Types.ObjectId, ref: 'Units' },
      size: {
        type: Number,
        default: 1
      },
      memoqAssignmentRole: {
        type: Number,
      },
      title: {
        type: String,
        trim: true,
      }
    },
    name: "",
    sourceLanguage: "",
    targetLanguage: "",
    memoqProjectId: "",
    memoqSource: "",
    memoqTarget: "",
    memoqDocIds: [],
    packageSize: "",
    hours: "",
    quantity: "",
    size: {
      type: Number,
      default: 1
    },
    totalWords: "",
    start: {},
    deadline: {},
    progress: "",
    status: "",
    clientRate: {},
    // clientDiscount: "",
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
    // vendorDiscount: "",
    check: false,
    vendorsClickedOffer: Array,
    isVendorRead: { type: Boolean, default: false },
    previousStatus: "",
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
  isPriceUpdated: {
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
  reason: {
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
  billingDate: {
    type: Date,
  },
  deliverables: {
    type: String,
    default: "",
    trim: true
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
  },
  isTest: {
    type: Boolean,
    default: false
  }
}, { minimize: false, strict: false });

const Projects = mongoose.model('Projects', ProjectsSchema);

module.exports = Projects;
