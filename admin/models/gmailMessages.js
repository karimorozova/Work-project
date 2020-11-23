const mongoose = require('mongoose');

const gmailMessagesSchema = new mongoose.Schema({
  labelId: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  messages: [{
    id: {
      type: String,
    },
    snippet: {
      type: String,
    },
    header: {
      type: String
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
});
const GmailMessages = mongoose.model('GmailMessages', gmailMessagesSchema);

module.exports = GmailMessages;
