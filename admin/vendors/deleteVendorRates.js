const { Vendors } = require("../models");
const { getPricelistCombinations } = require("../clients");

const deleteVendorRates = async (vendorId, rowToDelete) => {
	const vendor = await Vendors.findOne({ _id: vendorId });
	const { rates, competencies } = vendor;
	let { pricelistTable } = rates;
	let { sourceLanguage, targetLanguage, step, industry } = rowToDelete;
	const langPair = `${ sourceLanguage } ${ targetLanguage }`;

	const filteredBasicPricesTable = filterRedundantLangPair(
			rates,
			competencies,
			rowToDelete._id,
			langPair
	);
	const filteredStepsTable = filterRedundantSteps(
			rates,
			competencies,
			rowToDelete._id,
			step
	);
	const filteredIndustriesTable = filterRedundantIndustry(
			rates,
			competencies,
			rowToDelete._id,
			industry
	);
	pricelistTable = getPricelistCombinations(
			filteredBasicPricesTable,
			filteredStepsTable,
			filteredIndustriesTable,
			pricelistTable,
			true
	);
	return {
		rates: {
			basicPricesTable: filteredBasicPricesTable,
			stepMultipliersTable: filteredStepsTable,
			industryMultipliersTable: filteredIndustriesTable,
			pricelistTable
		}
	};
};

const filterRedundantLangPair = (
		rates,
		competencies,
		rowToDeleteId,
		langPair
) => {
	const { basicPricesTable } = rates;
	const otherCompetencies = competencies.filter(
			row => row._id.toString() !== rowToDeleteId.toString()
	);

	const otherLangPairs = otherCompetencies.map(
			row => `${ row.sourceLanguage } ${ row.targetLanguage }`
	);
	const redundantLangPairs = [];
	if(!otherLangPairs.includes(langPair)) redundantLangPairs.push(langPair);
	if(redundantLangPairs.length) {
		return basicPricesTable.filter(
				({ sourceLanguage, targetLanguage }) =>
						!redundantLangPairs.includes(`${ sourceLanguage } ${ targetLanguage }`)
		);
	}
	return basicPricesTable;
};

const filterRedundantSteps = (
		rates,
		competencies,
		rowToDeleteId,
		stepToDelete
) => {
	const { stepMultipliersTable } = rates;
	const otherCompetencies = competencies.filter(
			row => row._id.toString() !== rowToDeleteId.toString()
	);
	let otherSteps = otherCompetencies.map(row => row.step.toString());
	const redundantSteps = [];
	if(!otherSteps.includes(stepToDelete))
		redundantSteps.push(stepToDelete.toString());
	if(redundantSteps.length) {
		return stepMultipliersTable.filter(
				({ step }) => !redundantSteps.includes(step.toString())
		);
	}
	return stepMultipliersTable;
};

const filterRedundantIndustry = (
		rates,
		competencies,
		rowToDeleteId,
		industryToDelete
) => {
	const { industryMultipliersTable } = rates;
	const otherServices = competencies.filter(
			row => row._id.toString() !== rowToDeleteId.toString()
	);
	const otherIndustries = otherServices.map(row => row.industry.toString());
	const redundantIndustries = [];
	if(!otherIndustries.includes(industryToDelete))
		redundantIndustries.push(industryToDelete.toString());
	if(redundantIndustries.length) {
		return industryMultipliersTable.filter(
				({ industry }) => !redundantIndustries.includes(industry.toString())
		);
	}
	return industryMultipliersTable;
};

module.exports = {
	deleteVendorRates
};
