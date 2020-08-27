const mongoose = require('mongoose');

const SalesPerformanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now()
  },
  average: {
    type: Number,
    default: 0
  },
  newLeeds: {
    type: Number,
    default: 0
  },
  calls: {
    type: Number,
    default: 0
  },
  communications: {
    type: Number,
    default: 0
  },
  meetingSetup: {
    type: Number,
    default: 0
  },
  notes: {
    type: Array,
    default: []
  }
});

const DashboardSalesPerformance = mongoose.model('SalesPerformance', SalesPerformanceSchema);

module.exports = DashboardSalesPerformance;
