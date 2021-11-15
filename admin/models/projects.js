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

const financeExtract = {
	receivables: { type: Number },
	payables: { type: Number },
	halfReceivables: { type: Number },
	halfPayables: { type: Number }
}

const stepFinance = {
	'Quantity': financeExtract,
	'Wordcount': financeExtract,
	'Price': financeExtract
}

const ProjectsSchema = new mongoose.Schema({
	projectId: {
		type: String,
		default: '',
		trim: true
	},
	requestId: {
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
	clientBillingInfo: {
		type: Schema.Types.ObjectId,
		ref: 'Clients.billingInfo',
		default: null
	},
	startDate: {
		type: Date,
		default: Date.now
	},
	deadline: {
		type: Date,
		default: Date.now
	},
	createdBy: {
		type: Object,
		default: {}
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
	tasksDR1: [ {
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
			default: ''
		},
		instructions: {
			type: Array,
			default: []
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
		]
	} ],
	tasksDR2: {
		singleLang: [ {
			deliveryInternalId: {
				type: String,
				default: '',
				trim: true
			},
			deliveryName: {
				type: String,
				trim: true,
				default: ''
			},
			status: {
				type: String,
				default: ''
			},
			timestamp: {
				type: Date,
				default: ''
			},
			instructions: {
				type: Array,
				default: []
			},
			comment: {
				type: String,
				default: ''
			},
			sourceLanguage: { type: Schema.Types.ObjectId, ref: 'Language' },
			targetLanguage: { type: Schema.Types.ObjectId, ref: 'Language' },
			files: [ {
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
				}
			} ]
		} ],
		multiLang: [ {
			deliveryInternalId: {
				type: String,
				default: '',
				trim: true
			},
			deliveryName: {
				type: String,
				trim: true,
				default: ''
			},
			status: {
				type: String,
				default: ''
			},
			comment: {
				type: String,
				default: ''
			},
			tasks: [ { type: String } ],
			instructions: {
				type: Array,
				default: []
			},
			timestamp: {
				type: Date,
				default: ""
			},
			file: [ {
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
				}
			} ]
		} ]
	},
	tasksDeliverables: [ {
		deliverablesId: {
			type: String
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
	} ],
	tasks: [ {
		projectId: { type: String, trim: true },
		taskId: { type: String, trim: true },
		service: { type: Schema.Types.ObjectId, ref: 'Services' },
		stepsAndUnits: [],
		memoqProjectId: "",
		memoqSource: "",
		memoqTarget: "",
		sourceLanguage: "",
		targetLanguage: "",
		fullSourceLanguage: { type: Schema.Types.ObjectId, ref: 'Language' },
		fullTargetLanguage: { type: Schema.Types.ObjectId, ref: 'Language' },
		memoqDocs: [],
		memoqFiles: [],
		status: {
			type: String,
			enum: [ 'Created', 'Approved', 'Rejected', 'Quote Sent', 'In progress', 'Pending Approval [DR1]', 'Completed', 'Cancelled', 'Cancelled Halfway' ],
			default: 'Created'
		},
		sourceFiles: [],
		refFiles: [],
		targetFiles: [],
		targetFilesStages: [],
		metrics: {}
	} ],
	steps: [ {
		projectId: { type: String, trim: true },
		stepNumber: { type: Number },
		vendor: { type: Schema.Types.ObjectId, ref: 'Vendors' },
		stepId: { type: String, trim: true },
		taskId: { type: String, trim: true },
		service: { type: Schema.Types.ObjectId, ref: 'Services' },
		step: { type: Schema.Types.ObjectId, ref: 'Step' },
		receivablesUnit: { type: Schema.Types.ObjectId, ref: 'Units' },
		payablesUnit: { type: Schema.Types.ObjectId, ref: 'Units' },
		sourceLanguage: "",
		targetLanguage: "",
		fullSourceLanguage: { type: Schema.Types.ObjectId, ref: 'Language' },
		fullTargetLanguage: { type: Schema.Types.ObjectId, ref: 'Language' },
		memoqProjectId: "",
		memoqSource: "",
		memoqTarget: "",
		memoqDocIds: [],
		totalWords: { type: Number },
		start: {},
		deadline: {},
		progress: "",
		status: {
			type: String,
			enum: [ 'Created', 'Approved', 'Rejected', 'Request Sent', 'Ready to Start', 'Waiting to Start', 'In progress', 'Completed', 'Cancelled', 'Cancelled Halfway' ],
			default: 'Created'
		},
		finance: stepFinance,
		nativeFinance: stepFinance,
		defaultStepPrice: 0,
		clientRate: { type: Number },
		vendorRate: { type: Number },
		nativeVendorRate: { type: Number },
		vendorsClickedOffer: [],
		isVendorRead: { type: Boolean, default: false },
		isInReportPayables: { type: Boolean, default: false },
		isInReportReceivables: { type: Boolean, default: false },
		stepAndUnit: {},
		memoqAssignmentRole: { type: Number }
	} ],
	additionsSteps: [ {
		projectId: { type: String, trim: true },
		taskId: { type: String, trim: true },
		title: { type: String, trim: true },
		isInReportPayables: { type: Boolean, default: false },
		finance: {
			Price: {
				receivables: { type: Number }
			}
		}
	} ],
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

	status: {
		type: String,
		enum: [ 'Draft', 'Cost Quote', 'Quote sent', 'Approved', 'Rejected', 'In progress', 'In progress', 'Closed' ],
		default: 'Draft'
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
			'Price': {
				'receivables': 0,
				'payables': 0
			}
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
		},
		isUsed: {
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
	isSendToXtrf: {
		type: Boolean,
		default: false
	},
	xtrfLink: {
		type: String,
		default: ''
	},
	xtrfLinks: {
		type: Array,
		default: []
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
