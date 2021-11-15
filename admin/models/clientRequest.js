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
	clientBillingInfo: {
		type: Schema.Types.ObjectId,
		ref: 'Clients.billingInfo',
		default: null
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
	createdBy: {
		type: Object
	},
	industry: {
		type: Schema.Types.ObjectId, ref: 'Industries'
	},
	tasksAndSteps: [ {
		taskId: {
			type: String,
			default: '',
			trim: true
		},
		taskData: {
			type: Object,
			default: {}
		},
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
			}
		} ]
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
	instructions: {
		type: JSON,
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
		},
	}
})

const ClientRequest = mongoose.model('ClientRequest', ClientRequestSchema)

module.exports = ClientRequest
