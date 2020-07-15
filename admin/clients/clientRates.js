const { Clients, Step, Units, Industries } = require('../models');
const ObjectId = require('mongodb').ObjectID;
const { multiplyPrices } = require('../multipliers');
const _ = require('lodash');

const updateClientRates = async (clientId, itemIdentifier, updatedItem) => {
  const client = await Clients.findOne({ _id: clientId });
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = client.rates;
  let updatedPricelistTable;
  switch (itemIdentifier) {
    default:
    case 'Basic Price Table':
      const updatedBasicPriceTable = replaceOldItem(basicPricesTable, updatedItem);
      updatedPricelistTable = changePricelistTable(
        basicPricesTable,
        stepMultipliersTable,
        industryMultipliersTable,
        pricelistTable,
        updatedItem,
        itemIdentifier
      );
      client.rates.basicPricesTable = updatedBasicPriceTable;
      // await Clients.updateOne({ _id: clientId }, { rates: client.rates });
      break;
    case 'Step Multipliers Table':
      const updatedStepMultipliersTable = replaceOldItem(stepMultipliersTable, updatedItem);
      updatedPricelistTable = changePricelistTable(
        basicPricesTable,
        stepMultipliersTable,
        industryMultipliersTable,
        pricelistTable,
        updatedItem,
        itemIdentifier
      );
      client.rates.stepMultipliersTable = updatedStepMultipliersTable;
      // await Clients.updateOne({ _id: clientId }, { rates: client.rates });
      break;
    case 'Industry Multipliers Table':
      const updatedIndustryMultipliersTable = replaceOldItem(industryMultipliersTable, updatedItem);
      updatedPricelistTable = changePricelistTable(
        basicPricesTable,
        stepMultipliersTable,
        industryMultipliersTable,
        pricelistTable,
        updatedItem,
        itemIdentifier
      );
      client.rates.industryMultipliersTable = updatedIndustryMultipliersTable;
      // await Clients.updateOne({ _id: clientId }, { rates: client.rates });
      break;
  }
};

const replaceOldItem = (arr, replacementItem) => {
  const { _id } = replacementItem;
  const itemToUpdateIndex = findIndexToReplace(arr, _id);
  arr.splice(itemToUpdateIndex, 1, replacementItem);
  return arr;
};

const findIndexToReplace = (arr, searchItemId) => arr.findIndex(item => item._id.toString() === searchItemId);

// const defaultItems = [];
// defaultItems.push({
//   altered: item.altered,
//   serviceId: item.serviceId,
//   notification: item.notification,
//   _id: ObjectId(item._id),
//   sourceLanguage: item.sourceLanguage,
//   targetLanguage: item.targetLanguage,
//   step: item.step,
//   unit: item.unit,
//   size: item.size,
//   industry: item.industry,
// });

// const changePricelistTable = (
//   basicPricesTable,
//   stepMultipliersTable,
//   industryMultipliersTable,
//   pricelistTable,
//   updatedItem,
//   key) => {
//   let changedPricelistTable = [];
//   for (let item of pricelistTable) {
//     if (!item.altered && item.serviceId === updatedItem.serviceId) {
//       const neededBasicPriceItem = basicPricesTable.find(item => item.serviceId === updatedItem.serviceId);
//       const neededStepMultipliersItems = stepMultipliersTable.find(step => step.step.)
//       const neededIndustryItem = industryMultipliersTable.find(item => item.serviceId === updatedItem.serviceId);
//       switch (key) {
//         default:
//         case 'Basic Price Table':
//           item.basicPrice = multiplyPrices(updatedItem)
//           changedPricelistTable.push()
//           break;
//         case 'Step Multipliers Table':
//
//           break;
//         case 'Industry Multipliers Table':
//           break;
//       }
//     } else {
//       changedPricelistTable.push(item);
//     }
//   }
//   // console.log('CHANGED PRICELIst TABLE', changedPricelistTable);
//   return changedPricelistTable;
// };

//TODO: Add source-language existence check
const addNewRateComponents = async (clientId, newObj, serviceId) => {
  const { sourceLanguage, targetLanguage, service, industry } = newObj;
  const client = await Clients.findOne({ _id: clientId });
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = client.rates;
  basicPricesTable.push({
    serviceId: serviceId.toString(),
    type: 'Duo',
    sourceLanguage: sourceLanguage._id,
    targetLanguage: targetLanguage._id
  });
  const stepMultipliersCombinations = await getStepMultipliersCombinations(service, serviceId);
  stepMultipliersTable.push(...stepMultipliersCombinations);
  industryMultipliersTable.push({
    serviceId: serviceId.toString(),
    industry: industry._id
  });
  const priceListCombinations = await getPricelistCombinations(
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable,
  );
  pricelistTable.push(...priceListCombinations);
  await Clients.updateOne({ _id: clientId },
    { rates: { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } }
  );
};

