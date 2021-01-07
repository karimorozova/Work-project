const { getToken } = require('./authorization');
const { google: { gmail: gmailApi } } = require('googleapis');
const { GmailProjectsStatuses } = require('../models');
const fs = require('fs');
const csv = require('csv-parser');

const wait = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

const saveOtherProjectStatuses = async (auth) => {
	if(!auth) getToken(saveOtherProjectStatuses);
	else {
		const gmail = gmailApi({ version: 'v1', auth });
		await saveAttachmentDataFromMessagesByLabelId(gmail, 'Label_4897832564654206611', 'Quote');
		await wait(10000);
		await saveAttachmentDataFromMessagesByLabelId(gmail, 'Label_1714380902505568051', "In progress");
		await wait(10000);
		await saveAttachmentDataFromMessagesByLabelId(gmail, 'Label_8132819458511673536', "");
	}
};
const saveAttachmentDataFromMessagesByLabelId = async (gmail, labelId, status) => {
	const result = await GmailProjectsStatuses.find();
	// await gmail.users.labels.list({
	// 		userId: 'me',
	// 	},async (err, res) => {
	// 	console.log(res.data.labels.find(item => item.name === 'XTRF Project Status'));
	// })

	await gmail.users.messages.list({
				userId: 'me',
				labelIds: labelId
			},
			async (err, res) => {
				for (let { id } of res.data.messages.slice(0, 10)) {
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
													fs.writeFile('./dist/emails/File.csv', Buffer.from(res.data.data, 'base64'), (err) => {
														if(err) throw err;
														console.log('successfully file SAVED! for label =>', labelId);
														fs.createReadStream('./dist/emails/File.csv').pipe(csv(
																{ separator: '\t' }
														)).on('data', async (data) => {
															if(labelId === 'Label_8132819458511673536') {
																await saveFinalProjectsStatusToDB(data, result);
															} else {
																await saveProjectsStatusToDB(data, result, status);
															}
														}).on('end', () => {
															fs.unlink('./dist/emails/File.csv', (err) => {
																if(err) throw err;
																console.log('successfully file DELETED! for label =>', labelId);
															});
														});
													});
												}
											});
								}
							});
				}
			})
};

const saveFinalProjectsStatusToDB = async (csvStr, allProjectsStatuses) => {
	if(Object.values(csvStr).length) {
		let [projectId, projectName, status] = Object.values(csvStr);
		status = status === 'Open' ? 'In progress' : status;
		const name = `${ projectId } - ${ projectName }`;
		const existingObjInx = allProjectsStatuses.findIndex(({ name: n }) => n === name.trim());
		if(existingObjInx !== -1) {
			const currObj = allProjectsStatuses[existingObjInx];
			currObj.status = status;
			await GmailProjectsStatuses.updateOne({ _id: currObj._id }, { currObj })
		} else {
			await GmailProjectsStatuses.create({ name, status })
		}
	}
};

const saveProjectsStatusToDB = async (csvStr, allProjectsStatuses, status) => {
	if(Object.values(csvStr).length) {
		const [projectId, projectName] = Object.values(csvStr);
		const name = `${ projectId } - ${ projectName }`;
		const findIndex = allProjectsStatuses.findIndex(({ name: n, status: s }) => n === name.trim() && s === status);
		if(findIndex === -1) await GmailProjectsStatuses.create({ name, status })
	}
};


module.exports = {
	saveOtherProjectStatuses,
};
