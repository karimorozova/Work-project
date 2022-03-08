const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InvoicingReceivablesReportsSchema = new mongoose.Schema({
	reportId: {
		type: String,
		default: '',
		trim: true
	},
	invoice: {
		type: Schema.Types.ObjectId,
		ref: 'Invoice',
		default: null
	},
	client: {
		type: Schema.Types.ObjectId,
		ref: 'Clients',
		default: null
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
	total: {
		type: Number,
		default: 0
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	updatedBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	createdAt: {
		type: Date,
		default: new Date()
	},
	updatedAt: {
		type: Date,
		default: new Date()
	}
})

const InvoicingReceivables_old = mongoose.model('InvoicingClientReports', InvoicingReceivablesReportsSchema)

module.exports = InvoicingReceivables_old