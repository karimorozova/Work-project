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
		default: null
	},
	lastPaymentDate: {
		type: Date,
		default: null
	},
	createdBy: {
		type: Schema.Types.ObjectId, ref: 'user'
	},
	updatedBy: {
		type: Schema.Types.ObjectId, ref: 'user'
	},
	createAt: {
		type: Date,
		default: null
	},
	updatedAt: {
		type: Date,
		default: null
	}
})

const InvoicingReceivables = mongoose.model('InvoicingReceivables', InvoicingReceivablesSchema)

module.exports = InvoicingReceivables