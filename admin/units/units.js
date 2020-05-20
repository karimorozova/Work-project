const { Units } = require('../models');

async function getUnits() {
  try {
    return await Units.find();
  } catch (err) {
    console.log(err);
    console.log("Error on getting units");
  }
}

module.exports = { getUnits };
