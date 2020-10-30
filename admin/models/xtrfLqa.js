const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const XtrfLqaSchema = new mongoose.Schema({
	source: {
		type: Schema.Types.ObjectId, ref: 'Language',
		default: null
	},
	target: {
		type: Schema.Types.ObjectId, ref: 'Language',
		default: null
	},
	industries: [{
		industry: {
			type: 'String',
			default: ''
		},
		vendors: [{
			vendorId: {
				type: Schema.Types.ObjectId, ref: 'Vendor',
				default: null
			},
			name: {
				type: 'String',
				default: ''
			},
			email: {
				type: 'String',
				default: ''
			},
			wordCount: {
				type: Number,
				default: 0
			},
			otherInfo: [{
				clientId: {
					type: Schema.Types.ObjectId, ref: 'Client',
					default: null
				},
				clientName: {
					type: 'String',
					default: ''
				},
				projectId: {
					type: 'String',
					default: ''
				},
			}]
		}],
	}]

});

const XtrfLqa = mongoose.model('XtrfLqa', XtrfLqaSchema);

module.exports = XtrfLqa;