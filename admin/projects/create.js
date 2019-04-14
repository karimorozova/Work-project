const { Projects } = require("../models");
const { getProject } = require("./getProjects");
const { storeFiles, deleteCopiedFiles } = require("./files");
const { createNewXtmCustomer, saveTemplateTasks } = require("../services/xtmApi");
const moment = require("moment");

async function createProject(project) {
    let todayStart = new Date();
    todayStart.setUTCHours(0,0,0,0);
    let todayEnd = new Date(todayStart);
    todayEnd.setUTCHours(23,59,59,0);
    try {
        const todaysProjects = await Projects.find({"createdAt" : { $gte : todayStart, $lt: todayEnd }});
        const nextNumber = (todaysProjects.length < 10) ? '[0' + (todaysProjects.length + 1) + ']': '[' + (todaysProjects.length + 1) + ']';
        project.status = project.status || "Draft";
        project.projectId = moment(new Date()).format("YYYY MM DD") + ' ' + nextNumber;
        const createProject = await Projects.create(project);
        return await getProject({"_id": createProject.id});
    } catch(err) {
        console.log(err);
        console.log('Error in createProject');
    }
}

async function createTasks({tasksInfo, sourceFiles, refFiles}) {
    let newTasksInfo = {...tasksInfo};
    newTasksInfo.stepsDates = tasksInfo.stepsDates ? JSON.parse(tasksInfo.stepsDates) : [];
    newTasksInfo.template = tasksInfo.template || '247336FD';
    newTasksInfo.workflow = tasksInfo.workflow || 2917;
    try {
        newTasksInfo.customerId = tasksInfo.customerId || await createNewXtmCustomer(tasksInfo.customerName);
        newTasksInfo.filesToTranslate = sourceFiles && sourceFiles.length ? await storeFiles(sourceFiles, tasksInfo.projectId): [];
        newTasksInfo.referenceFiles = refFiles && refFiles.length ? await storeFiles(refFiles, tasksInfo.projectId) : [];
        await deleteCopiedFiles();
        const project = await Projects.findOne({"_id": tasksInfo.projectId});
        await addTasksToXtm({newTasksInfo, project});
        return await getProject({"_id": newTasksInfo.projectId});
    } catch(err) {
        console.log(err);
        console.log("Error in createTasks");
    }
}

async function addTasksToXtm({newTasksInfo, project}) {
    try {
        let tasksLength = project.tasks.length + 1;
        for(let target of newTasksInfo.targets) {
            let name = `${project.projectId} - ${project.projectName} (${target.xtm.toUpperCase()})`
            let xtmProject = await saveTemplateTasks({
                customerId: newTasksInfo.customerId,
                name: name,
                source: newTasksInfo.source.xtm,
                target: target.xtm,
                sourceFiles: newTasksInfo.filesToTranslate,
                refFiels: newTasksInfo.referenceFiles,
                templateId: newTasksInfo.template,
                workflowId: newTasksInfo.workflow,
                join: newTasksInfo.join
            });
            let idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`; 
            let taskId = project.projectId + ` ${idNumber}`;
            await updateProjectTasks({newTasksInfo, project, xtmProject, taskId, target})
            tasksLength++
        }
    } catch(err) {
        console.log(err);
        console.log("Error in addTasksToXtm");
    }
}

async function updateProjectTasks({newTasksInfo, project, xtmProject, taskId, target}) {
    try {
        await Projects.updateOne({"_id": project._id}, 
            {$set: {sourceFiles: newTasksInfo.filesToTranslate, refFiles: newTasksInfo.referenceFiles, isMetricsExist: false}, 
            $push: {tasks: {taskId: taskId, xtmJobs: xtmProject.jobs, service: newTasksInfo.service, projectId: xtmProject.projectId, 
                start: project.createdAt, deadline: project.deadline, stepsDates: newTasksInfo.stepsDates, sourceLanguage: newTasksInfo.source.symbol, targetLanguage: target.symbol, 
                status: "Created", cost: "", sourceFiles: newTasksInfo.filesToTranslate, refFiles: newTasksInfo.referenceFiles, receivables: "", 
                payables: "", check: false, finance: {'Wordcount': {receivables: "", payables: ""}, 
                'Price': {receivables: "", payables: ""}}}}}
            );
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectTasks");
    }
}

module.exports = { createProject, createTasks }