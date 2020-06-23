const { StepMultiplier, Step, Units } = require('../models');

const getFilteredStepMultiplierQuery = async (filters) => {
  const query = {};
  if (filters.stepFilter) {
    query.step = { _id: filters.stepFilter };

  }
  if (filters.unitFilter) {
    query.unit = { _id: filters.unitFilter };
  }
  if (filters.sizeFilter) {
    query.size = { size: filters.sizeFilter };
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
