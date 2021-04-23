const { Delivery , Projects } = require("../models");
const { managerNotifyMail } = require("../utils/mailTemplate");
const { managerDr1Assigned , managerDr1Reassign } = require("../emailMessages/internalCommunication");
const { getProjectAfterUpdate } = require('../projects')

const dr1Instructions = [
    {text: "Check files/work on Memoq to ensure all segments were translated and mark in green", title:"On PMQA step we do the following", isChecked: false, isNotRelevant: false},
    {text: "Run a QA to see if there are any warnings or comments left by the vendors", title:"On PMQA step we do the following", isChecked: false, isNotRelevant: false},
    {text: "If there are any failures in the QA- please contact the vendors to modify the output, and re start the PMQA", title:"On PMQA step we do the following", isChecked: false, isNotRelevant: false},
    {text: "Check that the terms are translated according to the client's instructions, and that any character limitations have been followed", title:"On PMQA step we do the following", isChecked: false, isNotRelevant: false},
    {text: "If QA pass - Complete PMQA", title:"On PMQA step we do the following", isChecked: false, isNotRelevant: false},
    {text: "Open file to see if all is OK", title: "Download deliverables", isChecked: false, isNotRelevant: false},
    {text: "If file is word/excel/powerpoint/HTML (visual files) - send for sanity checkup to either translator or revisor", title: "Download deliverables", isChecked: false, isNotRelevant: false},
    {text: "Check Client's brief/instructions ", title: "Download deliverables", isChecked: false, isNotRelevant: false},
    {text: "Prepare & deliver file to AM", title: "Download deliverables", isChecked: false, isNotRelevant: false},
]
const dr2Instructions = [
    {text: "Check Language combinations (If the languages that were requested are the languages we are delivering", title:"", isChecked: false, isNotRelevant: false},
    {text: "Check File Type (Are we delivering the file format that was requested/required)", title:"", isChecked: false, isNotRelevant: false},
    {text: "ICheck Number of files (Are the number of files that were request and the same as the number of files we are delivering)", title:"", isChecked: false, isNotRelevant: false},
    {text: "Client's Brief", title:"Check if instructions followed", isChecked: false, isNotRelevant: false},
    {text: "Terms", title: "Check if instructions followed", isChecked: false, isNotRelevant: false},
    {text: "Other instructions (TOV, Style etc)", title: "Check if instructions followed", isChecked: false, isNotRelevant: false},
    {text: "Compare source & target files [Beyond Compare stage] (to check for any issues, omits or other mismatches) ", title: "Check if instructions followed", isChecked: false, isNotRelevant: false},
    {text: "If any issues send back to PMs", title: "Check if instructions followed", isChecked: false, isNotRelevant: false},
    {text: "Check Payment Profile of Client (PPP, Prepayment, Monthly)", title: "Check if instructions followed", isChecked: false, isNotRelevant: false},
    {text: "Deliver to client", title: "Check if instructions followed", isChecked: false, isNotRelevant: false},
    {text: "Comments (If any)", title: "Check if instructions followed", isChecked: false, isNotRelevant: false},
]

async function checkPermission({projectId, taskId, userId}) {
    try {
        let review = await Delivery.findOne({projectId, "tasks.taskId": taskId})
            .populate("tasks.dr1Manager")
            .populate("tasks.dr2Manager")
        // const { status, dr1Manager, dr2Manager, files, instructions } = getTaskData(review, taskId);
        // const isCheckedFile = !!files.find(item => item.isFileApproved);
        // const isCheckedInstruction = !!instructions.find(item => item.isChecked && item.isNotRelevant && item.step === status);
        // if(!isCheckedFile && !isCheckedInstruction) {
        //     review = await checkForReassign({status, dr1Manager, dr2Manager, projectId, taskId, userId}) || review;
        // }

        return getCorrectStatus({review, userId, taskId});
    } catch(err) {
        console.log(err);
        console.log("Error in checkPermission");
    }
}

function getTaskData(review, taskId) {
    return review.tasks.find(item => item.taskId === taskId);
}

function getCorrectStatus({review, userId, taskId}) {
    const {status, dr1Manager, dr2Manager} = getTaskData(review, taskId)

    if((status === "dr1" && userId !== dr1Manager.id) || (status === "dr2" && userId !== dr2Manager.id)){
        return "forbidden";
    }
    return "available";
}

