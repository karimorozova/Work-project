const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

const TasksReportSchema = new mongoose.Schema({
  monthName: {
    type: String,
    default: ''
  },
  beginDate:{
   type: String,
   default : ''
  },
  endDate:{
    type: String,
    default : ''
   },
  columns: {
    type: Array,
    default: []
  },
  tasks: {
    type: Array,
    default: []
  },
  lastSynced: {
    type: String,
    default: ''
  },

});

const TasksReport = mongoose.model('tasksreport', TasksReportSchema);

module.exports = TasksReport;
