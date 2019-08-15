const { moveFile } = require('../utils/movingFile');
const fs = require('fs');
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
                    const newPath = `/clientsDocs/${clientId}/contacts/${contact.firstName}-${contact.surname}${photo.filename}`;
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

module.exports = { updateClientInfo }