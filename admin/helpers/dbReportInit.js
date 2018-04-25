const {
  TasksReport
} = require('../models');

const axios = require('axios');

var instance = axios.create({
  baseURL: 'https://pangea.s.xtrf.eu/home-api/',
  headers: {
    'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj'
  }
});
const monthNames = [
  "January", "February", "March",
  "April", "May", "June",
  "July", "August", "September",
  "October", "November", "December"
];

function reports() {
  var date = new Date();

  //init report by month empty
  TasksReport.count({}, function (err, count) {
    if (!count) {
      console.log("Generating from the year begin");
      for (var i = 0; i < 12; i++) {

        var firstDay = new Date(date.getFullYear(), i, 1);
        var lastDay = new Date(date.getFullYear(), i + 1, 0);

        TasksReport.create({
          monthName: monthNames[i],
          beginDate: Date.parse(firstDay),
          endDate: Date.parse(lastDay)
        })
      }
    }
  });


  TasksReport.find()
    .then(reports => {
      for (var i = 0; i < reports.length; i++) {
        //console.log(`Begin date of ${reports[i].monthName} is ${reports[i].beginDate}`);
      } 
    })
    .catch(err => {
      console.log(err)
    })

}


async function initReports() {
  await reports();
}

module.exports = initReports();
