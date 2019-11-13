const router = require('express').Router();
const { getReport } = require("../reports/get");

router.get('/tier-report', async (req, res) => {
    const { type } = req.query;
    const reportData = await getReport(type);
    res.send(reportData);
})

module.exports = router;