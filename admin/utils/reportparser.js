const axios = require('axios');
const { Quotes } = require('../models');
const reportparser = {

  parseQuotes(beginDate, endDate) {
    const instance = axios.create({
        baseURL: 'https://pangea.s.xtrf.eu/home-api/browser/?viewId=787&q.startDate=fromTo(1517432400000,1519851600000)',
        headers: {
            'X-AUTH-ACCESS-TOKEN': 'U0mLa6os4DIBAsXErcSUvxU0cj'
          }
      });

    var data = instance.get().then(function (response) {
        console.log("Data getting finished, begin to parse");
        for(var i=0; i < 5; i++){
            var row = response.data.rows[i].columns;
            Quotes.create({
                id :  row[0],
                companyName  : row[2],
                beginDate : row[5],
            }).then(function(result) {
                console.log("Quote parsed " + result.id);
            })
           
        }

      }).catch(function (error) {
        console.log("Error " + error);        
      });    
  }
}

module.exports = reportparser;
