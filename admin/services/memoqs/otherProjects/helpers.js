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
   return  document !== null && document.hasOwnProperty('UserAssignments') &&
    Object.entries(document.UserAssignments).length !== 0 &&
    document.UserAssignments.constructor === Object &&
    !!document.UserAssignments.TranslationDocumentUserRoleAssignmentDetails.length;
};

const isAllTasksFinished = (docs) => {
  if (docs.constructor === Object) {
    const { DocumentStatus } = docs;
    return DocumentStatus === 'TranslationFinished';
  }
  return docs.every(({ DocumentStatus }) => DocumentStatus === 'TranslationFinished');
};

const checkProjectStructure = (clients, memoqProject, documents) => {
  const doesCorrelateWithOurClient = !!clients.find(({ aliases }) => aliases.includes(memoqProject.client));
  const doesHaveVendorsDocs = doesHaveVendors(documents);
  return !!doesCorrelateWithOurClient && doesHaveVendorsDocs;

  function doesHaveVendors (docs) {
    if (docs.constructor === Object) return checkDocumentHasCorrectStructure(docs);
    return docs.every(document => checkDocumentHasCorrectStructure(document));
  }
};

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
        return await Industries.findOne({ name: 'iGaming (Casino, Slot games, Gambling, etc.)' });
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

module.exports = {
  filterMemoqProjectsVendors,
  checkDocumentHasCorrectStructure,
  findFittingIndustryId,
  isAllTasksFinished,
  checkProjectStructure
};
