const mongoose = require('mongoose')
const Schema = mongoose.Schema

const USD = {
	type: Number,
	default: 0
}
const EUR = {
	type: Number,
	default: 0
}
const GBP = {
	type: Number,
	default: 0
}
const stepFinance = {
	'Wordcount': {
		receivables: "",
		payables: "",
		halfReceivables: "",
		halfPayables: ""
	},
	'Price': {
		receivables: "",
		payables: "",
		halfReceivables: "",
		halfPayables: ""
	}
}

const ProjectsSchema = new mongoose.Schema({
	projectId: {
		type: String,
		default: '',
		trim: true
	},
	requestId:{
		type: Schema.Types.ObjectId, ref: 'ClientRequest',
		default: null
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
	discounts: [ {
		name: {
			type: String,
			trim: true,
			required: true
		},
		value: {
			type: Number,
			required: true
		}
	} ],
	industry: {
		type: Schema.Types.ObjectId, ref: 'Industries'
	},
  tasksDR1: [{
    timestamp: {
      type: Date,
      default: ""
    },
    dr1Manager: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    dr2Manager: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    comment: {
      type: String,
      default: '',
    },
    // status: {
    //   type: String,
    //   default: "Started",
    //   trim: true
    // },
    instructions: {
      type: Array,
      default: [],
    },
    taskId: {
      type: String,
      default: "",
      trim: true
    },
    files: [
      {
        fileName: {
          type: String,
          default: "",
          trim: true
        },
        path: {
          type: String,
          default: "",
          trim: true
        },
        isFileApproved: {
          type: Boolean,
          default: false
        },
        isFilePushedDR2: {
          type: Boolean,
          default: false
        }
      }
    ],
  }],
  tasksDR2: {
    singleLang: [{
	    deliveryInternalId:{
		    type: String,
		    default: '',
		    trim: true
	    },
      status: {
        type: String,
        default: '',
      },
      timestamp: {
        type: Date,
        default: '',
      },
      instructions: {
        type: Array,
        default: [],
      },
      comment: {
        type: String,
        default: '',
      },
      sourceLanguage: {
        type: Schema.Types.ObjectId,
        ref: 'Language'
      },
      targetLanguage: {
        type: Schema.Types.ObjectId,
        ref: 'Language'
      },
      files: [{
        fileName: {
          type: String,
          default: "",
          trim: true
        },
        path: {
          type: String,
          default: "",
          trim: true
        },
        isFileApproved: {
          type: Boolean,
          default: false
        },
        taskId: {
          type: String,
          default: "",
          trim: true
        },
        dr1Manager: {
          type: Schema.Types.ObjectId,
          ref: "User"
        },
        dr2Manager: {
          type: Schema.Types.ObjectId,
          ref: "User"
        },
      }]
    }],
    multiLang: [{
	    deliveryInternalId:{
		    type: String,
		    default: '',
		    trim: true
	    },
      status: {
        type: String,
        default: '',
      },
      comment: {
        type: String,
        default: '',
      },
      tasks: [{type: String}],
      instructions: {
        type: Array,
        default: [],
      },
      timestamp: {
        type: Date,
        default: ""
      },
      file: {
        fileName: {
          type: String,
          default: "",
          trim: true
        },
        path: {
          type: String,
          default: "",
          trim: true
        },
        isFileApproved: {
          type: Boolean,
          default: false
        },
        dr1Manager: {
          type: Schema.Types.ObjectId,
          ref: "User"
        },
        dr2Manager: {
          type: Schema.Types.ObjectId,
          ref: "User"
        },
      }
    }],
  },
  tasksDeliverables: [{
    deliverablesId: {
      type: String,
    },
    path: {
      type: String,
      default: "",
      trim: true
    },
    deliveredAt: {
      type: Date,
      default: new Date()
    },
    deliveredBy: {
      type: Schema.Types.ObjectId, ref: 'User'
    }
  }],
	tasks: {
		type: Array,
		default: []
	},
	steps: [ {
		vendor: { type: Schema.Types.ObjectId, ref: 'Vendors' },
		stepId: '',
		taskId: "",
		serviceStep: {
			step: { type: Schema.Types.ObjectId, ref: 'Step' },
			unit: { type: Schema.Types.ObjectId, ref: 'Units' },
			size: {
				type: Number,
				default: 1
			},
			memoqAssignmentRole: {
				type: Number
			},
			title: {
				type: String,
				trim: true
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
		targetFile: "",
		finance: stepFinance,
		nativeFinance: stepFinance,
		defaultStepPrice: 0,
		vendorRate: "",
		nativeVendorRate: "",
		// check: false,
		vendorsClickedOffer: Array,
		isVendorRead: { type: Boolean, default: false },
		previousStatus: ""
	} ],
	// TODO: refactoring
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
	isInLQAReports: {
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
// TODO: refactoring
	service: {
		type: Schema.Types.ObjectId, ref: 'Services'
	},
	status: {
		type: String,
		default: '',
		trim: true
	},
	// TODO: refactoring
	sourceLanguage: {
		type: Object,
		default: {},
		trim: true
	},
	// TODO: refactoring
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
	// TODO: refactoring
	sourceFiles: {
		type: Array,
		default: [],
		trim: true
	},
	// TODO: refactoring
	refFiles: {
		type: Array,
		default: [],
		trim: true
	},
	billingDate: {
		type: Date
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
	minimumCharge: {
		value: {
			type: Number,
			default: 0
		},
		toIgnore: {
			type: Boolean,
			default: false
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
	},
	projectCurrency: {
		type: String,
		default: ''
	},
	crossRate: {
		EUR: {
			EUR,
			USD,
			GBP
		},
		USD: {
			USD,
			EUR,
			GBP
		},
		GBP: {
			GBP,
			USD,
			EUR
		}
	}
}, { minimize: false, strict: false })

const Projects = mongoose.model('Projects', ProjectsSchema)

module.exports = Projects
