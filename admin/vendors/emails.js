const { Vendors } = require('../models');
const { testSentMessage, testNotPassedMessage, testPassedMessage } = require('../emailMessages/candidateCommunication');
const { sendEmail, sendEmailCandidates } = require('../utils/mailTemplate');
const fs = require('fs');

async function notifyTestStatus ({ vendor, qualification, testPath, template }) {
  const { source, target, industries, status } = qualification;
  let messageId = 'CAN001.0';
  let subject = `${target.lang} - Translator@Pangea position - Sample text for translation (ID ${messageId})`;
  let message;
  template ? message = template : message = testSentMessage({ ...vendor, source, target, industries });
  try {
    if (status === 'Test Sent') {
      await sendEmailCandidates({
        to: vendor.email,
        subject,
        attachments: [{ filename: testPath.split('/').pop(), content: fs.createReadStream(`./dist${testPath}`) }] }, message);

      return await sendEmailCandidates({
        to: 'career@pangea.global',
        subject: `(${vendor.firstName} ${vendor.surname || ''}) ` + subject,
        attachments: [{ filename: testPath.split('/').pop(), content: fs.createReadStream(`./dist${testPath}`) }] }, message);
    }
    messageId = status === 'Passed' ? 'CAN003.0' : 'CAN002.0';
    subject = status === 'Passed' ?
      `${target.lang} - Translator@Pangea position - Test Passed (ID ${messageId})`
      : `${target.lang} - Translator@Pangea position - Test Not Passed (ID ${messageId})`;
    message = status === 'Passed' ? testPassedMessage(vendor) :  testNotPassedMessage({ ...vendor, target });

    if (status === 'Passed') {
      const vendorAssessment = vendor.assessments.find((assessments) => assessments.sourceLanguage._id === source._id && assessments.targetLanguage._id === target._id)
      const assessmentIndustries = vendorAssessment.industries.find(({industry}) => qualification.industries.map(({_id})=> _id).includes(industry._id))
      const assessmentStep = assessmentIndustries.steps.reverse().find(({step})=> {
        return  qualification.steps.map(({_id})=> _id).includes(step._id)
      })

      await sendEmailCandidates({
        to: vendor.email,
        subject,
        attachments: [{ filename: assessmentStep.tqi.fileName, content: fs.createReadStream(`./dist${assessmentStep.tqi.path}`)}] },
        message);
      return await sendEmailCandidates({
        to: 'career@pangea.global',
        subject: `(${vendor.firstName} ${vendor.surname || ''}) ` + subject,
        attachments: [{ filename: assessmentStep.tqi.fileName, content: fs.createReadStream(`./dist${assessmentStep.tqi.path}`)}] },
        message);
    }
    if(status === 'Not Passed') {
      const { _id: qId } = vendor.qualifications.find(item =>
          `${item.source._id}` === `${qualification.source._id}` &&
          `${item.target._id}` === `${qualification.target._id}` &&
          item.industries.some(item => qualification.industries.find(elem => item._id.toString() === elem._id.toString())) &&
          item.steps.some(item => qualification.steps.find(elem => item._id.toString() === elem._id.toString()))
      )
      const {fileName, path} = vendor.notPassedQualifications.find(item => item.qId.toString() === qId.toString())

      await sendEmailCandidates({
        to: vendor.email,
        subject, attachments: [{ filename: fileName, content: fs.createReadStream(`./dist${path}`)}] },
        message);
      return await sendEmailCandidates({
        to: 'career@pangea.global',
        subject: `(${vendor.firstName} ${vendor.surname || ''}) ` + subject,
        attachments: [{ filename: fileName, content: fs.createReadStream(`./dist${path}`)}] },
        message);
    }

  } catch (err) {
    console.log(err);
    console.log('Error in notifyTestStatus');
  }
}

const sendMessageToVendor = async (vendorId, message) => {
  const { email } = await Vendors.findOne({ _id: vendorId });
  const subject = 'Pangea translation services';
  return await sendEmail({ to: email, subject }, message);
};

module.exports = {
  notifyTestStatus,
  sendMessageToVendor
};
