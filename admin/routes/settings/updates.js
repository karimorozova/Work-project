const router = require('express').Router();
const { Languages, Industries, Timezones, LeadSource, Group, Step, Package, Instruction, CancelReason, DiscountChart, User } = require('../../models');

router.post('/chart-update', async (req, res) => {
    const { chart } = req.body;
    try {
        let result = {};
        if(!chart._id) {
            result = await DiscountChart.create(chart);
        } else {
            result = await DiscountChart.findOneAndUpdate({"_id": chart._id}, { ...chart});
        }
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating chart");
    }
})

module.exports = router;
