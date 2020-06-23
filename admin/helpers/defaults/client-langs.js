const { Clients } = require('../../models');

const addEmptyLangPairs = async () => {
  const clients = await Clients.find();
  for (let client of clients) {
    client.languagePairs = [];
    await Clients.updateOne({ _id: client._id }, client);
  }
  console.log('Finished!');
}

module.exports = { addEmptyLangPairs }
