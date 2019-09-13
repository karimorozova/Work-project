const { updateProject } = require('./getProjects');

async function getProjectAfterFinanceUpdated({project, steps, tasks}) {
    try {
        let { finance } = project;
        finance.Price = getProjectFinancePrice(tasks);
        return await updateProject({"_id": project.id}, { finance, steps, tasks });
    } catch(err) {
        console.log(err);
        console.log("Error in getProjectAfterFinanceUpdated");
    }
}

function getProjectFinancePrice(tasks) {
    const receivables = +(tasks.reduce((prev, cur) => {
        if(cur.status === "Cancelled Halfway") {
           return prev + cur.finance.Price.halfReceivables;
        }
        return prev + cur.finance.Price.receivables;
    }, 0).toFixed(2));
    const payables = +(tasks.reduce((prev, cur) => {
        if(cur.status === "Cancelled Halfway") {
           return prev + cur.finance.Price.halfPayables;
        }
        return prev + cur.finance.Price.payables;
    }, 0).toFixed(2));
    return { receivables, payables };
}

function getUpdatedProjectFinance(tasks) {
    let receivables = 0;
    let payables = 0;
    for(let task of tasks) {
        if(task.status !== 'Cancelled') {
            receivables += task.status === "Cancelled Halfway" ? +task.finance.Price.halfReceivables : +task.finance.Price.receivables;
            payables += task.status === "Cancelled Halfway" ? +task.finance.Price.halfPayables : +task.finance.Price.payables;
        }
    }
    return { receivables: +receivables.toFixed(2), payables: +payables.toFixed(2) };
}

module.exports = { getProjectAfterFinanceUpdated, getUpdatedProjectFinance };