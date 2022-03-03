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
	// createdBy: {
	// 	type: Schema.Types.ObjectId, ref: 'user',
	// 	default: null
	// },
	// updatedBy: {
	// 	type: Schema.Types.ObjectId, ref: 'user',
	// 	default: null
	// },
	// createAt: {
	// 	type: Date,
	// 	default: new Date()
	// },
	// updatedAt: {
	// 	type: Date,
	// 	default: new Date()
	// },
})

const InvoicingReceivables_old = mongoose.model('InvoicingReceivables', InvoicingReceivablesSchema)

module.exports = InvoicingReceivables_old