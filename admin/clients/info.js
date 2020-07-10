const { moveFile } = require('../utils/movingFile');
const fs = require('fs');
const { Clients } = require('../models')
const { getClientAfterUpdate } = require('./getClients');

async function updateClientInfo({clientId, client, files}) {
        const { contacts } = client;
        let updatingClient = {...client}
        const photoFiles = files.filter(item => item.fieldname == 'photos');
        const newContract = files.find(item => item.fieldname == 'contract');
        const newNda = files.find(item => item.fieldname == 'nda');
        try {
            if(photoFiles.length) {
                updatingClient.contacts = await attachPhotos({photoFiles, contacts, clientId});
            }
            const { contract, nda } = await attachNdaContract({
                newContract, newNda, oldContract: client.contract, oldNda: client.nda, clientId
            })
            updatingClient.contract = contract;
            updatingClient.nda = nda;
            return await getClientAfterUpdate({"_id": clientId}, updatingClient);
        } catch(err) {
            console.log(err);
            console.log("Error in updateClientInfo");
        }
}

async function attachPhotos({photoFiles, contacts, clientId}) {
    let clientContacts = [...contacts];
    try {
        for(let photo of photoFiles) {
            for(let contact of clientContacts) {
                if(contact.file && photo.filename == contact.file) {
                    if(contact.photo) {
                        await fs.unlink('./dist' + contact.photo, (err) => {
                            console.log(err)
                        })
                    }
                    const newPath = `/clientsDocs/${clientId}/contacts/${contact.firstName}-${contact.surname}-${photo.filename}`;
                    await moveFile(photo, `./dist${newPath}`);
                    contact.photo = newPath;
                    contact.file = null;
                }
            }
        }
        return clientContacts;
    } catch(err) {
        console.log(err);
        console.log("Error in attachPhotos")
    }
}

async function removeClientDoc({clientId, fileName, path, category}) {
    try {
        const client = await Clients.findOne({_id: clientId});
        const { documents } = client; 
        const neededFileIndex =  documents.findIndex(item => item.category == category)
        documents[neededFileIndex].fileName = '';
        documents[neededFileIndex].path = '';

        // console.log({clientId, fileName, path, category});
        
        await removeOldClientFile(path, "");
        return await getClientAfterUpdate({_id: clientId}, { documents });

    } catch(err) {
        console.log(err);
        console.log("Error in removeClientDoc");
    }
}

async function saveClientDocumentDefault({clientId, category}) {
    try {
        const client = await Clients.findOne({_id: clientId});
        let { documents } = client;
        const newDoc = {fileName: '', path: `${new Date().getTime()}`, category};
        documents.push(newDoc);
        return await getClientAfterUpdate({"_id": clientId}, { documents });
    } catch(err) {
        console.log(err);
        console.log("Error in saveVendorDocumentDefault");
    }
}

async function saveClientDocument({clientId, file, category, oldFilePath, oldName, oldCategory}) {
    try {
        if(!file) {
            return await getClientAfterUpdate(
                {_id: clientId, "documents.category": oldCategory, "documents.fileName": oldName},
                {"documents.$.category": category}
            )
        }
        const client = await Clients.findOne({_id: clientId});
        let { documents } = client;
        const namePrefix = category.slice(0, 3).toLowerCase();
        const newPath = `/clientsDocs/${clientId}/${namePrefix}-${file.filename}`;
        await moveFile(file, `./dist${newPath}`);
        const newDoc = {fileName: file.filename, path: newPath, category};
    
        if(oldFilePath) {
            await removeOldClientFile(oldFilePath, newPath);
            const index = documents.findIndex(item => item.path === oldFilePath && item.category === category);
            documents.splice(index, 1, newDoc)
        } else {
           const indexToUpdate =  documents.findIndex(item => item.category == category)
           documents[indexToUpdate].fileName = newDoc.fileName
           documents[indexToUpdate].path = newDoc.path
        }

        return await getClientAfterUpdate({"_id": clientId}, { documents });
    } catch(err) {
        console.log(err);
        console.log("Error in saveVendorDocument");
    }
}

function removeOldClientFile(oldPath, newPath) {
    if(oldPath === newPath || !oldPath) return;
    return new Promise((resolve, reject) => {
        fs.unlink(`./dist${oldPath}`, (err) => {
            if (err) {
                console.log(err);
                console.log("Error in removeOldClientFile");
                reject(err);
            }
        });
        resolve("removed");
    })
}

async function attachNdaContract({newContract, newNda, oldContract, oldNda, clientId}) {
    let contract = "";
    let nda = "";
    try {
        if(newContract) {
            if(oldContract) {
                await fs.unlink('./dist' + oldContract, (err) => {
                    console.log(err)
                })
            }
            const newPath = `/clientsDocs/${clientId}/contract/${newContract.filename}`;
            await moveFile(newContract, `./dist${newPath}`)
            contract = newPath;
        }

        if(newNda) {
            if(oldNda) {
                await fs.unlink('./dist' + oldNda, (err) => {
                    console.log(err)
                })
            }
            const newPath = `/clientsDocs/${clientId}/nda/${newNda.filename}`;
            await moveFile(newNda, `./dist${newPath}`)
            nda = newPath;
        }
        return { contract, nda };
    } catch(err) {
        console.log(err);
        console.log("Error in attachNdaContract")
    }
}

module.exports = { updateClientInfo , saveClientDocumentDefault , saveClientDocument , removeClientDoc }