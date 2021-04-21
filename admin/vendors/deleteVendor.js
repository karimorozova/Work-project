const moment = require('moment');
const { sendEmail } = require('../utils');

const { Vendors } = require("../models")
async function deleteEmptyOrNotCreatedByManger () {
  const notEmptyOrCreatedByManagerFilter = {
      isCreatedByManager: false,
       status: 'Potential',
       '$or': [{pendingCompetencies: { $size: 0}}, {pendingCompetencies: { $exists: false}}] ,
       '$or': [{competencies: { $size: 0}}, {competencies: { $exists: false}}] ,
       '$or': [{approvedPendingCompetencies: { $size: 0}}, {approvedPendingCompetencies: { $exists: false}}] ,
      'dateInfo.createdAt': { $exists: true, $lte: moment().subtract(30, 'days').set({hours: 23, minutes: 59}).format()}
  }
  const vendors = await Vendors.find(notEmptyOrCreatedByManagerFilter)

  //sending mails
  await sendAccountDeletedMail(vendors)

  await Vendors.deleteMany({_id: {$in: vendors.map(({_id}) => _id)}})
  }

async function sendPreventDeleteNotActiveVendor () {
  const notEmptyOrCreatedByManagerFilter = {
    isCreatedByManager: false,
    status: 'Potential',
    '$or': [{pendingCompetencies: { $size: 0}}, {pendingCompetencies: { $exists: false}}] ,
    '$or': [{competencies: { $size: 0}}, {competencies: { $exists: false}}] ,
    '$or': [{approvedPendingCompetencies: { $size: 0}}, {approvedPendingCompetencies: { $exists: false}}] ,
    'dateInfo.createdAt': { $exists: true, $lte: moment().subtract(25, 'days').set({hours: 23, minutes: 59}).format(), $gte:  moment().subtract(25, 'days').set({hours: 0, minutes: 0}).format()}
  }
  const vendors = await Vendors.find(notEmptyOrCreatedByManagerFilter)

  //sending mails
  await sendPreventDeleteMail(vendors)

}

async function sendAccountDeletedMail(vendors) {
  if(!vendors.length) return
  for(const vendor of vendors) {
    const message = `<p>Dear ${vendor.firstName},</p>
                    <p>Much as we regret saying “Goodbye”, unfortunately we have to part ways. Please be aware that we have removed your profile information as there was no consistent activity for more than 25 consecutive days.</p>
                    <p>Should you wish to work with Pangea Global at any time, feel free to register again. No hard feelings!</p>
                    <p>Wishing you all the best in your future ventures,</p>
                    <p>Pangea Global</p>`
    await sendEmail({
      to: vendor.email,
      subject: `Your account deleted!`
    }, message)
  }
}
async function sendPreventDeleteMail(vendors) {

  for(const vendor of vendors) {
    const message = `<p>Dear ${vendor.firstName},</p>
                    <p>You haven't been active for 25 consecutive days. At Pangea, we are always in need of expertise like yours.</p>

                    <p>Please set the competencies in your profile</p>

                    <p>Should you no longer be interested in working with us, please disregard this reminder and rest assured we will delete your data within the next 5 business days.</p>
                    <p>Sincerely,</p>
                    <p>Pangea Global</p>`
    await sendEmail({
      to: vendor.email,
      subject: `Your account will delete!`
    }, message)

  }
}


module.exports = {
  deleteEmptyOrNotCreatedByManger,
  sendPreventDeleteNotActiveVendor
}
