const { Units, Clients, Step, Industries } = require('../models');
const { getArrayDifference, getSizeDifference, activityChange } = require('../multipliers/pricelist');
const { differenceOperationType } = require('../enums/differenceOperationType');

const updateRates = async (key, oldMultiplier) => {
  switch (key) {
    default:
    case 'Step':
      const oldStep = oldMultiplier;
      const updatedStep = await Step.findOne({ _id: oldStep._id }).populate('calculationUnit');
      const unitDifferences = getArrayDifference(
        oldStep.calculationUnit, updatedStep.calculationUnit, 'type'
      );
      const isStepActivityChanged = activityChange(oldStep, updatedStep, 'isActive');
      if (isStepActivityChanged) {
        //   await updateActiveSteps(isStepActivityChanged, oldStep._id);
      }
      if (unitDifferences) {
        await checkStepDifference(unitDifferences, oldStep._id);
      }
      break;
    case 'Unit':
      const oldUnit = oldMultiplier;
      const updatedUnit = await Units.findOne({ _id: oldUnit._id })
        .populate('steps');
      const stepDifferences = getArrayDifference(oldUnit.steps, updatedUnit.steps, 'title');
      const { sizes: oldSizes } = oldUnit;
      const { sizes: updatedSizes } = updatedUnit;
      const sizeDifferences = getSizeDifference(oldSizes, updatedSizes);
      const isUnitActivityChanged = activityChange(oldUnit, updatedUnit, 'active');
      if (isUnitActivityChanged) {
        //   await updateActiveUnits(isUnitActivityChanged, oldUnit._id);
      }
      await checkSizeDifference(oldUnit, updatedUnit.steps, sizeDifferences);
      if (stepDifferences) {
        await checkUnitDifference(stepDifferences, oldUnit);
      }
      break;
    case 'Industry':
      const oldIndustry = oldMultiplier;
      const updatedIndustry = await Industries.findOne({ _id: oldIndustry._id });
      const isIndustryActivityChanged = activityChange(oldIndustry, updatedIndustry, 'active');
      if (isIndustryActivityChanged) {
        //   await updatedActiveIndustry(isIndustryActivityChanged, oldIndustry._id);
      }
  }
};


const checkStepDifference = async ({ difference, itemsToAdd, itemsToDelete }, oldStep) => {
  const clients = await Clients.find();
  switch (difference) {
    default:
    case differenceOperationType.DeleteAndReplace || differenceOperationType.JustReplace || differenceOperationType.AddAndReplace:
      for (let { _id: clientId, rates } of clients) {
        let { stepMultipliersTable } = rates;
        let deleteSize;
        for (let unitToReplace of itemsToAdd) {
          const { _id, sizes } = await Units.findOne({ _id: unitToReplace._id });
          if (sizes.length) {
            deleteSize = true;
            for (let i = 0; i < sizes.length; i += 1) {
              unitToReplace = {
                step: oldStep,
                unit: _id,
                size: sizes[i],
              };
              stepMultipliersTable.push(unitToReplace);
            }
          } else {
            unitToReplace = {
              step: oldStep,
              unit: _id,
              size: 1,
              defaultSize: true
            };
            stepMultipliersTable.push(unitToReplace);
          }
        }
        for (let unitToDelete of itemsToDelete) {
          stepMultipliersTable = stepMultipliersTable.filter(item => (
            `${item.step} ${item.unit}` !== `${oldStep} ${unitToDelete._id}`
          ));
          if (deleteSize) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.defaultSize}` !== `${item.step} ${item.unit} ${true}`
            ));
          }
        }
        rates.stepMultipliersTable = stepMultipliersTable;
        await Clients.updateOne({ _id: clientId }, { rates });
      }
      break;
    case differenceOperationType.JustDelete:
      for (let { _id: clientId, rates } of clients) {
        let { stepMultipliersTable } = rates;
        for (let unitToDelete of itemsToDelete) {
          stepMultipliersTable = stepMultipliersTable.filter(item => (
            `${item.step} ${item.unit}` !== `${oldStep} ${unitToDelete._id}`
          ));
        }
        rates.stepMultipliersTable = stepMultipliersTable;
        await Clients.updateOne({ _id: clientId }, { rates });
      }
      break;
    case differenceOperationType.JustAdd:
      const newMultiplierCombinations = [];
      for (let unitToReplace of itemsToAdd) {
        const { sizes, _id: unitId } = unitToReplace;
        let deleteSize;
        if (sizes.length) {
          deleteSize = true;
          sizes.forEach(size => {
            newMultiplierCombinations.push({
              step: oldStep,
              unit: unitId,
              size,
            });
          });
        } else {
          newMultiplierCombinations.push({
            step: oldStep,
            unit: unitId,
            size: 1,
            defaultSize: true
          });
        }
        for (let { _id: clientId, rates } of clients) {
          let { stepMultipliersTable } = rates;
          if (deleteSize) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.defaultSize}` !== `${item.step} ${item.unit} ${true}`
            ));
          }
          rates.stepMultipliersTable = [...stepMultipliersTable, newMultiplierCombinations];
          await Clients.updateOne({ _id: clientId }, { rates });
        }
      }
      break;
  }
};

