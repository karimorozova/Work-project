const { ClientRequest } = require("../models")
const { getClientRequestById } = require("./getClientsRequests")

async function getClientRequestAfterUpdate(query, update) {
  return await (ClientRequest.findOneAndUpdate(query, update, { new: true })
    .populate([
      "requestForm.sourceLanguage",
      "requestForm.targetLanguages",
      "requestForm.service",
      "industry",
      "customer",
    ])
    .populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
    .populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ]))
}

async function updateClientRequestProps({id, value}) {
  try {
    await ClientRequest.updateOne({_id: id}, {$set: value })
    return await getClientRequestById(id)
  } catch(err) {
    console.log(err);
    console.log("Error on getting filtered client requests");
  }
}


async function updateClientContacts({id, contact, oldContact}) {
  try {
    let { clientContacts } = await ClientRequest.findOne({ _id: id })
    if (!!oldContact && oldContact._id) {
      const oldIdxContact = clientContacts.findIndex(item => item._id.toString() === oldContact._id.toString())
      clientContacts.splice(oldIdxContact, 1, contact)
    } else {
      clientContacts.push(contact)
    }
    return (await getClientRequestAfterUpdate({ _id: id }, { clientContacts }))

  } catch(err) {
    console.log(err);
    console.log("Error on getting filtered client requests");
  }
}

module.exports = {
  updateClientRequestProps,
  getClientRequestAfterUpdate,
  updateClientContacts,
}
