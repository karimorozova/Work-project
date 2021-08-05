const router = require('express').Router();
const { getProjectsFinanceInfo }  = require('../dashboard/overallView/projectFinance')
const { getProjectsForDashboard }  = require('../dashboard/pmAmOrAdmin')
const { getClientsRequestsForDashboard }  = require('../dashboard/incomingRequests')
const { sendRequest } = require("../projects/xtrfApi")
const axios = require("axios")
const {Projects} = require("../models")
const moment = require("moment")
const { Convert } = require("easy-currencies")


router.post("/finance-view", async (req, res) => {
  const { startDate, endDate } = req.body;
  try {
    const result = await getProjectsFinanceInfo(startDate, endDate)
    res.send(result)
    } catch(err) {
      console.log(err);
      res.status(500).send('Something wrong on Finance getting');
    }
});

router.get("/all-projects", async (req, res) => {
  try {
    const result = await getProjectsForDashboard()
    res.send(result)
    } catch(err) {
      console.log(err);
      res.status(500).send('Something wrong on Finance getting');
    }
});
router.get("/all-client-requests", async (req, res) => {
  try {
    const result = await getClientsRequestsForDashboard()
    res.send(result)
    } catch(err) {
      console.log(err);
      res.status(500).send('Something wrong on Finance getting');
    }
});

router.get("/finance", async (req, res) => {
  try {
    const currencyNormalize = {
      '&euro;': 'EUR',
      '$': 'USD'
    }

    let sumEuro = 0
    let sumDolars = 0
    let sumEuroMonth = 0
    let sumDolarsMonth = 0

    const reportsLink = await sendRequest('get','reports/128/result/printerFriendly')
    const xtrfPayments =  (await axios({
      method: 'get',
      url: reportsLink.data.url,
    }))

    const reportsLinkMonth = await sendRequest('get','reports/129/result/printerFriendly')
    const xtrfPaymentsMonth =  (await axios({
      method: 'get',
      url: reportsLinkMonth.data.url,
    }))


    const matchStrings = xtrfPayments.data.match(/class='xtrf-financial-report-body'.+?>(.+?)<\/td.+?>(.+?)<\/td.+?>(?<Currency>.+?)<\/td.+?>(?<Value>.+?)<\/td.+?>/gm)

    for await (let matchString of matchStrings) {

      const xtrfFinanceToday = /class='xtrf-financial-report-body'.+?>(.+?)<\/td.+?>(.+?)<\/td.+?>.+?\[(?<currency>.+?)\]<\/td.+?>(?<value>.+?)<\/td.+?>/gm.exec(matchString)
      const {currency, value} = xtrfFinanceToday.groups

      if (currencyNormalize[currency] === 'EUR' ) {
        sumEuro += +value
      }else {
        sumDolars += +value
      }

    }

    sumEuro += await Convert(sumDolars).from("USD").to("EUR")

    const matchStringsMonth = xtrfPaymentsMonth.data.match(/class='xtrf-financial-report-body'.+?>(.+?)<\/td.+?>(.+?)<\/td.+?>(?<Currency>.+?)<\/td.+?>(?<Value>.+?)<\/td.+?>/gm)

    for await (let matchString of matchStringsMonth) {

      const xtrfFinanceToday = /class='xtrf-financial-report-body'.+?>(.+?)<\/td.+?>(.+?)<\/td.+?>.+?\[(?<currency>.+?)\]<\/td.+?>(?<value>.+?)<\/td.+?>/gm.exec(matchString)
      const {currency, value} = xtrfFinanceToday.groups

      if (currencyNormalize[currency] === 'EUR' ) {
        sumEuroMonth += +value
      }else {
        sumDolarsMonth += +value
      }

    }

    sumEuroMonth += await Convert(sumDolarsMonth).from("USD").to("EUR")

    const today = moment().format('YYYY-MM-DD')
    const projectFinance = await Projects.find({isTest: false, isSendToXtrf: false, startDate: {$gte: new Date(today+'T00:00:00.000Z'), $lt: new Date(today+'T24:00:00.000Z')}}, {finance: 1, projectCurrency:1, crossRate:1})
    const sum = projectFinance.reduce((acc, cur)=> {
      if (!cur.finance.Price.receivables ) return acc
      acc += cur.projectCurrency === 'EUR' ? +cur.finance.Price.receivables : +cur.finance.Price.receivables * +cur.crossRate.USD.EUR
      return acc
    }, 0)



    const startMonth = moment().startOf('month').format('YYYY-MM-DD')
    const endMonth = moment().endOf('month').format('YYYY-MM-DD')
    const projectFinanceMonth = await Projects.find({isTest: false, isSendToXtrf: false, startDate: {$gte: new Date(startMonth+'T00:00:00.000Z'), $lt: new Date(endMonth+'T24:00:00.000Z')}}, {finance: 1, projectCurrency:1, crossRate:1})
    const sumMonth = projectFinanceMonth.reduce((acc, cur)=> {
      if (!cur.finance.Price.receivables ) return acc
      acc += cur.projectCurrency === 'EUR' ? +cur.finance.Price.receivables : +cur.finance.Price.receivables * +cur.crossRate.USD.EUR
      return acc
    }, 0)



    res.send(JSON.stringify({
      today: [{name: "Xtrf", value: sumEuro}, {name: "Alfa [Not transferred]", value: sum}, {name: "Total", value: sum + sumEuro}],
      month: [{name: "Xtrf", value: sumEuroMonth}, {name: "Alfa [Not transferred]", value: sumMonth}, {name: "Total", value: sumMonth + sumEuroMonth}]
      }))
    } catch(err) {
      console.log(err);
      res.status(500).send('Something wrong on Finance getting');
    }
});

module.exports = router;