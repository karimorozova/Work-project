const { getToken } = require('./authorization');
const { google: { gmail: gmailApi } } = require('googleapis');
const { GmailMessages, MemoqProject } = require('../models');
const { getProjectName } = require('./helpers');

const saveDefaultLabels = async (auth) => {
  if (!auth) getToken(saveDefaultLabels);
  else {
    let neededLabels = [];
    const neededLabelNames = ['Project Approved', /*'Project Closed',*/ 'Decide on quote'];
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
      const sortedLabels = [neededLabels[1], neededLabels[0]/*,neededLabels[2]*/];
      await saveLabelsToDB(sortedLabels);
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

const wait = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

const saveMessages = async (auth) => {
  if(!auth) getToken(saveMessages);
  else {
    const gmail = gmailApi({ version: 'v1', auth });
    const labels = await GmailMessages.find();
    const neededLabelIds = labels.map(({ labelId }) => labelId);
    for (let id of neededLabelIds) {
      await gmail.users.messages.list({
        userId: 'me',
        labelIds: `${ id }`
      }, async (err, res) => {
        for (let { id } of res.data.messages) {
          await wait(500);
          await gmail.users.messages.get({
            userId: 'me', id: id
          }, async (err, res) => {
            if(err) {
              console.log(err);
              console.log('Error on getting messages');
            }
            const message = res.data;
            const doesFit = checkIfFits(message, neededLabelIds);
            if(doesFit) {
              await saveMessageToDB(message, neededLabelIds);
            }
          });
        }
      });
    }
  }

  async function saveMessageToDB(message, neededLabelIds) {
    const labels = await GmailMessages.find();
    const { labelIds, id: messageId, snippet, payload } = message;
    const neededLabelIndex = neededLabelIds.findIndex(item => labelIds.includes(item));
    const { _id, messages, name } = labels[neededLabelIndex];
    const messageIdsArr = messages.map(({ id: messageId }) => messageId);
    const { value } = payload.headers.find(({ name }) => name === 'Subject');
    if(!messageIdsArr.includes(message.id)) {
      messages.push({
        id: messageId,
        snippet,
        subject: value,
        creationTime: new Date(),
        projectName: getProjectName(value, name)
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
  for (let { _id, name, messages } of labels) {
    for (let i = 0; i < messages.length; i += 1) {
      let { projectName, isRead } = messages[i];
      if (!isRead) {
        const project = await MemoqProject.findOne({ name: projectName, status: { $ne: 'Closed' } });
        if (project) {
          messages[i].isRead = true;
          let status;
          switch (name) {
            case 'Project Approved':
              status = 'In progress';
              break;
            //case 'Project Closed':
            //status = 'Closed';
            //break;
            case 'Decide on quote':
              status = 'Quote';
              break;
          }
          await MemoqProject.updateOne({ _id: project._id }, { status });
        }
      }
    }
    await GmailMessages.updateOne({ _id }, { messages });
  }
};

const filterOldMessages = async () => {
  const labels = await GmailMessages.find();
  for (let { _id, messages } of labels) {
    const filteredMessages = messages.filter(message => {
      const { creationTime } = message;
      const currentDate = new Date().getDate();
      if (currentDate - creationTime.getDate() <= 7) {
        return message;
      }
    });
    await GmailMessages.updateOne({ _id }, { messages: filteredMessages });
  }
};


module.exports = { saveDefaultLabels, saveMessages, updateOtherProjectStatusOnMessages, filterOldMessages };
