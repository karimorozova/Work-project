const { ClientRequest } = require("../models")
const { getClientRequestById, getClientRequestAfterUpdate } = require("./getClientsRequests")



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
  updateClientContacts,
}
