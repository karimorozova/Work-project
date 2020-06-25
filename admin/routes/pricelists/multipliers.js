const router = require('express').Router();
const { Pricelist } = require('../../models');
const { getFilteredStepMultiplier, getFilteredBasicPrices } = require('../../multipliers');

router.post('/step-multipliers/:id', async (req, res) => {
  const { _id } = req.params;
  try {
    const stepMultipliers = await getFilteredStepMultiplier(req.body);
    res.send(stepMultipliers);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting step multipliers');
  }
})

router.post('/step-multipliers-update/:id', async (req, res) => {
  const { stepMultiplier: stepMultiplierTable } = req.body;
  const { _id } = req.params;
  try {
    // await StepMultiplier.findOneAndUpdate({ _id: stepMultiplier._id }, stepMultiplier);
    // const updatedStep = await StepMultiplier.findOne({ _id: stepMultiplier._id }).populate('step').populate('unit');
    await Pricelist.findOneAndUpdate({ _id })
    res.send(updatedStep);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating step multipliers');
  }
})

router.get('/industry-multipliers/:id', async (req, res) => {
  const { _id } = req.params;
  try {
    const industryMultipliers = await IndustryMultiplier.find().populate('industry');
    res.send(industryMultipliers);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting industry multipliers');
  }
})

router.post('/industry-multipliers/:id', async (req, res) => {
  const { industryMultiplier } = req.body;
  const { _id } = req.params;
  try {
    await IndustryMultiplier.findOneAndUpdate({ _id: industryMultiplier._id }, industryMultiplier);
    res.send('Saved');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating industry multipliers');
  }
})

router.post('/basic-prices/:id', async (req, res) => {
  const { _id } = req.params;
  try {
    const basicPrices = await getFilteredBasicPrices(req.body);
    res.send(basicPrices)
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting basic prices')
  }
})

router.post('/basic-prices-update/:id', async (req, res) => {
  const { _id } = req.params;
  const { basicPrice } = req.body;
  try {
    await BasicPrice.findOneAndUpdate({ _id: basicPrice._id }, basicPrice);
    const updatedBasicPrice = await BasicPrice.findOne({ _id: basicPrice._id })
    .populate('sourceLanguage').populate('targetLanguage');
    res.send(updatedBasicPrice);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating basic-prices');
  }
})

module.exports = router;
