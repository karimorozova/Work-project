const { Clients, Pricelist } = require('../models');
const { getClientAfterUpdate } = require('./getClients');

/**
 * Updates client's matrix row
 * @param {String} clientId - client's id
 * @param {Object} newData - consists of key of item to update and value to assign
 * @return {Object} - returns updated client's object
 */
const updateClientMatrix = async (clientId, newData) => {
  const { key, value } = newData;
  const { matrix } = await Clients.findOne({ _id: clientId });
  if (matrix[key].rate !== Number(value)) {
    matrix[key].rate = Number(value);
    matrix[key].altered = true;
    matrix[key].notification = 'Client\'s discount chart is different from related';
    return await getClientAfterUpdate({ _id: clientId }, { matrix });
  } else {
    return await getClientAfterUpdate({ _id: clientId }, {});
  }
};

/**
 * Syncs client's matrix row with default pricelist's discount chart
 * @param {String} clientId - client's id
 * @param {String} dataKeyToSync - matrix's object key
 * @return {Object} returns updated client's object
 */
const syncClientMatrix = async (clientId, dataKeyToSync) => {
  const { defaultPricelist, matrix } = await Clients.findOne({ _id: clientId });
  const { discountChart } = await Pricelist.findOne({ _id: defaultPricelist });
  matrix[dataKeyToSync].altered = false;
  matrix[dataKeyToSync].notification = '';
  matrix[dataKeyToSync].rate = discountChart[dataKeyToSync].rate;
  return await getClientAfterUpdate({ _id: clientId }, { matrix });
};

module.exports = { updateClientMatrix, syncClientMatrix }
