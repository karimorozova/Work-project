const { moveFile } = require('../utils/movingFile');
const fs = require('fs');
const { Clients } = require('../models');
const { getClientAfterUpdate } = require('./getClients');
const { getContactsIdsWithCreate } = require("../clients/createClient")

/**
 *
 * @param {ObjectId} clientId
 * @param {Object} client - object that includes updated values
 * @param {Array} files - client's files
 * @returns {Object} - returns an updated client
 */
async function updateClientInfo({ clientId, client, files }) {
  const { contacts } = client;
  let updatingClient = { ...client };
  // console.log(updatingClient)
  // for await (let billInfo of updatingClient.billingInfo) {
  //   billInfo.contacts = await getContactsIdsWithCreate(clientId, billInfo)
  //   console.log(billInfo.contacts)
  // }
  // console.log(updatingClient.billingInfo)
  const photoFiles = files.filter(item => item.fieldname === 'photos');
  try {
    if (photoFiles.length) {
      updatingClient.contacts = await attachPhotos({ photoFiles, contacts, clientId });
    }
    return await getClientAfterUpdate({ "_id": clientId }, updatingClient);
  } catch (err) {
    console.log(err);
    console.log("Error in updateClientInfo");
  }
}

/**
 *
 * @param {Array} photoFiles
 * @param {Array} contacts
 * @param {ObjectId} clientId
 * @returns {Array} - returns filtered client's contacts
 */
async function attachPhotos({ photoFiles, contacts, clientId }) {
  let clientContacts = [...contacts];
  try {
    for (let photo of photoFiles) {
      for (let contact of clientContacts) {
        if (contact.file && photo.filename === contact.file) {
          if (contact.photo) {
            await fs.unlink('./dist' + contact.photo, (err) => {
              console.log(err);
            });
          }
          const newPath = `/clientsDocs/${clientId}/contacts/${contact.firstName}-${contact.surname}-${photo.filename}`;
          await moveFile(photo, `./dist${newPath}`);
          contact.photo = newPath;
          contact.file = null;
        }
      }
    }
    return clientContacts;
  } catch (err) {
    console.log(err);
    console.log("Error in attachPhotos");
  }
}

/**
 *
 * @param {ObjectId} clientId
 * @param {String} path
 * @param {String} category
 * @returns {Object} - returns an updated client
 */
async function removeClientDoc ({ clientId, path, category }) {
  try {
    const client = await Clients.findOne({ _id: clientId });
    const { documents } = client;
    const neededFileIndex = documents.findIndex(item => item.category === category);
    documents[neededFileIndex].fileName = '';
    documents[neededFileIndex].path = '';
    await removeOldClientFile(path, '');
    return await getClientAfterUpdate({ _id: clientId }, { documents });

  } catch (err) {
    console.log(err);
    console.log("Error in removeClientDoc");
  }
}

/**
 *
 * @param {ObjectId} clientId
 * @param {String} category
 * @returns {Object} - returns an updated client
 */
async function saveClientDocumentDefault({ clientId, category }) {
  try {
    const client = await Clients.findOne({ _id: clientId });
    let { documents } = client;
    const newDoc = { fileName: '', path: `${new Date().getTime()}`, category };
    documents.push(newDoc);
    return await getClientAfterUpdate({ "_id": clientId }, { documents });
  } catch (err) {
    console.log(err);
    console.log("Error in saveVendorDocumentDefault");
  }
}

/**
 *
 * @param {ObjectId} clientId
 * @param {Object} file
 * @param {String} category
 * @param {String} oldFilePath
 * @param {String} oldName
 * @param {String} oldCategory
 * @returns {Object} - returns an updated client
 */
async function saveClientDocument({ clientId, file, category, oldFilePath, oldName, oldCategory }) {
  try {
    if (!file) {
      return await getClientAfterUpdate(
        { _id: clientId, "documents.category": oldCategory, "documents.fileName": oldName },
        { "documents.$.category": category }
      );
    }
    const client = await Clients.findOne({ _id: clientId });
    let { documents } = client;
    const namePrefix = category.slice(0, 3).toLowerCase();
    const newPath = `/clientsDocs/${clientId}/${namePrefix}-${file.filename}`;
    await moveFile(file, `./dist${newPath}`);
    const newDoc = { fileName: file.filename, path: newPath, category };

    if (oldFilePath) {
      await removeOldClientFile(oldFilePath, newPath);
      const index = documents.findIndex(item => item.path === oldFilePath && item.category === category);
      documents.splice(index, 1, newDoc);
    } else {
      const indexToUpdate = documents.findIndex(item => item.category === category);
      documents[indexToUpdate].fileName = newDoc.fileName;
      documents[indexToUpdate].path = newDoc.path;
    }

    return await getClientAfterUpdate({ "_id": clientId }, { documents });
  } catch (err) {
    console.log(err);
    console.log("Error in saveVendorDocument");
  }
}

/**
 *
 * @param {String} oldPath
 * @param {String} newPath
 * @returns {Promise<String>}
 */
function removeOldClientFile(oldPath, newPath) {
  if (oldPath === newPath || !oldPath) return;
  return new Promise((resolve, reject) => {
    fs.unlink(`./dist${oldPath}`, (err) => {
      if (err) {
        console.log(err);
        console.log("Error in removeOldClientFile");
        reject(err);
      }
    });
    resolve("removed");
  });
}

module.exports = { updateClientInfo, saveClientDocumentDefault, saveClientDocument, removeClientDoc };
