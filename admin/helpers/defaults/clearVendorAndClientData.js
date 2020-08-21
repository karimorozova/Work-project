const { Vendors, Clients } = require('../../models');

const clearVendorAndClientData = async () => {
  const vendors = await Vendors.find();
  const clients = await Clients.find();
  const rates = {
    basicPricesTable: [],
    stepMultipliersTable: [],
    industryMultipliersTable: [],
    pricelistTable: []
  };
  for (let { _id } of vendors) {
    const competencies = [];
    const qualifications = [];
    const assessments = [];
    await Vendors.updateOne({ _id }, { competencies, qualifications, assessments, rates });
  }
  for (let { _id } of clients) {
    const services = [];
    await Clients.updateOne({ _id }, { services, rates });
  }
};

module.exports = { clearVendorAndClientData };
