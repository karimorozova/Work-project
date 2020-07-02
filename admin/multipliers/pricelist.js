const { Pricelist, Step, Units, Vendors, Languages, Industries, CurrencyRatio } = require('../models');
const { getFilteredBasicPrices } = require('./basicPrice');
const { getFilteredStepMultiplier } = require('./stepMultipiers');
const lodash = require('lodash');
const getPercentage = (number, percentage) => (number / 100) * percentage;

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
            eurPrice: +(getPercentage(euroBasicPrice, stepMultiplierValue) + getPercentage(euroBasicPrice, industryMultiplierValue)).toFixed(2),
            euroMinPrice,
            usdPrice: +(getPercentage(usdBasicPrice, stepMultiplierValue) + getPercentage(usdBasicPrice, industryMultiplierValue)).toFixed(2),
            usdMinPrice,
            gbpPrice: +(getPercentage(gbpBasicPrice, stepMultiplierValue) + getPercentage(gbpBasicPrice, industryMultiplierValue)).toFixed(2),
            gbpMinPrice,
            isGrouped: false,
          });
        });
      });
  });

  const groupedPriceLists = groupPriceList(priceListCombinations, getAllIndustries);
  return groupedPriceLists.splice(countFilter, 25)

  // return priceListCombinations.splice(countFilter, 25);
};

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
              let currentArray = [];
              
              const counter = elements.reduce(function (acc, cur) {
                if (!acc.hasOwnProperty(cur.eurPrice)) {
                  acc[cur.eurPrice] = 0;
                }
                acc[cur.eurPrice]++;
                return acc;
              }, {});

              let groupedResult = Object.keys(counter).map(function (elem) {
                return {sum: counter[elem], eurPrice: elem};
              });
              
              let bigGroupCount = 0;
              for (let i = 0; i < groupedResult.length; i++) {
                if(bigGroupCount < groupedResult[i].sum){
                  bigGroupCount = groupedResult[i].sum;
                }
              }

              let ifDoubleBiggest = groupedResult.filter(item => item.sum == bigGroupCount);

              if(ifDoubleBiggest.length > 1){
                currentArray.push(...elements)
              }else{
                let findBigGroupData = elements.find(item => item.eurPrice == groupedResult.find(i => i.sum == bigGroupCount).eurPrice)
                findBigGroupData.count = groupedResult.find(item => item.sum == bigGroupCount).sum                
                currentArray.push(findBigGroupData)

                let anotherAmmount = groupedResult.filter(item => item.sum !== bigGroupCount).map(item => item.eurPrice)

                anotherAmmount.forEach(element => {
                  
                  let childElements = elements.filter(item => item.eurPrice == element)
                  for (let i = 0; i < childElements.length; i++) {
                    childElements[i].count = 0;
                    currentArray.push(childElements[i])
                  }
                })

                currentArray = currentArray.map(item => {
                  if(item.count == bigGroupCount){
                    item.industry = 'All'
                  }
                  return item;
                })
                
                let exceptionsCounter = 0;
                let exceptions = [];
                currentArray.forEach(element => {
                  element.industry !== 'All' && exceptions.push(element.industry)
                  element.industry !== 'All' && exceptionsCounter++
                })              
  
                currentArray.forEach((element) => {
                  let allExeptions = '';                
                  if(exceptions.length){
                    for (const industry of exceptions) {
                      allExeptions += ' ' + industry + ', ';
                    }
                  }
                  if(element.industry == 'All'){
                    element.industry = allExeptions.length ? `All, except: ${allExeptions}` : 'All';
                  }
                });
              }

              result.push(...currentArray)
            }
          }
        })
      })
    })
  })
  return result;
}

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
// const { sizes: oldSizes } = oldUnit;
// const { sizes: updatedSizes } = updatedUnit;
// const deletedSteps = arrayComparer(oldUnit.steps, updatedUnit.steps, 'title');
// const addedSteps = arrayComparer(updatedUnit.steps, oldUnit.steps, 'title');
// if (deletedSteps.length) {
//   for (let { _id, stepMultipliersTable } of pricelists) {
//     for (let { _id: stepId } of deletedSteps) {
//       stepMultipliersTable = stepMultipliersTable.filter(item => (
//         `${item.step} ${item.unit}` !== `${stepId} ${oldUnit._id}`)
//       );
//       await Pricelist.updateOne({ _id }, { stepMultipliersTable });
//     }
//   }
// }
// if (addedSteps.length) {
//   for (let { _id: stepId } of addedSteps) {
//     for (let { _id, stepMultipliersTable } of pricelists) {
//       if (updatedSizes.length) {
//         updatedSizes.forEach(size => {
//           stepMultipliersTable.push({
//             usdMinPrice: USD,
//             gbpMinPrice: GBP,
//             step: stepId,
//             unit: oldUnit._id,
//             size,
//           })
//         })
//       } else {
//         stepMultipliersTable.push({
//           usdMinPrice: USD,
//           gbpMinPrice: GBP,
//           step: stepId,
//           unit: oldUnit._id,
//           size: 1,
//         })
//       }
//       await Pricelist.updateOne({ _id }, { stepMultipliersTable });
//     }
//   }
// }
// if (addedSteps.length) {
//   for (let { _id } of addedSteps) {
//     for (let oldStep of oldUnit.steps) {
//       const neededStep = await Step.findOne({ _id });
//       const { difference, itemsToReplace, itemsToDelete } =
//         getDifference(oldStep.calculationUnit, neededStep.calculationUnit);
//       console.log('difference: ', difference);
//       // await checkDifference(difference, itemsToReplace, itemsToDelete, oldStep);
//     }
//   }
// }

