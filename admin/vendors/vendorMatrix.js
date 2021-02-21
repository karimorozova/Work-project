const { Vendors, Pricelist } = require('../models');
const { getVendorAfterUpdate } = require('./getVendors');

/**
 * Updates vendor's matrix row
 * @param {String} vendorId - vendor's id
 * @param {Object} newData - consists of key of item to update and value to assign
 * @return {Object} - returns updated vendor's object
 */
const updateVendorMatrix = async (vendorId, newData) => {
  const { key, value } = newData;
  const { matrix } = await Vendors.findOne({ _id: vendorId });
  if (matrix[key].rate !== Number(value)) {
    matrix[key].rate = Number(value);
    matrix[key].altered = true;
    matrix[key].notification = 'Vendor\'s discount chart is different from related';
    return await getVendorAfterUpdate({ _id: vendorId }, { matrix });
  } else {
    return await getVendorAfterUpdate({ _id: vendorId }, {});
  }
};

/**
 * Syncs client's matrix row with default pricelist's discount chart
 * @param {String} vendorId - client's id
 * @param {String} dataKeyToSync - matrix's object key
 * @return {Object} returns updated client's object
 */
const syncVendorMatrix = async (vendorId, dataKeyToSync) => {
  const { matrix } = await Vendors.findOne({ _id: vendorId.toString() });
  const { discountChart } = await Pricelist.findOne({ isVendorDefault: true });
  matrix[dataKeyToSync].altered = false;
  matrix[dataKeyToSync].notification = '';
  matrix[dataKeyToSync].rate = discountChart[dataKeyToSync].rate;
  return await getVendorAfterUpdate({ _id: vendorId }, { matrix });
};

module.exports = { updateVendorMatrix, syncVendorMatrix }
