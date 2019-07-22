const router = require('express').Router();
const { Languages, Industries, Timezones, LeadSource, Group, Step, Package, Instruction, CancelReason, DiscountChart, User } = require('../../models');

router.post('/chart-update', async (req, res) => {
    const { chart } = req.body;
    try {
        await DiscountChart.updateOne({"_id": chart._id}, { ...chart});
        res.send('updated');
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating chart");
    }
})

module.exports = router;
