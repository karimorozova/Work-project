const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InvoicingReceivablesSchema = new mongoose.Schema({
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
		type: Schema.Types.ObjectId, ref: 'user'
	},
	updatedBy: {
		type: Schema.Types.ObjectId, ref: 'user'
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
	paymentInformation: [{
		paidAmount: {
			type: Number,
		},
		unpaidAmount: {
			type: Number
		},
		// paymentMethod: {
		// 	type: String,
		// },
		paymentDate: {
			type: Date,
			default: ''
		},
		notes: {
			type: String,
			default: ""
		}
	}],
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

const InvoicingReceivables = mongoose.model('InvoicingReceivables', InvoicingReceivablesSchema)

module.exports = InvoicingReceivables