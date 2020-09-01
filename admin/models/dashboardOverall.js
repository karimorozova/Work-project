const mongoose = require('mongoose');

const OverallViewSchema = new mongoose.Schema({
  today: {
    receivables: {
      type: Number,
      default: 0
    },
    payable: {
      type: Number,
      default: 0
    },
    margin: {
      type: Number,
      default: 0
    },
    currentClients: {
      type: Number,
      default: 0
    },
    newBusiness: {
      type: Number,
      default: 0
    },
    clients: [{
      name: {
        type: String,
        trim: true
      },
      receivables: {
        type: Number,
        default: 0
      }
    }]
  },
  thisMonth: {
    receivables: {
      type: Number,
      default: 0
    },
    payable: {
      type: Number,
      default: 0
    },
    margin: {
      type: Number,
      default: 0
    },
    currentClients: {
      type: Number,
      default: 0
    },
    newBusiness: {
      type: Number,
      default: 0
    },
    clients: [{
      name: {
        type: String,
        trim: true
      },
      receivables: {
        type: Number,
        default: 0
      }
    }]
  }
});

const OverallView = mongoose.model('OverallView', OverallViewSchema);

module.exports = OverallView;
