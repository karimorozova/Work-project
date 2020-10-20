const mongoose = require('mongoose');

// const LangTierSchema = new mongoose.Schema({
//   languages: {
//     type : Object,
//     default: {}
//   },
//   industry: {
//     type : String,
//     default : 'All',
//     trim : true
//   },
//   updatedAt: {
//     type : Date,
//     default : new Date()
//   },
// });

const LangTierSchema = new mongoose.Schema({
	industry: [{
		name: 'Igaming',
    
		source: [{
			lang: 'AFR',
			target: [{
				lang: 'ENG',
				count: 123
			}]
		},
			{
				lang: 'ENG',
				target: [{
					lang: 'eEEEE',
					count: 123
				}]
			}]
	}]
});

const LangTier = mongoose.model('LangTier', LangTierSchema);

module.exports = LangTier;
