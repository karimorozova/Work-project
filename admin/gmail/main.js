const { getToken } = require('./authorization');
const { google: { gmail: gmailApi } } = require('googleapis');
const { GmailMessages, MemoqProject } = require('../models');
const {
  getProjectNameFromQuoteProjectMessage,
  getProjectNameFromInProgressProjectMessage,
  getProjectNameFromClosedProjectMessage
} = require('./helpers');

const saveDefaultLabels = async (auth) => {
  if (!auth) getToken(saveDefaultLabels);
  else {
    let neededLabels = [];
    const neededLabelNames = ['Project Approved', 'Project Closed', 'Decide on quote'];
    const gmail = gmailApi({ version: 'v1', auth });
    await gmail.users.labels.list({
      userId: 'me',
    }, async (err, res) => {
      if (err) {
        console.log(err);
        console.log('Error on getting mail labels!');
      }
      const { labels } = res.data;
      neededLabels = labels.filter(({ name }) => neededLabelNames.includes(name));
      await saveLabelsToDB(neededLabels);
    });
  }

  async function saveLabelsToDB (labels) {
    for (let { id, name } of labels) {
      await GmailMessages.create({
        labelId: id,
        name,
        messages: []
      });
    }
  }
};

const saveMessages = async (auth) => {
  if (!auth) getToken(saveMessages);
  else {
    const gmail = gmailApi({ version: 'v1', auth });
    const labels = await GmailMessages.find();
    const neededLabelIds = labels.map(({ labelId }) => labelId);
    for (let id of neededLabelIds) {
      await gmail.users.messages.list({
        userId: 'me',
        labelIds: `${id}`
      }, async (err, res) => {
        for (let { id } of res.data.messages) {
          await gmail.users.messages.get({
            userId: 'me', id: id
          }, async (err, res) => {
            if (err) {
              console.log(err);
              console.log('Error on getting messages');
            }
            const message = res.data;
            const doesFit = checkIfFits(message, neededLabelIds);
            if (doesFit) {
              await saveMessageToDB(message, neededLabelIds);
            }
          });
        }
      });
    }
  }

  async function saveMessageToDB (message, neededLabelIds) {
    const labels = await GmailMessages.find();
    const { labelIds, id: messageId, snippet } = message;
    const neededLabelIndex = neededLabelIds.findIndex(item => labelIds.includes(item));
    const { _id, messages, name } = labels[neededLabelIndex];
    // const projectName = name === 'Project Closed' ? getProjectNameFromClosedProjectMessage(snippet)
    //   : getProjectNameFromMessage(snippet);
    const messageIdsArr = messages.map(({ id: messageId }) => messageId);
    if (!messageIdsArr.includes(message.id)) {
      messages.push({
        id: messageId,
        snippet,
        creationTime: new Date(),
        // projectName
      });
    }
    await GmailMessages.updateOne({ _id }, { messages });
  }

  function checkIfFits (message, neededLabelIds) {
    const { labelIds } = message;
    return !!labelIds.some(item => neededLabelIds.includes(item));
  }
};

const updateOtherProjectStatusOnMessages = async () => {
  const labels = await GmailMessages.find();
  for (let { name, messages } of labels) {
    const notReadMessages = messages.filter(({ isRead }) => !isRead);
    for (let { projectName } of notReadMessages) {
      const project = await MemoqProject.findOne({ name: projectName });
      if (project) console.log(project);
    }
  }
};


module.exports = { saveDefaultLabels, saveMessages, updateOtherProjectStatusOnMessages };
