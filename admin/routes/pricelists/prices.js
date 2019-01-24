const router = require('express').Router();
const { Pricelist } = require('../../models');
const { saveNewPricelist, deletePricelist, getPricelists, checkPriceForPairs, addSeveralLangs } = require('../../rates');

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
  const { isDefault } = req.body;
  if(!id) {
    return res.send("Deleted");
  }
  try {
    await deletePricelist(id, isDefault);
    res.send("Deleted");
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on deleting pricelist");
  }
})

router.post('/new-pricelist', async (req, res) => {
  const pricelist = {...req.body};
  try {
    await saveNewPricelist(pricelist);
    res.send("Saved");
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on saving pricelist");
  }
})

router.post('/set-default', async (req, res) => {
  const { id, isDefault } = req.body;
  try {
    await Pricelist.updateOne({"isDefault": isDefault}, {"isDefault": !isDefault});
    await Pricelist.updateOne({"_id": id}, {"isDefault": isDefault});
    res.send("Changes saved");
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on saving default pricelist");
  }
})

router.post('/combinations', async (req, res) => {
  const { priceId, combinations } = req.body;
  try {
    const availablePairs = await checkPriceForPairs(priceId, combinations);
    res.send(availablePairs);
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on checking combinations");
  }
})

router.post('/several-langs', async (req, res) => {
  const { currentPriceId, sourcePriceId, combinations } = req.body;
  try {
    const updatedCombinations = await addSeveralLangs({ currentPriceId, sourcePriceId, combinations });
    await Pricelist.updateOne({"_id": currentPriceId}, {combinations: updatedCombinations});
    res.send('Several languages added');
  } catch(err) {
    console.log(err)
    res.status(500).send('Error on adding several language combinations');
  }
})

module.exports = router;
