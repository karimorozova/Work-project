const { getToken } = require('./authorization');
const { google: { gmail: gmailApi } } = require('googleapis');
const { GmailProjectsStatuses } = require('../models');
const fs = require('fs');
const csv = require('csv-parser');

const wait = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

const saveProjectStatuses = async (auth) => {
	if(!auth) getToken(saveProjectStatuses);
	else {
		const gmail = gmailApi({ version: 'v1', auth });
		await saveAttachmentDataFromMessagesByLabelId(gmail, 'Label_4897832564654206611')
	}
};

const saveAttachmentDataFromMessagesByLabelId = async (gmail, labelId) => {
	const result = await GmailProjectsStatuses.find();
	await gmail.users.messages.list({
				userId: 'me',
				labelIds: labelId
			},
			async (err, res) => {
				for (let { id } of res.data.messages) {
					await wait(500);
					await gmail.users.messages.get({
								userId: 'me',
								id: id
							},
							async (err, res) => {
								for (let part of res.data.payload.parts.filter(item => item.body.hasOwnProperty('attachmentId'))) {
									await gmail.users.messages.attachments.get({
												userId: 'me',
												messageId: id,
												id: part.body.attachmentId
											},
											async (err, res) => {
												if(res) {
													fs.writeFile('./dist/emails/sendQuote.csv', Buffer.from(res.data.data, 'base64'), (err) => {
														if(err) throw err;
														console.log('successfully SAVED!');
														fs.createReadStream('./dist/emails/sendQuote.csv').pipe(csv(
																{ separator: '\t' }
														)).on('data', async (data) => {

															await saveProjectsStatusToDB(data, result, 'Quote');

														}).on('end', () => {
															fs.unlink('./dist/emails/sendQuote.csv', (err) => {
																if(err) throw err;
																console.log('successfully DELETED!');
															});
														});
													});
												}
											});
								}
							});
				}
			})
}

const saveProjectsStatusToDB = async (csvStr, allProjectsStatuses, status) => {
	if(Object.values(csvStr).length) {
		const [projectId, projectName] = Object.values(csvStr);
		const name = `${ projectId } - ${ projectName }`;
		const findIndex = allProjectsStatuses.findIndex(({ name: n, status: s }) => n === name && s === status);
		if(findIndex === -1) await GmailProjectsStatuses.create({ name, status })
	}
};


module.exports = {
	saveProjectStatuses,
};
