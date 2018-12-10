const router = require('express').Router();
const { Pricelist } = require('../../models');

router.get('/pricelists', async (req, res) => {
    try {
      const pricelists = await Pricelist.find({});
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
  if(!id) {
    return res.send("Deleted");
  }
  try {
    await Pricelist.deleteOne({"_id": id});
    res.send("Deleted");
  } catch(err) {
    console.log(err);
    res.status(500).send("Error on deleting pricelist")
  }
})

module.exports = router;
