const EventEmitter = require('events');
const emitter = new EventEmitter();
const { Vendors, Projects } = require('../models');
const { sendEmail, notifyManagerProjectStarts, notifyManagerProjectRejected } = require('../utils');
const { notifyStepDecisionMade } = require('../projects/emails');
const { setStepsStatus } = require('../projects/updates');
const { updateMemoqProjectUsers } = require('../services/memoqs/projects');

emitter.on('testEvent', () => {
    setTimeout(async () => {
      try {
        const vendors = await Vendors.find();
        const message = 'Some message here';
        await sendEmail({ to: vendors[0].email, subject: 'Just a test email' }, message);
        console.log('emitted');
      } catch (err) {
        console.log('Error from emitter testEvent');
        console.log(err);
      }
    }, 60000)
});

emitter.on('projectRejectedNotification', async (project) => {
    try {
        await notifyManagerProjectRejected(project);
    } catch(err) {
        console.log("Error from emitter projectRejectedNotification");
        console.log(err);
    }
})

emitter.on('stepAcceptAction', async (obj) => {
    const { project, index, vendorId, decision } = obj;
  let { steps, status: projectStatus } = project;
  const isProjectApproved = projectStatus === 'Approved' || projectStatus === 'In progress';
  const status = decision === 'accept' ? 'Accepted' : 'Rejected';
    steps[index].status = status === "Accepted" && isProjectApproved ? "Ready to Start" : status;
    steps[index].vendorsClickedOffer.push(vendorId);
    steps = setStepsStatus({steps: [{...steps[index], _id: steps[index].id}], status: steps[index].status, project});
    try {
        const isStart = steps[index].status === "Ready to Start" || steps[index].status === "Waiting to Start"
        if(isStart && steps[index].serviceStep.calculationUnit === "Words") {
            await updateMemoqProjectUsers(steps);
        }
        await Projects.updateOne({"_id": project.id}, { steps });
        await notifyStepDecisionMade({project, step: steps[index], decision});
    } catch(err) {
        console.log("Error from emitter stepAcceptAction");
        console.log(err);
    }
})
module.exports = { emitter };
