const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = new Schema({
	logo: {
		type: String,
		trim: true,
	},
	companyName: {
		type: String,
		trim: true,
		required: true
	},
	officialCompanyName: {
		type: String,
		trim: true,
		required: true
	},
	financeEmail: {
		type: String,
	},
	website: {
		type: String,
	},
	phone: {
		type: String,
	},
	timeZone: {
		type: Schema.Types.ObjectId,
		ref: 'Timezones'
	},
	mainCurrency: {
		type: String,
		enum: [ 'USD', 'EUR', 'GBP', 'Invoice on-hold', 'Invoice Ready', 'Partially Paid', 'Paid' ],
	},
	companyId: {
		type: String,
	},
	taxId: {
		type: String,
	},
	isActive: {
		type: Boolean,
		default: true
	},
	isDefault: {
		type: Boolean,
		default: false
	},

	country: {
		type: String,
		trim: true,
	},

	city: {
		type: String,
		trim: true,
	},
	state: {
		type: String,
		trim: true,
	},
	address: {
		type: String,
		trim: true,
	},
	postCode: {
		type: String,
		trim: true,
	},
	vat: {
		type: String,
	},
	paymentMethods: {
		name: {
			type: String,
			trim: true,
		},
		paymentType: {
			type: Schema.Types.ObjectId,
			ref: 'PaymentMethods'
		},
		otherStatement: {
			type: Object,
			default: {}
		}
	}
});

const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;