//TODO: Add clients currencies for combinations
const getStepMultipliersCombinations = async ({ steps }, serviceId) => {
  const stepUnitSizeCombinations = [];
  for (let { step } of steps) {
    const { calculationUnit } = await Step.findOne({ _id: step });
    if (!calculationUnit.length) {
      return [];
    } else {
      for (let { _id, sizes } of calculationUnit) {
        if (sizes.length) {
          sizes.forEach(size => {
            stepUnitSizeCombinations.push({
              serviceId: serviceId.toString(),
              step: step._id,
              unit: _id,
              size
            });
          });
        } else {
          stepUnitSizeCombinations.push({
            serviceId: serviceId.toString(),
            step: step._id,
            unit: _id,
            size: 1,
            defaultSize: true,
          });
        }
      }
    }
  }
  return stepUnitSizeCombinations;
};

const getPricelistCombinations = async (basicPricesTable, stepMultipliersTable, industryMultipliersTable) => {
  const priceListCombinations = [];
  for (let { step, serviceId, unit, size, multiplier: stepMultiplierValue } of stepMultipliersTable) {
    for (let { sourceLanguage, targetLanguage, basicPrice } of basicPricesTable) {
      for (let { industry, multiplier: industryMultiplierValue } of industryMultipliersTable) {
        priceListCombinations.push({
          serviceId: serviceId.toString(),
          sourceLanguage,
          targetLanguage,
          step,
          unit,
          size,
          industry,
          price: multiplyPrices(basicPrice, stepMultiplierValue, industryMultiplierValue),
        });
      }
    }
  }
  return priceListCombinations;
};

const syncClientRatesAndServices = async (clientId, changedData, oldData) => {
  const client = await Clients.findOne({ _id: clientId });
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = client.rates;
  const neededBasicPriceIndex = basicPricesTable.findIndex(item => item.serviceId === changedData._id);
  const neededIndustryIndex = industryMultipliersTable.findIndex(item => item.serviceId === changedData._id);
  const difference = getObjDifferences(changedData, oldData);
  if (difference.sourceLanguage) {
    client.rates.basicPricesTable[neededBasicPriceIndex].sourceLanguage = ObjectId(difference.sourceLanguage);
  } else if (difference.targetLanguage) {
    client.rates.basicPricesTable[neededBasicPriceIndex].targetLanguage = ObjectId(difference.targetLanguage);
  } else if (difference.service) {
    stepMultipliersTable = stepMultipliersTable.filter(item => item.serviceId !== changedData._id);
    const stepMultipliersCombinations = await getStepMultipliersCombinations(changedData.service, oldData._id);
    stepMultipliersTable.push(...stepMultipliersCombinations);
    client.rates.stepMultipliersTable = stepMultipliersTable;
  } else {
    client.rates.industryMultipliersTable[neededIndustryIndex].industry = ObjectId(difference.industry);
  }
  await Clients.updateOne({ _id: clientId }, { rates: client.rates });
};

const getObjDifferences = (obj1, obj2) => {
  let diffs = {};
  let key;
  const compare = (item1, item2, key) => {
    item1 = item1._id ? item1._id : item1;
    if (item1.toString() !== item2.toString()) {
      diffs[key] = item1.toString();
    }
  };
  for (key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      compare(obj1[key], obj2[key], key);
    }
  }
  return diffs;
};

const deleteClientRates = async (clientId, serviceId) => {
  const client = await Clients.findOne({ _id: clientId });
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = client.rates;
  basicPricesTable = basicPricesTable.filter(item => item.serviceId !== serviceId);
  stepMultipliersTable = stepMultipliersTable.filter(item => item.serviceId !== serviceId);
  industryMultipliersTable = industryMultipliersTable.filter(item => item.serviceId !== serviceId);
  pricelistTable = pricelistTable.filter(item => item.serviceId !== serviceId);
  client.rates = { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable };
  await Clients.updateOne({ _id: clientId }, { rates: client.rates });
};

module.exports = { updateClientRates, addNewRateComponents, syncClientRatesAndServices, deleteClientRates };
