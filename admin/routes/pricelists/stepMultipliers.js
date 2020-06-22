const router = require('express').Router();
const { StepMultiplier, IndustryMultiplier } = require('../../models');

router.get('/step-multipliers', async (req, res) => {
  try {
    const stepMultipliers = await StepMultiplier.find();
    res.send(stepMultipliers);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting step multipliers');
  }
})

router.post('/step-multipliers/:id', async (req, res) => {
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
    const industryMultipliers = await IndustryMultiplier.find();
    res.send(industryMultipliers);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting industry multipliers');
  }
})

router.post('/industry-multipliers/:id', async (req, res) => {
  const { industryMultiplier } = req.body;
  try {
    await IndustryMultiplier.findOneAndUpdate({ _id: industryMultiplier._id }, industryMultiplier);
    res.send('Saved');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating industry multipliers');
  }
})

module.exports = router;
