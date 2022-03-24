const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InvoiceSchema = new mongoose.Schema({
	customer: {
		type: Schema.Types.ObjectId,
		ref: 'Clients',
		default: null
	},
	clientBillingInfo: {
		type: Schema.Types.ObjectId,
		default: null
	},
	status: {
		type: String,
		enum: [ 'Draft', 'Ready', 'Sent', 'Paid', 'Partially Paid', 'Overdue', 'Void' ],
		default: 'Draft'
	},
	items: [ {
		title: {
			type: String
		},
		type: {
			type: String,
			enum: [ 'Report', 'Custom' ]
		},
		reportId: {
			type: Schema.Types.ObjectId,
			ref: 'InvoicingClientReports',
			default: null
		},
		quantity: {
			type: Number,
			default: 0
		},
		rate: {
			type: Number,
			default: 0
		},
		vatAmount: {
			type: Number,
			default: 0
		},
		vatPercents: {
			type: Number,
			default: 0
		},
		discountsAmount: {
			type: Number,
			default: 0
		},
		discountsPercents: {
			type: Number,
			default: 0
		},
		surchargesAmount: {
			type: Number,
			default: 0
		},
		surchargesPercents: {
			type: Number,
			default: 0
		},
		amount: {
			type: Number,
			default: 0
		}
	} ],
	invoiceId: {
		type: String
	},
	createdAt: {
		type: Date,
		default: new Date()
	},
	dueDate: {
		type: Date,
		default: ''
	},
	invoicingDate: {
		type: Date,
		default: ''
	},
	terms: {
		type: Schema.Types.ObjectId,
		ref: 'PaymentTerms',
		default: null
	},
	accountManager: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null
	}


})

const Invoice = mongoose.model('Invoice', InvoiceSchema)

module.exports = Invoice