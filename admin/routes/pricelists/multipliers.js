const router = require('express').Router();
const { Pricelist } = require('../../models');
const {
  getFilteredStepMultiplier,
  getFilteredBasicPrices,
  updateStepMultipliers,
  updateIndustryMultipliers,
  updateBasicPrices
} = require('../../multipliers');

router.post('/step-multipliers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const stepMultipliers = await getFilteredStepMultiplier(req.body, id);
    res.send(stepMultipliers);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting step multipliers');
  }
})

router.post('/step-multipliers-update/:id', async (req, res) => {
  const { stepMultiplier } = req.body;
  const { id } = req.params;
  try {
    await updateStepMultipliers(stepMultiplier, id);
    res.send(stepMultiplier)
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating step multipliers');
  }
})

router.get('/industry-multipliers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { industryMultipliersTable } = await Pricelist.findOne({ _id: id}, {_id: 0, industryMultipliersTable: 1})
      .populate('industryMultipliersTable.industry');
    res.send(industryMultipliersTable);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting industry multipliers');
  }
})

router.post('/industry-multipliers/:id', async (req, res) => {
  const { industryMultiplier } = req.body;
  const { id } = req.params;
  try {
    await updateIndustryMultipliers(industryMultiplier, id)
    res.send(industryMultiplier);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating industry multipliers');
  }
})

router.post('/basic-prices/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const basicPrices = await getFilteredBasicPrices(req.body, id);
    res.send(basicPrices)
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting basic prices')
  }
})

router.post('/basic-prices-update/:id', async (req, res) => {
  const { basicPrice } = req.body;
  const { id } = req.params;
  try {
    await updateBasicPrices(basicPrice, id)
    res.send(basicPrice)
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating basic-prices');
  }
})


router.post('/delete-sync', async (req, res) => {
  const { key , id } = req.body;
  console.log(key , id);
  
  try {
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on sync deleting');
  }

})

module.exports = router;
