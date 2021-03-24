const moment = require('moment');

const { Vendors } = require("../models")
export function deleteEmptyOrNotCreatedByManger () {
  const notEmptyOrCreatedByManagerFilter = [
      {isCreatedByManager: false},
      { status: 'Potential'},
      { $or: [{pendingCompetencies: { $size: 0}}, {pendingCompetencies: { $exists: false}}] },
      { $or: [{competencies: { $size: 0}}, {competencies: { $exists: false}}] },
      { $or: [{approvedPendingCompetencies: { $size: 0}}, {approvedPendingCompetencies: { $exists: false}}] },
      {'dateInfo.createdAt': { $exists: true, $lte: moment().subtract(21, 'days').set({hours: 23, minutes: 59}.format())}}
    ]
  const vendors = Vendors.find(notEmptyOrCreatedByManagerFilter)

  //sending mails
  // for(const vendor in vendors) {
  // }

  Vendors.deleteMany({_id: {$in: vendors.map(({_id}) => _id)}})
}
module.exports = {
  deleteEmptyOrNotCreatedByManger
}
