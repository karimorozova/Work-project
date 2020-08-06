const { Units, Clients, Services, Step } = require('../models');
const { getMultipliersDifference, getSizeDifference, activityChange } = require('../multipliers/pricelist');

const updateRates = async (key, oldMultiplier) => {
  switch (key) {
    default:
    case 'Step':
      const oldStep = oldMultiplier;
      const updatedStep = await Step.findOne({ _id: oldStep._id });
      const unitDifferences = getMultipliersDifference(
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
      const updatedUnit = await Units.findOne({ _id: oldUnit._id });
      const stepDifferences = getMultipliersDifference(oldUnit.steps, updatedUnit.steps, 'title');
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

const checkStepDifference = async ({ difference, itemsToReplace, itemsToDelete }, oldStep) => {
  const clients = await Clients.find();
  switch (difference) {
    default:
    case 'Deleted and replaced' || 'Just replaced' || 'Added and replaced':
      for (let { _id: clientId, rates } of clients) {
        let { stepMultipliersTable } = rates;
        let deleteSize;
        for (let unitToReplace of itemsToReplace) {
          const { serviceId } = unitToReplace;
          const { _id, sizes } = await Units.findOne({ _id: unitToReplace._id });
          if (sizes.length) {
            deleteSize = true;
            for (let i = 0; i < sizes.length; i += 1) {
              unitToReplace = {
                serviceId: serviceId.toString(),
                step: oldStep._id,
                unit: _id,
                size: sizes[i],
              };
              stepMultipliersTable.push(unitToReplace);
            }
          } else {
            unitToReplace = {
              serviceId: serviceId.toString(),
              step: oldStep._id,
              unit: _id,
              size: 1,
              defaultSize: true
            };
            stepMultipliersTable.push(unitToReplace);
          }
        }
        for (let unitToDelete of itemsToDelete) {
          stepMultipliersTable = stepMultipliersTable.filter(item => (
            `${item.step} ${item.unit}` !== `${oldStep._id} ${unitToDelete._id}`
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
    case 'Just deleted':
      for (let { _id: clientId, rates } of clients) {
        let { stepMultipliersTable } = rates;
        for (let unitToDelete of itemsToDelete) {
          stepMultipliersTable = stepMultipliersTable.filter(item => (
            `${item.step} ${item.unit}` !== `${oldStep._id} ${unitToDelete._id}`
          ));
        }
        rates.stepMultipliersTable = stepMultipliersTable;
        await Clients.updateOne({ _id: clientId }, { rates });
      }
      break;
    case 'Just added':
      const newMultiplierCombinations = [];
      for (let unitToReplace of itemsToReplace) {
        const { sizes, _id: unitId, serviceId } = unitToReplace;
        let deleteSize;
        if (sizes.length) {
          deleteSize = true;
          sizes.forEach(size => {
            newMultiplierCombinations.push({
              serviceId: serviceId.toString(),
              step: oldStep._id,
              unit: unitId,
              size,
            });
          });
        } else {
          newMultiplierCombinations.push({
            serviceId: serviceId.toString(),
            step: oldStep._id,
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

const checkUnitDifference = async ({ difference, itemsToReplace, itemsToDelete }, oldUnit) => {
  const clients = await Clients.find();
  switch (difference) {
    default:
    case 'Deleted and replaced' || 'Just replaced' || 'Added and replaced':
      for (let { _id: clientId, rates } of clients) {
        let { stepMultipliersTable } = rates;
        let deleteSize;
        for (let stepToReplace of itemsToReplace) {
          const { serviceId } = stepToReplace;
          const stepId = stepToReplace._id;
          const { calculationUnit } = await Step.findOne({ _id: stepId });
          if (calculationUnit.length) {
            for (let { _id: unitId, sizes } of calculationUnit) {
              if (sizes.length) {
                deleteSize = true;
                for (let i = 0; i < sizes.length; i += 1) {
                  stepToReplace = {
                    serviceId: serviceId.toString(),
                    step: stepId,
                    unit: unitId,
                    size: sizes[i],
                  };
                  stepMultipliersTable.push(stepToReplace);
                }
              } else {
                stepToReplace = {
                  serviceId: serviceId.toString(),
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
    case 'Just deleted':
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
    case 'Just added':
      const newMultiplierCombinations = [];
      for (let stepToReplace of itemsToReplace) {
        const { _id } = stepToReplace;
        const { serviceId } = stepToReplace;
        const { calculationUnit } = await Step.findOne({ _id });
        const neededUnit = calculationUnit.find(unit => unit._id === oldUnit._id);
        let sameCombination;
        let deleteSize;
        if (neededUnit.sizes.length) {
          deleteSize = true;
          neededUnit.sizes.forEach(size => {
            for (let { rates } of clients) {
              let { stepMultipliersTable } = rates;
              sameCombination = stepMultipliersTable.find(item => (
                `${item.step} ${item.unit} ${item.size}` === `${_id} ${oldUnit._id} ${size}`
              ));
              if (!sameCombination) {
                newMultiplierCombinations.push({
                  serviceId: serviceId.toString(),
                  step: _id,
                  unit: neededUnit._id,
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
                serviceId: serviceId.toString(),
                step: _id,
                unit: neededUnit._id,
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
      for (let { _id: clientId, rates, services } of clients) {
        let { stepMultipliersTable } = rates;
        for (let size of newSizes) {
          for (let step of updatedSteps) {
            const serviceIds = await getServiceId(services, step);
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.defaultSize}` !== `${item.step} ${item.unit} ${true}`
            ));
            for (let id of serviceIds) {
              stepMultipliersTable.push({
                serviceId: id.toString(),
                step: step._id,
                unit: oldUnit._id,
                size,
              });
            }
          }
        }
        rates.stepMultipliersTable = stepMultipliersTable;
        await Clients.updateOne({ _id: clientId }, { rates });
      }
      break;
    case 'Just deleted':
      for (let { _id: clientId, rates, services } of clients) {
        let { stepMultipliersTable } = rates;
        for (let step of updatedSteps) {
          const serviceIds = await getServiceId(services, step);
          for (let size of deletedSizes) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.size}` !== `${step._id} ${oldUnit._id} ${size}`
            ));
          }
          for (let id of serviceIds) {
            stepMultipliersTable.push({
              serviceId: id.toString(),
              step: step._id,
              unit: oldUnit._id,
              size: 1,
              defaultSize: true
            });
          }
        }
        rates.stepMultipliersTable = stepMultipliersTable;
        await Clients.updateOne({ _id: clientId }, { rates });
      }
      break;
    case 'Added and deleted':
      for (let { _id: clientId, rates, services } of clients) {
        let { stepMultipliersTable } = rates;
        for (let step of updatedSteps) {
          const serviceIds = await getServiceId(services, step);
          for (let size of deletedSizes) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.size}` !== `${step._id} ${oldUnit._id} ${size}`
            ));
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.defaultSize}` !== `${item.step} ${item.unit} ${true}`
            ));
          }
          for (let id of serviceIds) {
            for (let size of newSizes) {
              stepMultipliersTable.push({
                serviceId: id.toString(),
                step: step._id,
                unit: oldUnit._id,
                size,
              });
            }
          }
        }
        rates.stepMultipliersTable = stepMultipliersTable;
        await Clients.updateOne({ _id: clientId }, { rates });
      }
  }
};

const getServiceId = async (services, step) => {
  const serviceIds = [];
  for (let { service, _id } of services) {
    const { steps } = await Services.findOne({ _id: service }).populate('steps.step');
    const neededStepIndex = steps.findIndex(item => item.step._id.toString() === step._id);
    if (neededStepIndex !== -1) {
      serviceIds.push(_id);
    }
  }
  return serviceIds;
};


module.exports = { updateRates };
