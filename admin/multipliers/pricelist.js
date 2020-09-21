const { Pricelist, Step, Units, Languages, Industries, CurrencyRatio } = require('../models');
const { getFilteredBasicPrices } = require('./basicPrice');
const { getFilteredStepMultiplier } = require('./stepMultipiers');
const lodash = require('lodash');
const getPercentage = (number, percentage) => number * (percentage / 100);
const { differenceOperationType } = require('../enums/differenceOperationType');

const getPricelistCombinations = async (priceListId, filters) => {
  const { countFilter, industryFilter } = filters;
  const getAllIndustries = await Industries.find();
  const basicPricesTable = await getFilteredBasicPrices(filters, priceListId, false);
  const stepMultipliersTable = await getFilteredStepMultiplier(filters, priceListId, false);
  const { industryMultipliersTable } = await Pricelist.findOne({ _id: priceListId }, { industryMultipliersTable: 1 }).populate('industryMultipliersTable.industry');
  const industryMultipliers = industryFilter ? industryMultipliersTable.filter(({ industry }) => industry.name === industryFilter) : industryMultipliersTable;
  const priceListCombinations = [];
  stepMultipliersTable.forEach(({ step, unit, size, multiplier: stepMultiplierValue, euroMinPrice, usdMinPrice, gbpMinPrice }) => {
    basicPricesTable.forEach(({ sourceLanguage, targetLanguage, euroBasicPrice, usdBasicPrice, gbpBasicPrice }) => {
      industryMultipliers.forEach(({ industry, multiplier: industryMultiplierValue }) => {
        priceListCombinations.push({
          sourceLanguage,
          targetLanguage,
          step,
          unit,
          size,
          industry: industry.name,
          eurPrice: multiplyPrices(euroBasicPrice, stepMultiplierValue, size, industryMultiplierValue),
          euroMinPrice,
          usdPrice: multiplyPrices(usdBasicPrice, stepMultiplierValue, size, industryMultiplierValue),
          usdMinPrice,
          gbpPrice: multiplyPrices(gbpBasicPrice, stepMultiplierValue, size, industryMultiplierValue),
          gbpMinPrice,
          isGrouped: false,
        });
      });
    });
  });
  if (industryFilter) {
    return priceListCombinations.splice(countFilter, 25);
  }

  const groupedPriceLists = groupPriceList(priceListCombinations, getAllIndustries);
  return groupedPriceLists.splice(countFilter, 25);
};

const multiplyPrices = (basicPrice, firstPercentMultiplier, size, secondPercentMultiplier) => (
  +(
    getPercentage(basicPrice, firstPercentMultiplier) *
    Number(size) *
    (secondPercentMultiplier / 100)
  ).toFixed(2)
);