const checkUnitDifference = async ({ difference, itemsToAdd, itemsToDelete }, oldUnit) => {
  const clients = await Clients.find();
  switch (difference) {
    default:
    case differenceOperationType.AddAndReplace || differenceOperationType.JustReplace || differenceOperationType.DeleteAndReplace:
      for (let { _id: clientId, rates } of clients) {
        let { stepMultipliersTable } = rates;
        let deleteSize;
        for (let stepToReplace of itemsToAdd) {
          const stepId = stepToReplace;
          const { calculationUnit } = await Step.findOne({ _id: stepId });
          if (calculationUnit.length) {
            for (let unitId of calculationUnit) {
              const { sizes } = await Units.findOne({ _id: unitId });
              if (sizes.length) {
                deleteSize = true;
                for (let i = 0; i < sizes.length; i += 1) {
                  stepToReplace = {
                    step: stepId,
                    unit: unitId,
                    size: sizes[i],
                  };
                  stepMultipliersTable.push(stepToReplace);
                }
              } else {
                stepToReplace = {
                  step: stepId,
                  unit: unitId,
                  size: 1,
                  defaultSize: true
                };
                stepMultipliersTable.push(stepToReplace);
              }
            }
          }
          for (let stepToDelete of itemsToDelete) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit}` !== `${stepToDelete._id} ${oldUnit._id}`
            ));
            if (deleteSize) {
              stepMultipliersTable = stepMultipliersTable.filter(item => (
                `${item.step} ${item.unit} ${item.defaultSize}` !== `${item.step} ${item.unit} ${true}`
              ));
            }
          }
        }
        rates.stepMultipliersTable = stepMultipliersTable;
        await Clients.updateOne({ _id: clientId }, { rates });
      }
      break;
    case differenceOperationType.JustDelete:
      for (let { _id: clientId, rates } of clients) {
        let { stepMultipliersTable } = rates;
        for (let stepToDelete of itemsToDelete) {
          stepMultipliersTable = stepMultipliersTable.filter(item => (
            `${item.step} ${item.unit}` !== `${stepToDelete._id} ${oldUnit._id}`
          ));
        }
        rates.stepMultipliersTable = stepMultipliersTable;
        await Clients.updateOne({ _id: clientId }, { rates });
      }
      break;
    case differenceOperationType.JustAdd:
      const newMultiplierCombinations = [];
      for (let stepToReplace of itemsToAdd) {
        const { _id } = stepToReplace;
        const { calculationUnit } = await Step.findOne({ _id });
        const neededUnit = calculationUnit.find(unit => unit.toString() === oldUnit._id.toString());
        const { sizes } = await Units.findOne({ _id: neededUnit });
        let sameCombination;
        let deleteSize;
        if (sizes.length) {
          deleteSize = true;
          sizes.forEach(size => {
            for (let { rates } of clients) {
              let { stepMultipliersTable } = rates;
              sameCombination = stepMultipliersTable.find(item => (
                `${item.step} ${item.unit} ${item.size}` === `${_id} ${oldUnit._id} ${size}`
              ));
              if (!sameCombination) {
                newMultiplierCombinations.push({
                  step: _id,
                  unit: neededUnit,
                  size,
                });
              }
            }
          });
        } else {
          for (let { rates } of clients) {
            const { stepMultipliersTable } = rates;
            sameCombination = stepMultipliersTable.find(item => (
              `${item.step} ${item.unit} ${item.size}` === `${_id} ${oldUnit._id} ${1}`
            ));
            if (!sameCombination) {
              newMultiplierCombinations.push({
                step: _id,
                unit: neededUnit,
                size: 1,
                defaultSize: true
              });
            }
          }
        }
        for (let { _id: clientId, rates } of clients) {
          let { stepMultipliersTable } = rates;
          if (deleteSize) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.defaultSize}` !== `${item.step} ${item.unit} ${true}`
            ));
          }
          rates.stepMultipliersTable = [...stepMultipliersTable, ...newMultiplierCombinations];
          await Clients.updateOne({ _id: clientId }, { rates });
        }
      }
      break;
  }
};

const checkSizeDifference = async (oldUnit, updatedSteps, sizeDifferences) => {
  const { sizeDifference, newSizes, deletedSizes } = sizeDifferences;
  const clients = await Clients.find();
  switch (sizeDifference) {
    default:
    case 'Just added':
      for (let { _id: clientId, rates } of clients) {
        let { stepMultipliersTable } = rates;
        for (let size of newSizes) {
          for (let step of updatedSteps) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.defaultSize}` !== `${item.step} ${item.unit} ${true}`
            ));
            stepMultipliersTable.push({
              step: step._id,
              unit: oldUnit._id,
              size,
            });
          }
        }
        rates.stepMultipliersTable = stepMultipliersTable;
        await Clients.updateOne({ _id: clientId }, { rates });
      }
      break;
    case 'Just deleted':
      for (let { _id: clientId, rates } of clients) {
        let { stepMultipliersTable } = rates;
        for (let step of updatedSteps) {
          for (let size of deletedSizes) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.size}` !== `${step._id} ${oldUnit._id} ${size}`
            ));
          }
          stepMultipliersTable.push({
            step: step._id,
            unit: oldUnit._id,
            size: 1,
            defaultSize: true
          });
        }
        rates.stepMultipliersTable = stepMultipliersTable;
        await Clients.updateOne({ _id: clientId }, { rates });
      }
      break;
    case 'Added and deleted':
      for (let { _id: clientId, rates } of clients) {
        let { stepMultipliersTable } = rates;
        for (let step of updatedSteps) {
          for (let size of deletedSizes) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.size}` !== `${step._id} ${oldUnit._id} ${size}`
            ));
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.defaultSize}` !== `${item.step} ${item.unit} ${true}`
            ));
          }
          for (let size of newSizes) {
            stepMultipliersTable.push({
              step: step._id,
              unit: oldUnit._id,
              size,
            });
          }
        }
        rates.stepMultipliersTable = stepMultipliersTable;
        await Clients.updateOne({ _id: clientId }, { rates });
      }
  }
};


module.exports = { updateRates };
