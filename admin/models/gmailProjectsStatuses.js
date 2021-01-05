const mongoose = require('mongoose');

const gmailProjectsStatusesSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true
	},
	status: {
		type: String,
		trim: true
	},
	isRead: {
		type: Boolean,
		default: false,
	}
});
const GmailProjectsStatuses = mongoose.model('GmailProjectsStatuses', gmailProjectsStatusesSchema);

module.exports = GmailProjectsStatuses;