const groupPriceList = (arr, allIndustries) => {
  let result = [];

  source = lodash.groupBy(arr, function (item) {
    return item.sourceLanguage.lang;
  });
  lodash.forEach(source, function (value, target) {
    source[target] = lodash.groupBy(source[target], function (item) {
      return item.targetLanguage.lang;
    });
    lodash.forEach(source[target], function (value, step) {
      source[target][step] = lodash.groupBy(source[target][step], function (item) {
        return item.step.title;
      });
      lodash.forEach(source[target][step], function (value, size) {
        source[target][step][size] = lodash.groupBy(source[target][step][size], function (item) {
          return item.size;
        });
        lodash.forEach(source[target][step][size], function (value, unit) {
          source[target][step][size][unit] = lodash.groupBy(source[target][step][size][unit], function (item) {
            return item.unit.type;
          });
          for (const key in source[target][step][size][unit]) {
            if (source[target][step][size][unit].hasOwnProperty(key)) {
              const elements = source[target][step][size][unit][key];
              let exceptionsCounter = 0;
              let currentArray = [];
              let bigGroupCount = 0;
              let exceptions = [];

              const counter = elements.reduce(function (acc, cur) {
                if (!acc.hasOwnProperty(cur.eurPrice)) {
                  acc[cur.eurPrice] = 0;
                }
                acc[cur.eurPrice]++;
                return acc;
              }, {});

              let groupedResult = Object.keys(counter).map(function (elem) {
                return { sum: counter[elem], eurPrice: elem };
              });

              for (let i = 0; i < groupedResult.length; i++) {
                if (bigGroupCount < groupedResult[i].sum) {
                  bigGroupCount = groupedResult[i].sum;
                }
              }

              let ifDoubleBiggest = groupedResult.filter(item => item.sum == bigGroupCount);

              if (ifDoubleBiggest.length > 1) {
                currentArray.push(elements);
              } else {
                let findBigGroupData = elements.find(item => item.eurPrice == groupedResult.find(i => i.sum == bigGroupCount).eurPrice);
                findBigGroupData.count = groupedResult.find(item => item.sum == bigGroupCount).sum;
                currentArray.push(findBigGroupData);

                let anotherAmmount = groupedResult.filter(item => item.sum !== bigGroupCount).map(item => item.eurPrice);

                anotherAmmount.forEach(element => {
                  let childElements = elements.filter(item => item.eurPrice == element);
                  for (let i = 0; i < childElements.length; i++) {
                    childElements[i].count = 0;
                    currentArray.push(childElements[i]);
                  }
                });

                let countElentsInGroup;
                let allCountElements = allIndustries.filter(item => item.active).length;

                currentArray.filter(item => {
                  if (item.count == bigGroupCount) {
                    countElentsInGroup = item.count;
                  }
                });

                if (allCountElements * 0.65 > countElentsInGroup) {
                  currentArray.push(...elements);
                } else {
                  currentArray = currentArray.map(item => {
                    if (item.count == bigGroupCount) {
                      item.industry = 'All';
                    }
                    return item;
                  });

                  currentArray.forEach(element => {
                    element.industry !== 'All' && exceptions.push(element.industry);
                    element.industry !== 'All' && exceptionsCounter++;
                  });

                  currentArray.forEach((element) => {
                    let allExeptions = '';
                    if (exceptions.length) {
                      for (const industry of exceptions) {
                        allExeptions += ' ' + industry + ', ';
                      }
                    }
                    if (element.industry == 'All') {
                      element.industry = allExeptions.length ? `All, except: ${allExeptions}` : 'All';
                    }
                  });
                }
              }
              result.push(...currentArray);
            }
          }
        });
      });
    });
  });
  return result;
};

