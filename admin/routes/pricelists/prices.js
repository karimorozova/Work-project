const router = require('express').Router();
const { Pricelist } = require('../../models');
const { saveNewPricelist, deletePricelist, getPricelists } = require('../../rates');

router.get('/pricelists', async (req, res) => {
    try {
      const pricelists = await getPricelists({});
      res.send(pricelists);
    } catch(err) {
      console.log(err);
      res.status(500).send("Error on getting pricelists from DB")
    }
})

router.post('/pricelist', async (req, res) => {
    const { pricelist } = req.body;
    try {
      await Pricelist.findOneAndUpdate({"_id": pricelist._id}, pricelist);
      res.send("Saved");
    } catch(err) {
      console.log(err);
      res.status(500).send("Error on getting pricelists from DB")
    }
})

router.delete('/pricelist/:id', async (req, res) => {
  const { id } = req.params;
  const { isClientDefault, isVendorDefault } = req.body;
  try {
    await deletePricelist(id, isClientDefault, isVendorDefault);
    res.send("Deleted");
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on deleting pricelist");
  }
})

router.post('/new-pricelist', async (req, res) => {
  const { pricelist } = req.body;
  try {
    await saveNewPricelist(pricelist);
    res.send("Saved");
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on saving pricelist");
  }
})

router.post('/set-default', async (req, res) => {
  const { newDefaultPriceId, exDefaultPriceId, prop } = req.body;
  try {
    await Pricelist.updateOne({"_id": newDefaultPriceId}, {[prop]: true});
    await Pricelist.updateOne({"_id": exDefaultPriceId}, {[prop]: false});
    res.send("Changes saved");
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on saving default pricelist");
  }
})

router.post('/activeness', async (req, res) => {
    const { id, isActive } = req.body;
    try {
        await Pricelist.updateOne({"_id": id}, { isActive });
        res.send("Updated");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on setting active/inactive pricelist");
    }
})

module.exports = router;
