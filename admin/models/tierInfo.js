const mongoose = require('mongoose');

const TierInfoSchema = new mongoose.Schema({
	tier: {
		type : Number
	},
	lqas: [
		{
			minWordCount: {type: Number},
			allowSteps: {type: Array},
			lqaName: {type: String},
		}
	],

});

const TierInfo = mongoose.model('TierInfo', TierInfoSchema);

module.exports = TierInfo;