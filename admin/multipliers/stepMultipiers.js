const { Pricelist, Step, Units } = require('../models');
const ObjectId = require('mongodb').ObjectID;

const getFilteredStepMultipliers = async (stepMultipliersTable, filters, needToSplice) => {
  const { countFilter } = filters;
  if (filters.stepFilter) {
    const steps = await Step.find({ title: filters.stepFilter });
    if (steps.length > 1) {
      const neededSteps = [];
      for (let key of steps) {
        neededSteps.push(stepMultipliersTable.find(({ step }) => step._id.toString() === key._id.toString()));
        stepMultipliersTable = neededSteps;
      }
    } else {
      stepMultipliersTable = stepMultipliersTable.filter(({ step }) => steps[0]._id.toString() === step._id.toString());
    }
  }
  if (filters.unitFilter) {
    const units = await Units.find({ type: filters.unitFilter });
    if (units.length > 1) {
      const neededUnits = [];
      for (let key of units) {
        neededUnits.push(stepMultipliersTable.find(({ unit }) => unit._id.toString() === key._id.toString()));
        stepMultipliersTable = neededUnits;
      }
    } else {
      stepMultipliersTable = stepMultipliersTable.filter(({ unit }) => units[0]._id.toString() === unit._id.toString());
    }
  }
  if (filters.sizeFilter) {
    stepMultipliersTable = stepMultipliersTable.filter(({ size }) => size === +filters.sizeFilter)
  }
  return needToSplice ? stepMultipliersTable.splice(countFilter, 25) : stepMultipliersTable;
};

const getFilteredStepMultiplier = async (filters, priceListId, needToSplice = true) => {
  try {
    const { stepMultipliersTable } = await Pricelist.findOne({ _id: priceListId }, { _id: 0, stepMultipliersTable: 1 })
      .populate('stepMultipliersTable.step').populate('stepMultipliersTable.unit');
    return await getFilteredStepMultipliers(stepMultipliersTable, filters, needToSplice);
  } catch (err) {
    console.log(err);
    console.log('Error in getFilteredStepMultiplier');
    throw new Error(err.message);
  }
};

const updateStepMultipliers = async (stepToUpdate, priceListId) => {
  try {
    let { stepMultipliersTable } = await Pricelist.findOne({ _id: priceListId }, { _id: 0, stepMultipliersTable: 1 })
      .populate('stepMultipliersTable.step').populate('stepMultipliersTable.unit');
    const stepToUpdateIndex = stepMultipliersTable.findIndex(step => step._id.toString() === stepToUpdate._id)
    stepToUpdate.altered = true;
    stepMultipliersTable.splice(stepToUpdateIndex, 1, stepToUpdate);
    await Pricelist.updateOne({ _id: priceListId }, {stepMultipliersTable})
  } catch (err) {
    console.log(err);
    console.log('Error in updateStepMultipliers');
  }
}

const updateStepPriceValue = async ({ USD, GBP }) => {
  try {
    const pricelists = await Pricelist.find();
    for (let { stepMultipliersTable, _id } of pricelists) {
      let updatedStepPrices = [];
      for ( let { euroMinPrice, usdMinPrice, gbpMinPrice, _id: stepMultipliersId, step, unit, size } of stepMultipliersTable ) {
        usdMinPrice = euroMinPrice * Number(USD);
        gbpMinPrice = euroMinPrice * Number(GBP);
        updatedStepPrices.push({
          euroMinPrice,
          usdMinPrice,
          gbpMinPrice,
          _id: stepMultipliersId,
          step,
          unit,
          size
        })
      }
      await Pricelist.updateOne({ _id }, { stepMultipliersTable: updatedStepPrices });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in updateStepPriceValue');
  }
}

module.exports = { getFilteredStepMultiplier, updateStepMultipliers, updateStepPriceValue };
