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
		tax: {
			type: Number,
			default: 0
		},
    taxType: {
      type: String,
      enum: ['Percent', 'Currency'],
      default: 'Percent'
    },
		discount: {
			type: Number,
			default: 0
		},
    discountType: {
      type: String,
      enum: ['Percent', 'Currency'],
      default: 'Percent'
    },
		amount: {
			type: Number,
			default: 0
		}
	} ],
	invoiceId: {
		type: String
	},
	invoiceFile: {
		path: {
			type: String,
		},
		fileName: {
			type: String,
		}
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
