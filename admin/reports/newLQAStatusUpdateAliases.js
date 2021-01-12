const {groupXtrfLqaByIndustryGroup} = require("./xtrf");
const {XtrfLqa, XtrfLqaGrouped, Vendors } = require('../models');


async function UpdateLqaAliases() {
  const vendors = await Vendors.find({},{aliases: 1})
  const xtrfLqas = await XtrfLqa
    .find()
    .populate('sourceLanguage', ['lang'])
    .populate('targetLanguage', ['lang'])
    .populate('industries.industry', ['name'])
    .populate('industries.vendors.vendor', ['assessments'])
    .populate('industries.industryGroup', ['name'])
  const updatedXtrfLqas = xtrfLqas.map(xtrfLqa=> {
     xtrfLqa.industries = xtrfLqa.industries.map(oneIndustry => {
      oneIndustry.vendors =  oneIndustry.vendors.map(oneVendor =>  {
        const vendorAlias =  vendors.find(({aliases}) => aliases.includes(oneVendor.name))
          if (vendorAlias){
            oneVendor.vendor =  vendorAlias._id
          }
          return oneVendor
      })
      return oneIndustry
    })
    return xtrfLqa
  })
  await XtrfLqa.create(updatedXtrfLqas)
  const newReports = updatedXtrfLqas.map( report => {
    delete report._doc._id
    return report._doc
  });
  const newReportsGrouped = groupXtrfLqaByIndustryGroup(newReports);
  await XtrfLqaGrouped.deleteMany();
  await XtrfLqaGrouped.create(newReportsGrouped);
  return newReportsGrouped;
}

module.exports = {UpdateLqaAliases}
