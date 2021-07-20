const router = require('express').Router();
const { getProjectsFinanceInfo }  = require('../dashboard/overallView/projectFinance')
const { getProjectsForDashboard }  = require('../dashboard/pmAmOrAdmin')
const { getClientsRequestsForDashboard }  = require('../dashboard/incomingRequests')


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

module.exports = router;