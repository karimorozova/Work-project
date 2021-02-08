const { Industries, MemoqProject, GmailProjectsStatuses } = require('../../../models');
const moment = require('moment');

const clearGarbageProjects = async (filterAll = false) => {
  const isSquareBrackets = /(\[\d.*\])/gm;
  const stringId = /(\d.*[\d]] -)/gm;
  const stringIdForWP = /(WP \d.*[\d]] -)/gm;
  let date = Date.now();
  const dayInTimestampMilliseconds = 86400 * 1000;
  const date40DayAgo = Math.floor(date - (dayInTimestampMilliseconds * 40));
  const date150DayAgo = Math.floor(date - (dayInTimestampMilliseconds * 170));
  const lastDate = filterAll ? date150DayAgo : date40DayAgo;

  let allProjectStatuses = await GmailProjectsStatuses.find();
  let allProjectsInSystem = await MemoqProject.find({
    creationTime: { $gte: (moment(lastDate).format('YYYY-MM-DD')).toString() }
  });

  allProjectsInSystem = allProjectsInSystem.filter(({ name }) => !!name.match(isSquareBrackets) && !name.match(stringIdForWP));

  for ({ _id, name } of allProjectsInSystem){
    let [ strId ] = name.match(stringId);
    const isExistProjectInXTRF = allProjectStatuses
        .map(({ name }) => !!name.match(isSquareBrackets) && name.match(stringId) && name.match(stringId)[0])
        .includes(strId);

    if(!isExistProjectInXTRF) await MemoqProject.deleteOne( { "_id" : _id } )
  }
};

const filterMemoqProjectsVendors = users => {
  const documents = users.map(i => i.documents).reduce((a, b) => a.concat(b), []);
  let usersFullName = [];
  documents.forEach((item) => {
    if (checkDocumentHasCorrectStructure(item)) {
      const structuredItem = Array.isArray(item.UserAssignments.TranslationDocumentUserRoleAssignmentDetails) ?
          item.UserAssignments.TranslationDocumentUserRoleAssignmentDetails :
          [item.UserAssignments.TranslationDocumentUserRoleAssignmentDetails]

      item = structuredItem
          .map(i => i.UserInfoHeader)
          .map(i => i.FullName);
      usersFullName.push(item);
    }
  });
  return [...new Set(usersFullName.reduce((a, b) => a.concat(b), []))].filter(name => !name.match(/^\s+$|^$/gi));
};

const checkDocumentHasCorrectStructure = (document) => {
   return document.hasOwnProperty('UserAssignments') &&
     Object.entries(document.UserAssignments).length !== 0 &&
     document.UserAssignments.constructor === Object &&
       (!!document.UserAssignments.TranslationDocumentUserRoleAssignmentDetails.length ||
           typeof document.UserAssignments.TranslationDocumentUserRoleAssignmentDetails === 'object');
};

const checkProjectStructure = (clients, vendors, memoqProject, documents) => {
  const doesCorrelateWithOurClient = clients.find(({ aliases }) => aliases.includes(memoqProject.client));
  const doesHaveVendorsDocs = doesHaveVendors(vendors, documents);
  return !!doesCorrelateWithOurClient && doesHaveVendorsDocs;

  function doesHaveVendors (vendors, docs) {
    if (Array.isArray(docs)) {
      return docs.every(document => checkDocumentHasCorrectStructure(document));
    } else {
      return checkDocumentHasCorrectStructure(docs);
    }
  }
};

//MM
// const doesCorrelateWithOurVendor = (vendors, userAssignments) => {
//   let correlates = false;
//   for (let i = 0; i < userAssignments.length; i++) {
//     const { UserInfoHeader: { FullName } } = userAssignments[i];
//     const vendor = vendors.find(vendor => vendor.aliases.includes(FullName));
//     if (vendor) correlates = true;
//   }
//   return correlates;
// }

const defineProjectStatus = (docStatus) => {
  switch (docStatus) {
    case 'TranslationInProgress':
    case 'ProofreadingInProgress' :
      return 'In progress';
    case 'TranslationFinished' :
    case 'ProofreadingFinished' :
      return 'Closed';
    default:
      return null;
  }
};

// const doesAllTasksFinished = (documents) => {
//   if (Array.isArray(documents)) {
//     return documents.every(({ DocumentStatus }) => DocumentStatus === 'TranslationFinished' || DocumentStatus === 'ProofreadingFinished');
//   }
//   const { DocumentStatus } = documents;
//   return DocumentStatus === 'TranslationFinished' || DocumentStatus === 'ProofreadingFinished';
// };

const findFittingIndustryId = async (industryName) => {
  industryName = industryName.trim();
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
      case 'iGaming':
        return await Industries.findOne({ name: 'iGaming' });
      case 'Finance':
        return await Industries.findOne({ name: 'Finance' });
      case 'Media, Broadcasting & Publishing':
      case 'PR Agency':
        return await Industries.findOne({ name: 'Marketing' });
      case '':
        return await Industries.findOne({ name: 'Other' });
      default:
        return await Industries.findOne({ name: 'Other' });
    }
  }
  return neededIndustry;
};

module.exports = {
  filterMemoqProjectsVendors,
  checkDocumentHasCorrectStructure,
  findFittingIndustryId,
  checkProjectStructure,
  // doesAllTasksFinished,
  defineProjectStatus,
  clearGarbageProjects
};
