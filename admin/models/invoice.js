const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InvoiceSchema = new mongoose.Schema({
	customer: {
		type: Schema.Types.ObjectId,
		ref: 'Clients',
		default: null,
	},
	clientBillingInfo: {
		type: Schema.Types.ObjectId,
		default: null,
	},
	status: {
		type: String,
		enum: [ 'Draft', 'Ready', 'Sent', 'Paid', 'Partially Paid', 'Overdue', 'Void' ],
		default: 'Draft'
	},
	items: [{
		title: {
			type: String,
		},
		amount: {
			type: Number,
		},

		type:{
			type: String,
			enum: [ 'Report', 'Custom' ],
		},
		reportId: {
			type: Schema.Types.ObjectId,
			default: null,
		},
		quantity: {
			type: Number,
		},
		rate: {
			type: Number,
		},
		tax: {
			type: Number,
		},


		vat: {
			type: String,
		},
		discount: {
			amount: {
				type: Number,
			},
			type: {
				type: String,
				enum: [ 'Percent', 'Valet' ],
			}
		},
	}],
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
		type: String,
	},
	accountManager: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null,
	}



})

const Invoice = mongoose.model('Invoice', InvoiceSchema)

module.exports = Invoice