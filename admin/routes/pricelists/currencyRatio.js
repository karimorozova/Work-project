const router = require('express').Router();
const { CurrencyRatio } = require('../../models');

router.get('/currency-ratio', async (req, res) => {
  try {
    const currencyRatios = await CurrencyRatio.findOne();
    res.send(currencyRatios);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting currency ratios');
  }
})

router.post('/currency-ratio', async (req, res) => {
  const { currencyRatio } = req.body;
  try {
    await CurrencyRatio.findOneAndUpdate({ _id: currencyRatio._id }, currencyRatio);
    res.send('Saved');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating currency ratio');
  }
})

module.exports = router;
