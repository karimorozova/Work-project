const { Industries } = require('../../../models');

const filterMemoqProjectsVendors = users => {
  const documents = users.map(i => i.documents).reduce((a, b) => a.concat(b), []);
  let usersFullName = [];
  documents.forEach((item) => {
    if (checkDocumentHasCorrectStructure(item)) {
      item = item.UserAssignments.TranslationDocumentUserRoleAssignmentDetails.map(i => i.UserInfoHeader)
        .map(i => i.FullName);
      usersFullName.push(item);
    }
  });
  return [...new Set(usersFullName.reduce((a, b) => a.concat(b), []))];
};

const checkDocumentHasCorrectStructure = (document) => {
   return document !== null && document.hasOwnProperty('UserAssignments') &&
    Object.entries(document.UserAssignments).length !== 0 &&
    document.UserAssignments.constructor === Object &&
    !!document.UserAssignments.TranslationDocumentUserRoleAssignmentDetails.length;
};

const isAllTasksFinished = (docs) => {
  if (Array.isArray(docs)) {
    return docs.every(({ DocumentStatus }) => DocumentStatus === 'TranslationFinished'
      || DocumentStatus === 'ProofreadingFinished');
  }
  const { DocumentStatus } = docs;
  return DocumentStatus === 'TranslationFinished' || DocumentStatus === 'ProofreadingFinished';
};

const checkProjectStructure = (clients, vendors, memoqProject, documents) => {
  const doesCorrelateWithOurClient = clients.find(({ aliases }) => aliases.includes(memoqProject.client));
  const doesHaveVendorsDocs = doesHaveVendors(vendors, documents);
  return !!doesCorrelateWithOurClient && doesHaveVendorsDocs;

  function doesHaveVendors (vendors, docs) {
    let doesCorrelateWithOurVendors = false;
    if (Array.isArray(docs)) {
      const hasCorrectStructure = docs.every(document => checkDocumentHasCorrectStructure(document));
      if (hasCorrectStructure) {
        for (let { UserAssignments: { TranslationDocumentUserRoleAssignmentDetails: memoqVendorsArr } } of docs) {
          doesCorrelateWithOurVendors = doesCorrelateWithOurVendor(vendors, memoqVendorsArr)
        }
        return doesCorrelateWithOurVendors;
      }
      return doesCorrelateWithOurVendors;
    }
    const hasCorrectStructure = checkDocumentHasCorrectStructure(docs);
    if (hasCorrectStructure) {
      const { UserAssignments: { TranslationDocumentUserRoleAssignmentDetails: memoqVendorsArr } } = docs;
      doesCorrelateWithOurVendors = doesCorrelateWithOurVendor(vendors, memoqVendorsArr)
      return doesCorrelateWithOurVendors;
    }
    return doesCorrelateWithOurVendors
  }
};

const doesCorrelateWithOurVendor = (vendors, userAssignments) => {
  let correlates = false;
  for (let i = 0; i < userAssignments.length; i ++) {
    const { UserInfoHeader: { FullName } } = userAssignments[i];
    const vendor = vendors.find(vendor => vendor.aliases.includes(FullName));
    if (vendor) correlates = true;
  }
  return correlates
}

const findFittingIndustryId = async (industryName) => {
  const neededIndustry = await Industries.findOne({
    name: { $regex: new RegExp(`${industryName}`, 'i') }
  });
  if (!neededIndustry) {
    switch (industryName) {
      case 'eLearning':
        return await Industries.findOne({ name: 'E-Learning' });
      case 'Tourism':
      case 'Travel, Tourism & Hospitality':
        return await Industries.findOne({ name: 'Hospitality' });
      case 'Medicine':
        return await Industries.findOne({ name: 'Pharma' });
      case 'Law':
        return await Industries.findOne({ name: 'Legal' });
      case 'Computer Hardware':
        return await Industries.findOne({ name: 'IT' });
      case 'Forex':
        return await Industries.findOne({ name: 'CFDs & Online Trading' });
      case 'Lottery':
        return await Industries.findOne({ name: 'iGaming' });
      case 'Media, Broadcasting & Publishing':
      case 'PR Agency':
        return await Industries.findOne({ name: 'Marketing' });
      default:
      case '':
        return await Industries.findOne({ name: 'Other' });
    }
  }
  return neededIndustry;
};

const getProjectStatus = (documents) => {
  let status = 'Quote';
  if (documents !== null && documents !== undefined) {
    status = isAllTasksFinished(documents) ? 'Closed' : 'In progress';
  }
  return status;
}

module.exports = {
  filterMemoqProjectsVendors,
  checkDocumentHasCorrectStructure,
  findFittingIndustryId,
  isAllTasksFinished,
  checkProjectStructure,
  getProjectStatus
};
