const {
	getClient,
	getClients,
	getClientAfterUpdate,
	gerFilteredClients,
	getClientsForNewProject,
	getClientRates,
	getClientWithActions,
	getSimpleClients,
	getClientForPortal
} = require("./getClients")

const {
	updateClientRates,
	getNeededLangPair,
	getNeededStepRow,
	getNeededCurrency,
	getStepMultipliersCombinations,
	getPricelistCombinations,
	replaceOldItem,
	changePricelistTable,
	generateNewPricelistCombinations,
	getClientAfterCombinationsUpdated,
	filteredCombinationsResultRatesTable,
	updateClientRatesFromSettings
} = require("./clientRates")

const {
	updateClientInfo,
	saveClientDocumentDefault,
	saveClientDocument,
	removeClientDoc
} = require("./info")

const {
	getAfterTaskStatusUpdate,
	updateClientProjectDate
} = require("./projects")

const {
	updateClientService,
	deleteClientService,
	getClientServices,
	createClientServicesGroup,
	getClientServicesGroups,
	deleteClientServiceGroups,
	editClientServicesGroup
} = require("./clientService")

const { updateRates } = require("./updateClientRates")

const {
	syncClientRatesCost,
	synchronizeBasicPrice,
	synchronizeStepMultiplier,
	synchronizeIndustryMultiplier,
	synchronizePricelistTable
} = require("./syncClientRatesCost")

const { updateClientMatrix, syncClientMatrix } = require("./clientMatrix")

const { updateTaskDataByCondition } = require("./clientActivity")

const {
	createClient,
	getContactsIdsWithCreate
} = require('./createClient')

const clients = {
	createClient,
	getContactsIdsWithCreate,
	getClient,
	getClientWithActions,
	getClients,
	getClientRates,
	gerFilteredClients,
	updateClientRates,
	getClientAfterUpdate,
	updateClientInfo,
	getAfterTaskStatusUpdate,
	saveClientDocument,
	updateClientService,
	deleteClientService,
	updateRates,
	removeClientDoc,
	saveClientDocumentDefault,
	syncClientRatesCost,
	getNeededLangPair,
	getNeededStepRow,
	getNeededCurrency,
	getStepMultipliersCombinations,
	getPricelistCombinations,
	replaceOldItem,
	changePricelistTable,
	synchronizeBasicPrice,
	synchronizeStepMultiplier,
	synchronizeIndustryMultiplier,
	synchronizePricelistTable,
	generateNewPricelistCombinations,
	updateClientProjectDate,
	getClientsForNewProject,
	updateClientMatrix,
	syncClientMatrix,
	getClientAfterCombinationsUpdated,
	filteredCombinationsResultRatesTable,
	updateTaskDataByCondition,
	getSimpleClients,
	updateClientRatesFromSettings,
	getClientForPortal,
	getClientServices,
	createClientServicesGroup,
	getClientServicesGroups,
	deleteClientServiceGroups,
	editClientServicesGroup
}

module.exports = clients
