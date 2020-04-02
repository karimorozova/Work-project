const { Delivery } = require("../models");
const { managerNotifyMail } = require("../utils/mailTemplate");

const dr2Instructions = [
    {step: "dr2", text: "Check Language combinations", isChecked: false},
    {step: "dr2", text: "Check File Type", isChecked: false},
    {step: "dr2", text: "Check Number of files", isChecked: false},
    {step: "dr2", text: "Check source & target files", isChecked: false},
    {step: "dr2", text: "Beyond Compare", isChecked: false},
    {step: "dr2", text: "Were Instructions followed", isChecked: false},
    {step: "dr2", text: "Terms", isChecked: false},
    {step: "dr2", text: "TOV", isChecked: false},
    {step: "dr2", text: "Other instructions", isChecked: false},
    {step: "dr2", text: "Check Client Type (PPP, Prepayment, Monthly)", isChecked: false}        
]

async function checkPermission({projectId, taskId, userId}) {
    let reviewStatus = "available";
    try {
        let review = await Delivery.findOne({projectId, "tasks.taskId": taskId})
            .populate("tasks.dr1Manager").populate("tasks.dr2Manager")
        const { status, dr1Manager, dr2Manager, files, instructions } = getTaskData(review, taskId);
        const isCheckedFile = !!files.find(item => item.isFileApproved);
        const isCheckedInstruction = !!instructions.find(item => item.isChecked && item.step === status);
        if(!isCheckedFile && !isCheckedInstruction) {
            review = await checkForReassign({status, dr1Manager, dr2Manager, projectId, taskId, userId}) || review;
        }
        reviewStatus = getCorrectStatus({review, userId, taskId});
        return reviewStatus;
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
    if(status === "dr1" && userId !== dr1Manager.id
         || status === "dr2" && (userId !== dr2Manager.id || userId === dr1Manager.id)
        ) { 
            return "forbidden";
    }
    return "available";
}

async function checkForReassign({status, dr1Manager, dr2Manager, projectId, taskId, userId}) {
    const message = `Delivery review of the task ${taskId} is reassigned to another manager`;
    try {
        if(status === "dr1" && userId !== dr1Manager.id) {
            await managerNotifyMail(dr1Manager, message, 'Delivery review reassignment notification (I009.0)');
            return await Delivery.findOneAndUpdate({projectId, "tasks.taskId": taskId},
                {$set: {"tasks.$.dr1Manager": userId}},
                {new: true})
                .populate("tasks.dr1Manager").populate("tasks.dr2Manager");
        }
        if(status === "dr2" && userId !== dr1Manager.id && userId !== dr2Manager.id) {
            await managerNotifyMail(dr2Manager, message, 'Delivery review reassignment notification (I009.0)');
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

async function changeManager({projectId, taskId, prevManager, manager, prop, isAdmin, status}) {
    const key = `tasks.$.${prop}`;
    const updateQuery = {[key]: manager._id};
    const messageToPrev = `Delivery review of the task ${taskId} is reassigned to another manager`;
    const messageToNew = `Delivery review of the task ${taskId} assigned to you`;
    try {
        await Delivery.updateOne({projectId, "tasks.taskId": taskId}, updateQuery);
        const isDr1 = prop === "dr1Manager";
        const isDr2 = status === "dr2" && prop === "dr2Manager";
        if(isAdmin && (isDr1 || isDr2)) {
            await managerNotifyMail(prevManager, messageToPrev, 'Delivery review reassignment notification (I00.9)');
            await managerNotifyMail(manager, messageToNew, 'Task delivery review reassignment notification (I010.0)');
        }
    } catch(err) {

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
                    },
                    arrayFilters: [{"i.taskId": taskId}, {"k.isChecked": true}]
                }
        }
    ])
}

module.exports = { checkPermission, changeManager, changeReviewStage, rollbackReview }