const mongoose = require('mongoose');

const gmailMessagesSchema = new mongoose.Schema({
  id: {
    type: 'String',
    default: '',
  },
  additionalInformation: {}

});
const GmailMessages = mongoose.model('GmailMessages', gmailMessagesSchema);

module.exports = GmailMessages;
