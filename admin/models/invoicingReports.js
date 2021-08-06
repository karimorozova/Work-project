const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvoicingReportsSchema = new mongoose.Schema({
	reportId: {
		type: String,
		default: '',
		trim: true
	},
	vendor: {
		type: Schema.Types.ObjectId,
		ref: 'vendor'
	},
	status: {
		type: String,
		default: '',
		trim: true
	},
	steps: [{
		type: Schema.Types.ObjectId,
	}],
	firstPaymentDate: {
		type: Date,
		default: new Date()
	},
	lastPaymentDate: {
		type: Date,
		default: new Date()
	},
	file: {
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
		type: Schema.Types.ObjectId, ref: 'user'
	},
	updatedAt: {
		type: Schema.Types.ObjectId, ref: 'user'
	}
});

const InvoicingReports = mongoose.model('InvoicingReports', InvoicingReportsSchema);

module.exports = InvoicingReports;