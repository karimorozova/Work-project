const { Projects } = require("../models");
const { getProject, updateProject } = require("./getProjects");
const { storeFiles } = require("./files");
const { createNewXtmCustomer, saveTemplateTasks } = require("../services/xtmApi");
const { getFinanceDataForPackages } = require("../сalculations/packages");
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
        const createdProject = await Projects.create(project);
        return await getProject({"_id": createdProject.id});
    } catch(err) {
        console.log(err);
        console.log('Error in createProject');
    }
}

async function createTasks({tasksInfo, sourceFiles, refFiles}) {
    const { calculationUnit } = tasksInfo.service;
    try {
        if(calculationUnit === 'Words') {
            return await createTasksWithWordsUnit({tasksInfo, sourceFiles, refFiles});
        } else {
            const stepsDates = JSON.parse(tasksInfo.stepsDates);
            const project = await getProject({"_id": tasksInfo.projectId});
            const taskRefFiles = await storeFiles(refFiles, tasksInfo.projectId);
            const allInfo = {...tasksInfo, taskRefFiles, stepsDates, project};
            return calculationUnit === 'Hours' ? await createTasksWithHoursUnit(allInfo) : await createTasksWithPackagesUnit(allInfo);  
        }
    } catch(err) {
        console.log(err);
        console.log("Error in createTasks");
    }
}


/// Creating tasks for wordcount unit services start ///

async function createTasksWithWordsUnit({tasksInfo, sourceFiles, refFiles}) {
    let newTasksInfo = {...tasksInfo};
    newTasksInfo.stepsDates = tasksInfo.stepsDates ? JSON.parse(tasksInfo.stepsDates) : [];
    newTasksInfo.template = tasksInfo.template || '247336FD';
    newTasksInfo.workflow = tasksInfo.workflow || 2917;
    try {
        newTasksInfo.customerId = tasksInfo.customerId || await createNewXtmCustomer(tasksInfo.customerName);
        newTasksInfo.filesToTranslate = sourceFiles && sourceFiles.length ? await storeFiles(sourceFiles, tasksInfo.projectId): [];
        newTasksInfo.referenceFiles = refFiles && refFiles.length ? await storeFiles(refFiles, tasksInfo.projectId) : [];
        const project = await Projects.findOne({"_id": tasksInfo.projectId});
        await addTasksToXtm({newTasksInfo, project});
        return await getProject({"_id": newTasksInfo.projectId});
    } catch(err) {
        console.log(err);
        console.log("Error in createTasksWithWordsUnit");
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
                status: "Created", cost: "", sourceFiles: newTasksInfo.filesToTranslate, refFiles: newTasksInfo.referenceFiles, check: false, 
                finance: {'Wordcount': {receivables: 0, payables: 0}, 'Price': {receivables: 0, payables: 0}}}}}
            );
    } catch(err) {
        console.log(err);
        console.log("Error in updateProjectTasks");
    }
}

/// Creating tasks for wordcount unit services end ///

/// Creating tasks for hours unit services start ///

async function createTasksWithHoursUnit(allInfo) {
    
}

/// Creating tasks for wordcount unit services end ///

/// Creating tasks for packages unit services start ///

async function createTasksWithPackagesUnit(allInfo) {
    const { projectId, project, service, targets, packageSize } = allInfo;
    try {
        const {vendor, vendorRate, clientRate, payables, receivables} = await getFinanceDataForPackages({project, service, packageSize, target: targets[0]});
        const finance = {Wordcount: {receivables: "", payables: ""}, Price: {receivables, payables}};
        const tasks = getTasksForPackages({...allInfo, projectId: project.projectId, finance});
        const steps = getStepsForPackages({tasks, vendor, vendorRate, clientRate});
        const projectFinance = getProjectFinanceForPackages(tasks, project.finance);
        return updateProject({"_id": projectId}, { finance: projectFinance, $push: {tasks: tasks, steps: steps} });
    } catch(err) {
        console.log(err);
        console.log("Error in createTasksWithPackagesUnit");
    }
}

function getProjectFinanceForPackages(tasks, projectFinance) {
    const currentReceivables = projectFinance.Price.receivables || 0;
    const currentPayables = projectFinance.Price.payables || 0;
    const receivables = tasks.reduce((acc,cur) => acc + cur.finance.Price.receivables, 0) + currentReceivables;
    const payables = tasks.reduce((acc,cur) => acc + cur.finance.Price.payables, 0) + currentPayables;
    return {
        Price: {receivables, payables},
        Wordcount: {...projectFinance.Wordcount}
    }
}

function getTasksForPackages(tasksInfo) {
    const { projectId, service, targets, packageSize, quantity, stepsDates, taskRefFiles, finance } = tasksInfo;
    let tasks = [];
    for(let i = 0; i < quantity; i++) {
        const idNumber = i+1 < 10 ? `T0${i+1}` : `T${i+1}`; 
        const taskId = projectId + ` ${idNumber}`;
        tasks.push({
            taskId,
            targetLanguage: targets[0].symbol,
            packageSize,
            refFiles: taskRefFiles,
            service,
            projectId,
            start: stepsDates[0].start,
            deadline: stepsDates[0].deadline,
            finance,
            status: 'Created'
        })
    }
    return tasks;
}

function getStepsForPackages({tasks, vendor, vendorRate, clientRate}) {
    let counter = 1;
    return tasks.reduce((acc, cur) => {
        const stepsIdCounter = counter < 10 ? `S0${counter}` : `S${counter}`;
        acc.push({
            ...cur,
            stepId: `${cur.taskId} ${stepsIdCounter}`,
            serviceStep: cur.service.steps[0].step,
            name: cur.service.steps[0].step.title,
            vendor,
            progress: 0,
            clientRate,
            vendorRate,
            check: false,
            vendorsClickedOffer: [],
            isVendorRead: false
        })
        return [...acc];
    }, [])
}

/// Creating tasks for packages unit services end ///

module.exports = { createProject, createTasks }