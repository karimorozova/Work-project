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
	clientBillingInfo: {
		type: Schema.Types.ObjectId,
		ref: 'Clients.billingInfo',
		default: null
	},
	status: {
		type: String,
		default: '',
		trim: true
	},
	tasks: [ {
		taskId: {
			type: String,
			trim: true
		},
		projectId: {
			type: String,
			trim: true
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
		default: null
	},
	updatedAt: {
		type: Date,
		default: null
	}
})

const InvoicingReceivables = mongoose.model('InvoicingReceivables', InvoicingReceivablesSchema)

module.exports = InvoicingReceivables