const addNewMultiplier = async (key, newMultiplierId) => {
  try {
    const pricelists = await Pricelist.find();
    const currencyRatio = await CurrencyRatio.find();
    let newMultiplier;
    let newMultiplierCombinations = [];
    switch (key) {
      default:
      case 'Step':
        newMultiplier = await Step.findOne({ _id: newMultiplierId });
        newMultiplierCombinations = await getMultiplierCombinations(newMultiplier, 'Step', currencyRatio[0]);
        for (let { _id, stepMultipliersTable } of pricelists) {
          await Pricelist.updateOne({ _id }, { stepMultipliersTable: [...stepMultipliersTable, ...newMultiplierCombinations] });
        }
        break;
      case 'Unit':
        newMultiplier = await Units.findOne({ _id: newMultiplierId });
        newMultiplierCombinations = await getMultiplierCombinations(newMultiplier, 'Unit', currencyRatio[0]);
        for (let { _id, stepMultipliersTable } of pricelists) {
          await Pricelist.updateOne({ _id }, { stepMultipliersTable: [...stepMultipliersTable, ...newMultiplierCombinations] });
        }
        break;
      case 'Industry':
        newMultiplier = await Industries.findOne({ _id: newMultiplierId });
        for (let { _id, industryMultipliersTable } of pricelists) {
          industryMultipliersTable.push({
            industry: newMultiplier._id
          });
          await Pricelist.updateOne({ _id }, { industryMultipliersTable });
        }
        break;
      case 'LanguagePair':
        newMultiplier = await Languages.findOne({ _id: newMultiplierId });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in addNewMultiplier');
  }
};

//TODO: Add sizes replacement if they are not empty,
// if you add size for existing combination, you should replace them with actual size, and delete the default ones
const updateMultiplier = async (key, oldMultiplier) => {
  switch (key) {
    default:
    case 'Step':
      const oldStep = oldMultiplier;
      const updatedStep = await Step.findOne({ _id: oldStep._id });
      const unitDifferences = getArrayDifference(oldStep.calculationUnit, updatedStep.calculationUnit, 'type');
      const isStepActivityChanged = activityChange(oldStep, updatedStep, 'isActive');
      if (isStepActivityChanged) {
        await updateActiveSteps(isStepActivityChanged, oldStep._id);
      }
      if (unitDifferences) {
        await checkStepDifference(unitDifferences, oldStep);
      }
      break;
    case 'Unit':
      const oldUnit = oldMultiplier;
      const updatedUnit = await Units.findOne({ _id: oldUnit._id });
      const stepDifferences = getArrayDifference(oldUnit.steps, updatedUnit.steps, 'title');
      const { sizes: oldSizes } = oldUnit;
      const { sizes: updatedSizes } = updatedUnit;
      const sizeDifferences = getSizeDifference(oldSizes, updatedSizes);
      const isUnitActivityChanged = activityChange(oldUnit, updatedUnit, 'active');
      if (isUnitActivityChanged) {
        await updateActiveUnits(isUnitActivityChanged, oldUnit._id);
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
        await updatedActiveIndustry(isIndustryActivityChanged, oldIndustry._id);
      }
  }
};

const activityChange = (oldExample, updatedExample, activityKey) => {
  if (oldExample[activityKey] && !updatedExample[activityKey]) {
    return 'Not active';
  } else if (!oldExample[activityKey] && updatedExample[activityKey]) {
    return 'Active';
  }
};

const updateActiveUnits = async (activityStatus, unitId) => {
  const pricelists = await Pricelist.find();
  const currencyRatio = await CurrencyRatio.find();
  const { USD, GBP } = currencyRatio[0];
  if (activityStatus === differenceOperationType.JustDelete) {
    for (let { _id, stepMultipliersTable } of pricelists) {
      stepMultipliersTable = stepMultipliersTable.filter(item => item.unit.toString() !== unitId);
      await Pricelist.updateOne({ _id }, { stepMultipliersTable });
    }
  } else if (activityStatus === differenceOperationType.JustAdd) {
    const neededUnit = await Units.findOne({ _id: unitId });
    const { steps } = neededUnit;
    let sameCombination;
    const newMultiplierCombinations = [];
    for (let { _id } of steps) {
      if (neededUnit.sizes.length) {
        neededUnit.sizes.forEach(size => {
          for (let { stepMultipliersTable } of pricelists) {
            sameCombination = stepMultipliersTable.find(item => (
              `${item.step} ${item.unit} ${item.size}` === `${_id} ${unitId} ${size}`
            ));
          }
          if (!sameCombination) {
            newMultiplierCombinations.push({
              euroMinPrice: 1,
              usdMinPrice: USD,
              gbpMinPrice: GBP,
              step: _id,
              unit: neededUnit._id,
              size,
            });
          }
        });
      } else {
        for (let { stepMultipliersTable } of pricelists) {
          sameCombination = stepMultipliersTable.find(item => (
            `${item.step} ${item.unit} ${item.size}` === `${_id} ${unitId} ${1}`
          ));
        }
        if (!sameCombination) {
          newMultiplierCombinations.push({
            euroMinPrice: 1,
            usdMinPrice: USD,
            gbpMinPrice: GBP,
            step: _id,
            unit: neededUnit._id,
            size: 1,
            defaultSize: true,
          });
        }
      }
    }
    for (let { _id, stepMultipliersTable } of pricelists) {
      await Pricelist.updateOne({ _id },
        { stepMultipliersTable: [...stepMultipliersTable, ...newMultiplierCombinations] });
    }
  }
};

const updateActiveSteps = async (activityStatus, stepId) => {
  const pricelists = await Pricelist.find();
  const currencyRatio = await CurrencyRatio.find();
  const { USD, GBP } = currencyRatio[0];
  if (activityStatus === 'Not Active') {
    for (let { _id, stepMultipliersTable } of pricelists) {
      stepMultipliersTable = stepMultipliersTable.filter(item => item.step.toString() !== stepId);
      await Pricelist.updateOne({ _id }, { stepMultipliersTable });
    }
  } else if (activityStatus === 'Active') {
    const neededStep = await Step.findOne({ _id: stepId });
    const { calculationUnit } = neededStep;
    let sameCombination;
    const newMultiplierCombinations = [];
    for (let unitId of calculationUnit) {
      const { sizes } = await Units.findOne({ _id: unitId });
      if (sizes.length) {
        sizes.forEach(size => {
          for (let { stepMultipliersTable } of pricelists) {
            sameCombination = stepMultipliersTable.find(item => (
              `${item.step} ${item.unit} ${item.size}` === `${stepId} ${_id} ${size}`
            ));
          }
          if (!sameCombination) {
            newMultiplierCombinations.push({
              euroMinPrice: 1,
              usdMinPrice: USD,
              gbpMinPrice: GBP,
              step: stepId,
              unit: unitId,
              size,
            });
          }
        });
      } else {
        for (let { stepMultipliersTable } of pricelists) {
          sameCombination = stepMultipliersTable.find(item => (
            `${item.step} ${item.unit} ${item.size}` === `${stepId} ${_id} ${1}`
          ));
        }
        if (!sameCombination) {
          newMultiplierCombinations.push({
            euroMinPrice: 1,
            usdMinPrice: USD,
            gbpMinPrice: GBP,
            step: stepId,
            unit: unitId,
            size: 1,
            defaultSize: true,
          });
        }
      }
    }
    for (let { _id, stepMultipliersTable } of pricelists) {
      await Pricelist.updateOne({ _id },
        { stepMultipliersTable: [...stepMultipliersTable, ...newMultiplierCombinations] });
    }
  }
};

const updatedActiveIndustry = async (activityStatus, industryId) => {
  const pricelists = await Pricelist.find();
  if (activityStatus === 'Not active') {
    for (let { _id, industryMultipliersTable } of pricelists) {
      industryMultipliersTable = industryMultipliersTable.filter(({ industry }) => industry.toString() !== industryId);
      await Pricelist.updateOne({ _id }, { industryMultipliersTable });
    }
  } else if (activityStatus === 'Active') {
    for (let { _id, industryMultipliersTable } of pricelists) {
      industryMultipliersTable.push({
        industry: industryId
      });
      await Pricelist.updateOne({ _id }, { industryMultipliersTable });
    }
  }
};

const checkUnitDifference = async (stepDifferences, oldUnit) => {
  const pricelists = await Pricelist.find();
  const currencyRatio = await CurrencyRatio.find();
  const { USD, GBP } = currencyRatio[0];
  const { difference, itemsToAdd, itemsToDelete } = stepDifferences;
  switch (difference) {
    default:
    case differenceOperationType.DeleteAndReplace || differenceOperationType.JustReplace || differenceOperationType.AddAndReplace:
      for (let { _id, stepMultipliersTable } of pricelists) {
        let deleteSize;
        for (let stepToReplace of itemsToAdd) {
          const stepId = stepToReplace._id;
          const { calculationUnit } = await Step.findOne({ _id: stepId });
          if (calculationUnit.length) {
            for (let unitId of calculationUnit) {
              const { sizes } = await Units.findOne({ _id: unitId });
              if (sizes.length) {
                deleteSize = true;
                for (let i = 0; i < sizes.length; i += 1) {
                  stepToReplace = {
                    usdMinPrice: USD,
                    gbpMinPrice: GBP,
                    step: stepId,
                    unit: unitId,
                    size: sizes[i],
                  };
                  stepMultipliersTable.push(stepToReplace);
                }
              } else {
                stepToReplace = {
                  usdMinPrice: USD,
                  gbpMinPrice: GBP,
                  step: stepId,
                  unit: unitId,
                  size: 1,
                  defaultSize: true,
                };
                stepMultipliersTable.push(stepToReplace);
              }
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
        await Pricelist.updateOne({ _id }, { stepMultipliersTable });
      }
      break;
    case differenceOperationType.JustDelete:
      for (let { _id, stepMultipliersTable } of pricelists) {
        for (let stepToDelete of itemsToDelete) {
          stepMultipliersTable = stepMultipliersTable.filter(item => (
            `${item.step} ${item.unit}` !== `${stepToDelete._id} ${oldUnit._id}`
          ));
        }
        await Pricelist.updateOne({ _id }, { stepMultipliersTable });
      }
      break;
    case differenceOperationType.JustAdd:
      const newMultiplierCombinations = [];
      for (let stepToReplace of itemsToAdd) {
        const { _id } = stepToReplace;
        const { calculationUnit } = await Step.findOne({ _id });
        const neededUnit = calculationUnit.find(unit => unit._id === oldUnit._id);
        const { sizes } = await Units.findOne({ _id: neededUnit });
        let sameCombination;
        let deleteSize;
        if (sizes.length) {
          deleteSize = true;
          sizes.forEach(size => {
            for (let { stepMultipliersTable } of pricelists) {
              sameCombination = stepMultipliersTable.find(item => (
                `${item.step} ${item.unit} ${item.size}` === `${_id} ${oldUnit._id} ${size}`
              ));
            }
            if (!sameCombination) {
              newMultiplierCombinations.push({
                euroMinPrice: 1,
                usdMinPrice: USD,
                gbpMinPrice: GBP,
                step: _id,
                unit: neededUnit,
                size,
              });
            }
          });
        } else {
          for (let { stepMultipliersTable } of pricelists) {
            sameCombination = stepMultipliersTable.find(item => (
              `${item.step} ${item.unit} ${item.size}` === `${_id} ${oldUnit._id} ${1}`
            ));
          }
          if (!sameCombination) {
            newMultiplierCombinations.push({
              euroMinPrice: 1,
              usdMinPrice: USD,
              gbpMinPrice: GBP,
              step: _id,
              unit: neededUnit,
              size: 1,
              defaultSize: true
            });
          }
        }
        for (let { _id, stepMultipliersTable } of pricelists) {
          if (deleteSize) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.defaultSize}` !== `${item.step} ${item.unit} ${true}`
            ));
          }
          await Pricelist.updateOne({ _id },
            { stepMultipliersTable: [...stepMultipliersTable, ...newMultiplierCombinations] });
        }
      }
      break;
  }
};

const checkSizeDifference = async (oldUnit, updatedSteps, sizeDifferences) => {
  const pricelists = await Pricelist.find();
  const currencyRatio = await CurrencyRatio.find();
  const { USD, GBP } = currencyRatio[0];
  const { sizeDifference, newSizes, deletedSizes } = sizeDifferences;
  switch (sizeDifference) {
    default:
    case differenceOperationType.JustAdd:
      for (let { _id, stepMultipliersTable } of pricelists) {
        for (let size of newSizes) {
          for (let step of updatedSteps) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.defaultSize}` !== `${item.step} ${item.unit} ${true}`
            ));
            stepMultipliersTable.push({
              euroMinPrice: 1,
              usdMinPrice: USD,
              gbpMinPrice: GBP,
              step: step._id,
              unit: oldUnit._id,
              size,
            });
          }
        }
        await Pricelist.updateOne({ _id }, { stepMultipliersTable });
      }
      break;
    case differenceOperationType.JustDelete:
      for (let { _id, stepMultipliersTable } of pricelists) {
        for (let size of deletedSizes) {
          for (let step of updatedSteps) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.size}` !== `${step._id} ${oldUnit._id} ${size}`
            ));
          }
        }
        await Pricelist.updateOne({ _id }, { stepMultipliersTable });
      }
      break;
    case differenceOperationType.AddAndReplace:
      for (let { _id, stepMultipliersTable } of pricelists) {
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
              euroMinPrice: 1,
              usdMinPrice: USD,
              gbpMinPrice: GBP,
              step: step._id,
              unit: oldUnit._id,
              size,
            });
          }
        }
        await Pricelist.updateOne({ _id }, { stepMultipliersTable });
      }
  }
};

const getSizeDifference = (oldSizes, updatedSizes) => {
  let sizeDifference;
  let deletedSizes = oldSizes.filter(oldSize => !updatedSizes.find(updatedSize => updatedSize === oldSize));
  let newSizes = updatedSizes.filter(updatedSize => !oldSizes.find(oldSize => oldSize === updatedSize));
  if (!!deletedSizes.length && !!newSizes.length) {
    sizeDifference = differenceOperationType.AddAndReplace;
  } else if (!!deletedSizes.length && !!!newSizes.length) {
    sizeDifference = differenceOperationType.JustDelete;
  } else if (!!!deletedSizes.length && !!newSizes.length) {
    sizeDifference = differenceOperationType.JustAdd;
  } else {
    sizeDifference = '';
  }
  return {
    sizeDifference,
    newSizes,
    deletedSizes
  };
};

const getArrayDifference = (oldArray, updatedArray, key) => {
  let itemsToAdd = arrayComparer(updatedArray, oldArray, key);
  let itemsToDelete = arrayComparer(oldArray, updatedArray, key);
  if (oldArray.length > updatedArray.length) {
    if (itemsToAdd.length) {
      return { difference: differenceOperationType.DeleteAndReplace, itemsToAdd, itemsToDelete };
    } else {
      return { difference: differenceOperationType.JustDelete, itemsToDelete };
    }

  } else if (oldArray.length === updatedArray.length && itemsToAdd.length) {
    return { difference: differenceOperationType.JustReplace, itemsToAdd, itemsToDelete };
  } else if (updatedArray.length > oldArray.length) {
    if (itemsToAdd.length && itemsToDelete.length === 0) {
      return { difference: differenceOperationType.JustAdd, itemsToAdd };
    } else {
      return { difference: differenceOperationType.AddAndReplace, itemsToAdd, itemsToDelete };
    }
  }
};

const arrayComparer = (oldCondition, newCondition, key) => oldCondition.filter(({ [key]: keyFromOld }) => (
  !newCondition.some(({ [key]: keyFromChanged }) => keyFromOld === keyFromChanged))
);

const checkStepDifference = async (unitDifferences, oldStep) => {
  const pricelists = await Pricelist.find();
  const currencyRatio = await CurrencyRatio.find();
  const { USD, GBP } = currencyRatio[0];
  const { difference, itemsToAdd, itemsToDelete } = unitDifferences;
  switch (difference) {
    default:
    case differenceOperationType.DeleteAndReplace || differenceOperationType.JustReplace || differenceOperationType.AddAndReplace:
      for (let { _id, stepMultipliersTable } of pricelists) {
        let deleteSize;
        for (let unitToReplace of itemsToAdd) {
          const { _id, sizes } = await Units.findOne({ _id: unitToReplace._id });
          if (sizes.length) {
            deleteSize = true;
            for (let i = 0; i < sizes.length; i += 1) {
              unitToReplace = {
                usdMinPrice: USD,
                gbpMinPrice: GBP,
                step: oldStep._id,
                unit: _id,
                size: sizes[i],
              };
              stepMultipliersTable.push(unitToReplace);
            }
          } else {
            unitToReplace = {
              usdMinPrice: USD,
              gbpMinPrice: GBP,
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
        await Pricelist.updateOne({ _id }, { stepMultipliersTable });
      }
      break;
    case differenceOperationType.JustDelete:
      for (let { _id, stepMultipliersTable } of pricelists) {
        for (let unitToDelete of itemsToDelete) {
          stepMultipliersTable = stepMultipliersTable.filter(item => (
            `${item.step} ${item.unit}` !== `${oldStep._id} ${unitToDelete._id}`
          ));
        }
        await Pricelist.updateOne({ _id }, { stepMultipliersTable });
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
              euroMinPrice: 1,
              usdMinPrice: USD,
              gbpMinPrice: GBP,
              step: oldStep._id,
              unit: unitId,
              size,
            });
          });
        } else {
          newMultiplierCombinations.push({
            euroMinPrice: 1,
            usdMinPrice: USD,
            gbpMinPrice: GBP,
            step: oldStep._id,
            unit: unitId,
            size: 1,
            defaultSize: true,
          });
        }
        for (let { _id, stepMultipliersTable } of pricelists) {
          if (deleteSize) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit} ${item.defaultSize}` !== `${item.step} ${item.unit} ${true}`
            ));
          }
          await Pricelist.updateOne({ _id },
            { stepMultipliersTable: [...stepMultipliersTable, ...newMultiplierCombinations] });
        }
      }
      break;
  }
};


