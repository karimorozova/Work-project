const router = require('express').Router();
const { StepMultiplier, IndustryMultiplier, BasicPrice } = require('../../models');
const { getFilteredStepMultiplier, getFilteredBasicPrices } = require('../../multipliers');

router.post('/step-multipliers', async (req, res) => {
  try {
    const stepMultipliers = await getFilteredStepMultiplier(req.body);
    res.send(stepMultipliers);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting step multipliers');
  }
})

router.post('/step-multipliers-update', async (req, res) => {
  const { stepMultiplier } = req.body;
  try {
    await StepMultiplier.findOneAndUpdate({ _id: stepMultiplier._id }, stepMultiplier);
    res.send('Saved');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating step multipliers');
  }
})

router.get('/industry-multipliers', async (req, res) => {
  try {
    const industryMultipliers = await IndustryMultiplier.find().populate('industry');
    res.send(industryMultipliers);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting industry multipliers');
  }
})

router.post('/industry-multipliers', async (req, res) => {
  const { industryMultiplier } = req.body;
  try {
    await IndustryMultiplier.findOneAndUpdate({ _id: industryMultiplier._id }, industryMultiplier);
    res.send('Saved');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating industry multipliers');
  }
})

router.post('/basic-prices', async (req, res) => {
  try {
    const basicPrices = await getFilteredBasicPrices(req.body);
    res.send(basicPrices)
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting basic prices')
  }
})

router.post('/basic-prices-update', async (req, res) => {
  const { basicPrice } = req.body;
  try {
    await BasicPrice.findOneAndUpdate({ _id: basicPrice._id }, basicPrice);
    res.send('Saved');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating basic-prices');
  }
})

module.exports = router;
