const router = require('express').Router();
const { Pricelist } = require('../../models');
const { getPricelist, getAfterRatesSaved } = require('../../rates');

router.post('/combination', async (req, res) => {
    const { priceId, ...rateInfo } = req.body;
    try {
        const pricelist = await getPricelist({"_id": priceId});
        const updatedPricelist = await getAfterRatesSaved(rateInfo, pricelist);
        res.send(updatedPricelist);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on saving rate for pricelist")
    }
})

module.exports = router;