const getMultiplierCombinations = async (newMultiplier, key, { USD, GBP }) => {
  let combinations = [];
  if (key === 'Step') {
    const { _id, calculationUnit } = newMultiplier;
    if (calculationUnit.length) {
      for (let unitId of calculationUnit) {
        const { sizes } = await Units.findOne({ _id: unitId });
        if (sizes.length) {
          1;
          sizes.forEach(size => {
            combinations.push({
              euroMinPrice: 1,
              usdMinPrice: USD,
              gbpMinPrice: GBP,
              step: _id,
              unit: unitId,
              size,
            });
          });
        } else {
          combinations.push({
            euroMinPrice: 1,
            usdMinPrice: USD,
            gbpMinPrice: GBP,
            step: _id,
            unit: unitId,
            size: 1
          });
        }
      }
    }
  }
  if (key === 'Unit') {
    const { _id, sizes, steps } = newMultiplier;
    if (sizes.length) {
      sizes.forEach(size => {
        steps.forEach(step => {
          combinations.push({
            euroMinPrice: 1,
            usdMinPrice: USD,
            gbpMinPrice: GBP,
            step: step._id,
            unit: _id,
            size,
          });
        });
      });
    } else {
      steps.forEach(step => {
        combinations.push({
          euroMinPrice: 1,
          usdMinPrice: USD,
          gbpMinPrice: GBP,
          step: step._id,
          unit: _id,
          size: 1
        });
      });
    }
  }
  return combinations;
};

module.exports = {
  getPricelistCombinations,
  getArrayDifference,
  addNewMultiplier,
  updateMultiplier,
  getPercentage,
  multiplyPrices,
  getSizeDifference,
  activityChange,
  arrayComparer
};
