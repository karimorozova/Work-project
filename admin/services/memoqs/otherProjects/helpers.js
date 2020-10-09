const filterMemoqProjectsVendors = users => {
  const documents = users.map(i => i.documents).reduce((a, b) => a.concat(b), []);
  let usersFullName = [];
  documents.forEach((item) => {
    if (checkDocumentHasCorrectEntity(item)) {
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
    document.UserAssignments.TranslationDocumentUserRoleAssignmentDetails.length;
};

module.exports = { filterMemoqProjectsVendors, checkDocumentHasCorrectStructure };
