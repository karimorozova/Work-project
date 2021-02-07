const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IndustryTierInfoSchema = new mongoose.Schema({
	industry: {
		type: Schema.Types.ObjectId,
		ref: 'Industries',
		default: null
	},
	tier1: {
		type: Number
	},
	tier3: {
		type: Number
	},
});

const IndustryTierInfo = mongoose.model('IndustryTierInfo', IndustryTierInfoSchema);

module.exports = IndustryTierInfo;