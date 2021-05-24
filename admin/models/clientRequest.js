const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ClientRequestSchema = new mongoose.Schema({
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
	startDate: {
		type: Date,
		default: Date.now
	},
	deadline: {
		type: Date,
		default: Date.now
	},
	billingDate: {
		type: Date
	},
	industry: {
		type: Schema.Types.ObjectId, ref: 'Industries'
	},
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
		vendorsClickedOffer: Array,
		isVendorRead: { type: Boolean, default: false },
		previousStatus: ""
	} ],
	customer: {
		type: Schema.Types.ObjectId, ref: 'Clients'
	},
	projectManager: {
		type: Schema.Types.ObjectId, ref: 'User'
	},
	accountManager: {
		type: Schema.Types.ObjectId, ref: 'User'
	},
	status: {
		type: String,
		default: '',
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
	requestForm: {
		sourceLanguage: {
			type: Schema.Types.ObjectId, ref: 'Language'
		},
		targetLanguages: [ {
			type: Schema.Types.ObjectId, ref: 'Language'
		} ],
		sourceFiles: [ {
			filename: {
				type: String,
				default: '',
				trim: true
			},
			path: {
				type: String,
				default: '',
				trim: true
			},
			isCheck: {
				type: Boolean,
				default: false
			}
		} ],
		refFiles: [ {
			filename: {
				type: String,
				default: '',
				trim: true
			},
			path: {
				type: String,
				default: '',
				trim: true
			},
			isCheck: {
				type: Boolean,
				default: false
			}
		} ],
		startOption: {
			type: String,
			default: '',
			trim: true
		},
		service: {
			type: Schema.Types.ObjectId, ref: 'Services'
		},
		complianceOptions: {
			type: Object,
			default: {}
		}
	},
	checkedForm: {
		isCheckProjectName: {
			type: Boolean,
			default: false
		},
		isCheckDeadline: {
			type: Boolean,
			default: false
		},
		isCheckBrief: {
			type: Boolean,
			default: false
		}
	}

	//  type: {
	//      type: String,
	//      default: '',
	//      trim: true
	//  },
	//  projectName: {
	//      type: String,
	//      default: '',
	//      trim: true
	//  },
	//  clientProjectNumber: {
	//      type: String,
	//      default: '',
	//      trim: true
	//  },
	//  startDate: {
	//      type: Date,
	//      default: Date.now
	//  },
	//  deadline: {
	//      type: Date,
	//      default: Date.now
	//  },
	//  isDeadlineApproved: {
	//      type: Boolean,
	//      default: false
	//  },
	//  industry: {
	//      type: Schema.Types.ObjectId, ref: 'Industries'
	//  },
	//  service: {
	//      type: Schema.Types.ObjectId, ref: 'Services'
	//  },
	//  status: {
	//      type: String,
	//      default: '',
	//      trim: true
	//  },
	//  isAssigned: {
	//      type: Boolean,
	//      default: false
	//  },
	//  accountManager: {
	//      type: Schema.Types.ObjectId, ref: 'User'
	//  },
	//  projectManager: {
	//      type: Schema.Types.ObjectId, ref: 'User'
	//  },
	//  salesManager: {
	//      type: Schema.Types.ObjectId, ref: 'User'
	//  },
	//  customer: {
	//      type: Schema.Types.ObjectId, ref: 'Clients'
	//  },
	//  sourceLanguage: {
	//      type: Object,
	//      default: null
	//  },
	//  targetLanguages: {
	//      type: Array,
	//      default: []
	//  },
	//  packageSize: {
	//      type: Object,
	//      default: null
	//  },
	//  brief: {
	//      type: String,
	//      default: '',
	//      trim: true
	//  },
	//  isBriefApproved: {
	//      type: Boolean,
	//      default: false
	//  },
	//  notes: {
	//      type: String,
	//      default: '',
	//      trim: true
	//  },
	//  tones: {
	//      type: Array,
	//      default: []
	//  },
	//  sourceFiles: {
	//      type: Array,
	//      default: []
	//  },
	//  refFiles: {
	//      type: Array,
	//      default: []
	//  },
	//  genBrief: {
	//      type: Object,
	//      default: null
	//  },
	//  structure: {
	//      type: String,
	//      default: '',
	//      trim: true
	//  },
	//  style: {
	//      type: String,
	//      default: '',
	//      trim: true
	//  },
	//  designs: {
	//      type: Array,
	//      default: []
	//  },
	//  seo: {
	//      type: Array,
	//      default: []
	//  }
})

const ClientRequest = mongoose.model('ClientRequest', ClientRequestSchema)

module.exports = ClientRequest
