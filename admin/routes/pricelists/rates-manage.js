const router = require('express').Router();
const { Pricelist } = require('../../models');
const { getPricelist, getUpdatedPricelist, getAfterRatesSaved, getAfterRatesImported } = require('../../rates');

router.post('/combination', async (req, res) => {
    const { priceId, ...rateInfo } = req.body;
    try {
        const pricelist = await getPricelist({"_id": priceId});
        const updatedPricelist = await getAfterRatesSaved(rateInfo, pricelist);
        res.send(updatedPricelist);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on saving rate for pricelist");
    }
})

router.post('/remove-rate', async (req, res) => {
    const { priceId, rateId, prop } = req.body;
    try {
        const updatedPricelist = await getUpdatedPricelist({"_id": priceId}, {
            $pull: {[prop]: {'_id': rateId}}    
        })
        res.send(updatedPricelist);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting rate from pricelist");
    }
})

router.post('/remove-rates', async (req, res) => {
    const { priceId, checkedIds, prop } = req.body;
    try {
        const updatedPricelist = await getUpdatedPricelist({"_id": priceId}, {
            $pull: {[prop]: {'_id': {$in: checkedIds}}}    
        })
        res.send(updatedPricelist);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting rate from pricelist");
    }
})

router.post('/import-rates', async (req, res) => {
    const { priceId, ratesData, prop } = req.body;
    try {
        const updatedPricelist = await getAfterRatesImported({priceId, ratesData, prop});
        res.send(updatedPricelist);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on importing rates to pricelist");
    }
})

module.exports = router;