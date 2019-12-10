const { Delivery } = require("../models");

async function checkPermission({projectId, taskId, userId}) {
    let reviewStatus = "available";
    try {
        const review = await Delivery.findOne({projectId, "tasks.taskId": taskId})
            .populate("tasks.dr1Manager").populate("tasks.dr2Manager")
        const task = review.tasks.find(item => item.taskId === taskId);
        const { status, dr1Manager, dr2Manager, files, instructions } = task;
        const isCheckedFile = !!files.find(item => item.isFileApproved);
        const isCheckedInstruction = !!instructions.find(item => item.isChecked && item.step === status);
        if(!isCheckedFile && !isCheckedInstruction) {
            await checkForReassign({status, dr1Manager, projectId, taskId, userId});
        } else {
            reviewStatus = getCorrectStatus({status, dr1Manager, dr2Manager, userId})
        }
        return reviewStatus;
    } catch(err) {
        console.log(err);
        console.log("Error in checkPermission");
    }
}

function getCorrectStatus({status, dr1Manager, dr2Manager, userId}) {
    if(status === "dr1" && userId !== dr1Manager.id
         || status === "dr2" && (userId !== dr2Manager.id || userId !== dr1Manager.id)
        ) { 
            return "forbidden";
    }
    return "available";
}

async function checkForReassign({status, dr1Manager, projectId, taskId, userId}) {
    try {
        if(status === "dr1" && userId !== dr1Manager.id) {
            return await Delivery.updateOne({projectId, "tasks.taskId": taskId},
                {"tasks.$.dr1Manager": userId});
        }
        if(status === "dr2" && userId !== dr1Manager.id) {
            return await Delivery.updateOne({projectId, "tasks.taskId": taskId},
                {"tasks.dr2Manager": userId});
        }
    } catch(err) {
        console.log(err);
        console.log("Error in checkForReassign");
    }
}

module.exports = { checkPermission }