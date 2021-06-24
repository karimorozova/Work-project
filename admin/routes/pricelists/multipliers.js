const router = require('express').Router();
const { Pricelist } = require('../../models');
const {
  getFilteredStepMultiplier,
  getFilteredBasicPrices,
  updateStepMultipliers,
  updateIndustryMultipliers,
  updateBasicPrices,
  getPricelistCombinations,
  addNewMultiplier,
  updateMultiplier,
  updatePriceMultiplier,
  setHideAndShowOption
} = require('../../multipliers');

router.post('/hide-and-show-vendor-clients-rates/', async (req, res) => {
  const { entityId, entityType, tableName, tableRow } = req.body;
  try {
    const entity = await setHideAndShowOption({ entityId, entityType, tableName, tableRow })
    res.send(entity.rates);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating hide/show option');
  }
})

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
    let { industryMultipliersTable } = await Pricelist.findOne({ _id: id}, {_id: 0, industryMultipliersTable: 1})
      .populate('industryMultipliersTable.industry');
    industryMultipliersTable = industryMultipliersTable.filter(row => row.isActive === true);
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

router.post('/pricelist/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pricelist = await getPricelistCombinations(id, req.body);
    res.send(pricelist);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on getting pricelist');
  }
})

router.post('/add-new-multiplier', async (req, res) => {
  const { key, id } = req.body;
  try {
    await addNewMultiplier(key, id);
    res.send('Saved');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on adding new multiplier');
  }
})

router.post('/update-language-activity', async (req, res) => {
  const { lang, value } = req.body;
  try {
    await updatePriceMultiplier(lang, value);
    res.send('Saved')
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating price multiplier');
  }
});

router.post('/update-multiplier', async (req, res) => {
  const { oldMultiplier, key } = req.body;
  try {
    await updateMultiplier(key, oldMultiplier);
    res.send('Saved');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on adding new multiplier');
  }
})

module.exports = router;
