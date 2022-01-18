const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InvoicingReceivablesArchiveSchema = new mongoose.Schema({
	reportId: {
		type: String,
		default: '',
		trim: true
	},
	client: {
		type: Schema.Types.ObjectId,
		ref: 'Clients'
	},
	status: {
		type: String,
		default: '',
		trim: true
	},
	clientBillingInfo: {
		type: Schema.Types.ObjectId,
		ref: 'Clients.billingInfo',
		default: null
	},
	stepsAndProjects: [ {
		project: {
			type: Schema.Types.ObjectId,
			ref: 'Projects'
		},
		step: {
			type: Schema.Types.ObjectId,
			ref: 'Projects.steps'
		},
		type: {
			type: String,
			default: ''
		}
	} ],
	firstPaymentDate: {
		type: Date,
		default: new Date()
	},
	lastPaymentDate: {
		type: Date,
		default: new Date()
	},
	createdBy: {
		type: Schema.Types.ObjectId, ref: 'user',
		default: null
	},
	updatedBy: {
		type: Schema.Types.ObjectId, ref: 'user',
		default: null
	},
	createAt: {
		type: Date,
		default: new Date()
	},
	updatedAt: {
		type: Date,
		default: new Date()
	},
	invoice: {
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
	},
	reportFiles: [ {
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
	paymentInformation: [ {
		zohoPaymentId: {
			type: String
		},
		paidAmount: {
			type: Number
		},
		unpaidAmount: {
			type: Number
		},
		paymentMethod: {
			type: Object,
			default: null
		},
		paymentDate: {
			type: Date,
			default: ''
		},
		notes: {
			type: String,
			default: ""
		}
	} ],
	externalIntegration: {
		_id: {
			type: String,
			trim: true,
			default: ''
		},
		reportId: {
			type: String,
			trim: true,
			default: ''
		}
	}
})

const InvoicingReceivablesArchive = mongoose.model('InvoicingReceivablesArchive', InvoicingReceivablesArchiveSchema)

module.exports = InvoicingReceivablesArchive