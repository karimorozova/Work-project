const { Units, Step } = require('../models');

async function insertUnitIntoStep(unit, unitId) {
  const { type, active, steps, sizes } = unit;
  try {
    for (let { _id } of steps) {
      const step = await Step.findOne({ _id });
      step.calculationUnit.push({
        _id: unitId.toString(),
        type,
        active,
        editable: true,
        sizes,
      })
      await Step.updateOne({ _id }, step, { upsert: true });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in insertUnitIntoStep');
  }
}

async function deleteUnitFromStep(unitId) {
  try {
    const steps = await Step.find();
    for (let step of steps) {
      const { calculationUnit } = step;
      step.calculationUnit = calculationUnit.filter(unit => unit._id.toString() !== unitId);
      await Step.updateOne({ _id: step._id }, step, { upsert: true });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in deleteUnitFromStep');
  }
}

async function changeUnitsInSteps(unitToUpdate) {
  const { _id, ...unit } = unitToUpdate;
  try {
    const steps = await Step.find({ 'calculationUnit._id': _id });
    if (!unit.steps.length) {
      await deleteUnitFromStep(_id);
    }
    for (let { _id: id } of unit.steps) {
      const redundantSteps = steps.filter(item => item._id !== id);
      if (redundantSteps.length) {
        for (let step of redundantSteps) {
          step.calculationUnit = step.calculationUnit.filter(unit => unit._id !== _id);
          await Step.updateOne({ _id: step._id }, step);
        }
      }
    }
    if (unit.steps.length) {
      for (let { _id: id } of unit.steps) {
        const step = await Step.findOne({ _id: id });
        const isExists = step.calculationUnit.find(item => item._id === _id);
        if (!isExists) {
          step.calculationUnit.push({
            _id,
            type: unit.type,
            active: unit.active,
            editable: true,
            sizes: unit.sizes,
          })
        }
        await Step.updateOne({ _id: id }, step);
      }
    }
    return await Units.updateOne({ _id }, unit, { upsert: true });
  } catch (err) {
    console.log(err);
    console.log('Error in changeUnitsInSteps');
  }
}

module.exports = { insertUnitIntoStep, deleteUnitFromStep, changeUnitsInSteps };
