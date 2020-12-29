const {XtrfLqa, Vendors } = require('../models');


async function UpdateLqaAliases() {
  const vendors = await Vendors.find({},{aliases: 1})
  const xtrfLqas = await XtrfLqa
    .find()
    .populate('sourceLanguage', 'lang')
    .populate('targetLanguage', 'lang')
    .populate('industries.industryGroup', ['name']);
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
  return updatedXtrfLqas;
}

module.exports = {UpdateLqaAliases}
