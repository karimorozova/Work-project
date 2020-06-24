const { StepMultiplier, Step, Units } = require('../models');

const getFilteredStepMultiplierQuery = async (filters) => {
  const query = {};
  if (filters.stepFilter) {
    const steps = await Step.find({ title: filters.stepFilter });
    if (steps.length > 1) {
      const idArray = [];
      for (let { _id } of steps) {
        idArray.push({
          _id: _id
        })
      }
      query.step = { $and: idArray };
    } else {
      query.step = { _id: steps[0]._id };
    }
  }
  if (filters.unitFilter) {
    const units = await Units.find({ type: filters.unitFilter });
    if (units.length > 1) {
      const idArray = [];
      for (let { _id } of units) {
        idArray.push({
          _id: _id
        })
      }
      query.unit = { $and: idArray };
    } else {
      query.unit = { _id: units[0]._id };
    }
  }
  if (filters.sizeFilter) {
    query.size = +filters.sizeFilter;
  }
  return query;
}

const getFilteredStepMultiplier = async (filters) => {
  const { countFilter } = filters;
  try {
    const query = await getFilteredStepMultiplierQuery(filters);
    const stepMultipliers = await StepMultiplier.find(query).skip(countFilter).limit(25);
    return StepMultiplier.populate(stepMultipliers, [
      'step',
      'unit'
    ]);
  } catch (err) {
    console.log(err);
    console.log('Error in getFilteredStepMultiplier');
    throw new Error(err.message);
  }
}

module.exports = { getFilteredStepMultiplier }
