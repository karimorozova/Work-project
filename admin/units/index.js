const { Units, Step } = require('../models');
const ObjectId = require('mongodb').ObjectID;

async function insertUnitIntoStep(unit, unitId) {
  const { type, active, steps } = unit;
  try {
    for (let { _id } of steps) {
      const step = await Step.findOne({_id: ObjectId(_id)});
      step.calculationUnit.push({
        _id: unitId,
        type,
        active,
        steps: [ObjectId(_id)],
        editable: true,
      })
      await Step.updateOne({ _id: ObjectId(_id) }, step, { upsert: true });
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
      const filteredUnits = calculationUnit.filter(unit => unit._id.toString() !== unitId);
      step.calculationUnit = filteredUnits;
      await Step.updateOne({ _id: ObjectId(step._id) }, step, { upsert: true });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in deleteUnitFromStep');
  }
}

async function changeUnitsInSteps(unitToUpdate) {
  const { _id } = unitToUpdate;
  try {
    const unit = await Units.findOne({ _id: ObjectId(_id) });
    if (unitToUpdate.steps.length > unit.steps.length) {
      await insertUnitIntoStep(unitToUpdate, _id);
    } else if (unitToUpdate.steps.length < unit.steps.length) {
      await deleteUnitFromStep(_id)
    }
    await Units.updateOne({ _id: unit._id }, unitToUpdate);
  } catch (err) {
    console.log(err);
    console.log('Error in changeUnitsInSteps');
  }
}

module.exports = { insertUnitIntoStep, deleteUnitFromStep, changeUnitsInSteps };