async function checkForReassign({status, dr1Manager, dr2Manager, projectId, taskId, userId}) {
    const message = `Delivery review of the task ${taskId} is reassigned to another manager`;
    try {
        if(status === "dr1" && userId !== dr1Manager.id) {
            await managerNotifyMail(dr1Manager, message, `DR1 has been reassigned: ${taskId} (I009.0)`);
            return await Delivery.findOneAndUpdate({projectId, "tasks.taskId": taskId},
                {$set: {"tasks.$.dr1Manager": userId}},
                {new: true})
                .populate("tasks.dr1Manager").populate("tasks.dr2Manager");
        }
        if(status === "dr2" && userId !== dr1Manager.id && userId !== dr2Manager.id) {
            await managerNotifyMail(dr2Manager, message, `DR1 has been reassigned: ${taskId} (I009.0)`);
            return await Delivery.findOneAndUpdate({projectId, "tasks.taskId": taskId},
                {$set: {"tasks.$.dr2Manager": userId}},
                {new: true})
                .populate("tasks.dr1Manager").populate("tasks.dr2Manager");
        }
    } catch(err) {
        console.log(err);
        console.log("Error in checkForReassign");
    }
}

async function changeManager({ taskId, prevManager, manager, prop, isAdmin, status, project}) {
    const DRNumber = prop === "dr1Manager" ? '1' : '2';
    const messageToPrev = managerDr1Reassign({taskId, project, prevManager, manager}, DRNumber);
    const messageToNew = managerDr1Assigned({taskId, project, manager}, DRNumber);

    try {
        const updatedProject = await getProjectAfterUpdate({"_id": project._id, "tasksDR1.taskId": taskId}, { $set: {[`tasksDR1.$.${prop}`]: manager} })
        const isDr1 = prop === "dr1Manager";
        const isDr2 = status === "dr2" && prop === "dr2Manager";
        if(isAdmin && (isDr1 || isDr2)) {
            await managerNotifyMail(returnObj(prevManager), messageToPrev, `DR${DRNumber} has been reassigned: ${taskId} (I009.0)`);
            await managerNotifyMail(returnObj(manager), messageToNew, `The DR${DRNumber} has been assigned to you: ${taskId} (I009.1)`);
        }
        return updatedProject
    } catch(err) {
      console.log(err, 'on changeManager')
    }
    function returnObj(){
      return Array.isArray(prevManager) ? prevManager[0] : prevManager
    }
}

async function changeReviewStage({projectId, taskId}) {
    try {
        await Delivery.updateOne(
            {projectId, "tasks.taskId": taskId},
            {
                "tasks.$[i].isAssigned": true,
                "tasks.$[i].status": "dr2",
                "tasks.$[i].timestamp": new Date(),
                $push: {"tasks.$[i].instructions": {$each: dr2Instructions}},
                "tasks.$[i].files.$[j].isFileApproved": false
            },
            {arrayFilters: [{"i.taskId": taskId}, {"j.isFileApproved": true}]}
        )
    } catch(err) {
        console.log(err);
        console.log("Error in changeReviewStage");
    }
}

async function rollbackReview({projectId, taskId, manager}) {
    await Delivery.bulkWrite([
        {
            updateOne:
                {
                    filter: {projectId, "tasks.taskId": taskId},
                    update: {
                        "tasks.$[i].isAssigned": false,
                        "tasks.$[i].status": "dr1",
                        "tasks.$[i].dr1Manager": manager,
                        $pull: {"tasks.$[i].instructions": {step: "dr2"}},
                        "tasks.$[i].files.$[j].isFileApproved": false
                    },
                    arrayFilters: [{"i.taskId": taskId}, {"j.isFileApproved": true}]
                }
        },
        {
            updateOne:
                {
                    filter: {projectId, "tasks.taskId": taskId},
                    update: {
                        "tasks.$[i].instructions.$[k].isChecked": false,
                        "tasks.$[i].instructions.$[j].isNotRelevant": false,
                    },
                    arrayFilters: [{"i.taskId": taskId}, {"k.isChecked": true}, {"j.isNotRelevant": true}]
                }
        }
    ])
}

module.exports = { checkPermission, changeManager, changeReviewStage, rollbackReview, dr1Instructions }