const updateMultiplier = async (key, oldMultiplier) => {
  const currencyRatio = await CurrencyRatio.find();
  const { USD, GBP } = currencyRatio[0];
  switch (key) {
    default:
    case 'Step':
      const oldStep = oldMultiplier;
      const updatedStep = await Step.findOne({ _id: oldStep._id });
      const { difference, itemsToReplace, itemsToDelete } =
        getStepDifference(oldStep.calculationUnit, updatedStep.calculationUnit);
      await checkStepDifference(difference, itemsToReplace, itemsToDelete, oldStep);
      break;
    case 'Unit':
      const oldUnit = oldMultiplier;
      const updatedUnit = await Units.findOne({ _id: oldUnit._id });
      const deletedSteps = arrayComparer(oldUnit.steps, updatedUnit.steps, 'title');
      if (deletedSteps.length) {
        for (let { _id, stepMultipliersTable } of pricelists) {
          for (let { _id: stepId } of deletedSteps) {
            stepMultipliersTable = stepMultipliersTable.filter(item => (
              `${item.step} ${item.unit}` !== `${stepId} ${oldUnit._id}`)
            );
            await Pricelist.updateOne({ _id }, { stepMultipliersTable });
          }
        }
      }
  }
};

/*
  добавили степ - смотря на сайзы - делаем новые степы,
  добавили сайзы - дублируем все степы с разными сайзами
  добавили юнит, степ и сайзы - бегаем по степам и сайзам юнита и создаем экземпляры,
  изменили сайз - ищем такую комбинацию степа и сайза и меняем его сайз,
  удалили сайз - удаляем все степы с удаленным сайзом,
  заменили степ с одного на другой и добавили или удалили сайз - ищем комбинацию юнит - степ и меняем его степ, либо добавляем комбинации с сайзами - либо удаляем комбинацииб
  добавили степы и сайзы - добавляем юниту нужные степы и создаем комбинации с сайзами
 */

const getUnitDifference = (oldUnit, updatedUnit) => {
  const addedSteps = arrayComparer(updatedUnit.steps, oldUnit.steps, 'title');
  if (oldUnit.steps.length < updatedUnit.steps.length) {

  }
}

const getStepDifference = (oldStep, updatedStep) => {
  let itemsToReplace = arrayComparer(updatedStep, oldStep, 'type');
  let itemsToDelete = arrayComparer(oldStep, updatedStep, 'type');
  if (oldStep.length > updatedStep.length) {
    if (itemsToReplace.length) {
      return { difference: 'Deleted and replaced', itemsToReplace, itemsToDelete };
    } else {
      return { difference: 'Just deleted', itemsToDelete };
    }
  } else if (oldStep.length === updatedStep.length) {
    if (itemsToReplace.length) {
      return { difference: 'Just replaced', itemsToReplace, itemsToDelete };
    }
  } else if (updatedStep.length > oldStep.length) {
    if (itemsToReplace.length && itemsToDelete.length === 0) {
      return { difference: 'Just added', itemsToReplace };
    } else {
      return { difference: 'Added and replaced', itemsToReplace, itemsToDelete };
    }
  }
};

const arrayComparer = (oldCondition, newCondition, key) => oldCondition.filter(({ [key]: keyFromOld }) => (
  !newCondition.some(({ [key]: keyFromChanged }) => keyFromOld === keyFromChanged))
);

const checkStepDifference = async (difference, itemsToReplace, itemsToDelete, oldStep) => {
  const pricelists = await Pricelist.find();
  const currencyRatio = await CurrencyRatio.find();
  const { USD, GBP } = currencyRatio[0];
  switch (difference) {
    default:
    case 'Deleted and replaced' || 'Just replaced' || 'Added and replaced':
      for (let { _id, stepMultipliersTable } of pricelists) {
        for (let itemToReplace of itemsToReplace) {
          const { _id, sizes } = await Units.findOne({ _id: itemToReplace._id });
          if (sizes.length) {
            for (let i = 0; i < sizes.length; i += 1) {
              itemToReplace = {
                usdMinPrice: USD,
                gbpMinPrice: GBP,
                step: oldStep._id,
                unit: _id,
                size: sizes[i],
              };
              stepMultipliersTable.push(itemToReplace);
            }
          } else {
            itemToReplace = {
              usdMinPrice: USD,
              gbpMinPrice: GBP,
              step: oldStep._id,
              unit: _id,
              size: 1
            };
            stepMultipliersTable.push(itemToReplace);
          }
        }
        for (let itemToDelete of itemsToDelete) {
          stepMultipliersTable = stepMultipliersTable.filter(item => (
            `${item.step} ${item.unit}` !== `${oldStep._id} ${itemToDelete._id}`
          ));
        }
        await Pricelist.updateOne({ _id }, { stepMultipliersTable });
      }
      break;
    case 'Just deleted':
      for (let { _id, stepMultipliersTable } of pricelists) {
        for (let itemToDelete of itemsToDelete) {
          stepMultipliersTable = stepMultipliersTable.filter(item => (
            `${item.step} ${item.unit}` !== `${oldStep._id} ${itemToDelete._id}`
          ));
        }
        await Pricelist.updateOne({ _id }, { stepMultipliersTable });
      }
      break;
    case 'Just added':
      const newMultiplierCombinations = [];
      for (let itemToReplace of itemsToReplace) {
        const { sizes, _id: unitId } = itemToReplace;
        if (sizes.length) {
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
            size: 1
          });
        }
        for (let { _id, stepMultipliersTable } of pricelists) {
          await Pricelist.updateOne({ _id }, { stepMultipliersTable: [...stepMultipliersTable, ...newMultiplierCombinations] });
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
      for (let { sizes, _id: unitId } of calculationUnit) {
        if (sizes.length) {
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

module.exports = { getPricelistCombinations, addNewMultiplier, updateMultiplier };
