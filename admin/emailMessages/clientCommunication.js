const apiUrl = require("../helpers/apiurl");
const jwt = require('jsonwebtoken');
const { secretKey } = require('../configs');
const moment = require('moment');

function messageForClient(obj) {
  const date = Date.now();
  const { minimumCharge: { value, toIgnore } } = obj;
  let total = obj.finance.Price.receivables;
  const fromMinimumCharge = !toIgnore ? (value > total) : false;
  total = !toIgnore ? (value > total ? value : total) : total;
  const name = `${obj.contact.firstName} ${obj.contact.surname}`;
  const activeTasks = obj.tasks.filter(item => item.status !== "Cancelled");
  const tasksInfo = obj.selectedTasks.length ? getTasksInfo(obj.selectedTasks, obj.steps) : getTasksInfo(activeTasks, obj.steps);
  const subTotal = obj.selectedTasks.length ? getSubTotal(obj.selectedTasks, obj.steps) : getSubTotal(activeTasks, obj.steps);
  const tmDiscount = (obj.finance.Price.receivables - subTotal).toFixed(2);
  const token = jwt.sign({ id: obj.id }, secretKey, { expiresIn: '2h' });

  let detailHeader = "Please see below the quote details:";
  if (obj.isPriceUpdated) {
    detailHeader = "Your quote has been updated - please see below the quote details:";
  }
  const reason = obj.reason ? `<p>Reason ${obj.reason}</p><p>Please see below the updated quote details</p>` : "";
  let acceptQuote = '<a href=' + `${apiUrl}/projectsapi/acceptquote?projectId=${obj.id}&to=${date}&t=${token}` + ` target="_blank" style="color: #D15F46;">I accept - ${obj.projectId}, ${obj.finance.Price.receivables} &euro;</a>`;
  let declineQuote = '<a href=' + `${apiUrl}/projectsapi/declinequote?projectId=${obj.id}&to=${date}t=${token}` + ` target="_blank" style="color: #D15F46;">I reject - ${obj.projectId}, ${obj.finance.Price.receivables} &euro;</a>`;
  if(obj.selectedTasks.length){
    let taskIdsString = '';
    obj.selectedTasks.forEach(task => taskIdsString += `${task.taskId};`);
    taskIdsString = taskIdsString.replace(/[' ']/g, '%');
    acceptQuote = '<a href=' + `${apiUrl}/projectsapi/accept-decline-tasks-quote?projectId=${obj.id}&tasksIds=${taskIdsString}&t=${token}&to=${date}&prop=Approved` + ` target="_blank" style="color: #D15F46;">I accept - ${obj.projectId}, ${obj.finance.Price.receivables} &euro;</a>`;
    declineQuote = '<a href=' + `${apiUrl}/projectsapi/accept-decline-tasks-quote?projectId=${obj.id}&tasksIds=${taskIdsString}&t=${token}&to=${date}&prop=Rejected` + ` target="_blank" style="color: #D15F46;">I reject - ${obj.projectId}, ${obj.finance.Price.receivables} &euro;</a>`;
  }

    return `<div class="wrapper"
                style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;">
                <header style="background-color:#66563E;text-align:center;">
                    <img class="logo" src="cid:logo@pan" alt="pangea"
                        style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;">
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;">
                    <p class="main_italic main_line15 main_weight600"
                        style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;">
                        ***This is an automated message***<br>
                        This message is sent to you on behalf of ${obj.accountManager.firstName} ${obj.accountManager.lastName}</p>
                    <p>${detailHeader}</p>
                    <div class="details" style="width:90%;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;">
                        <h4 class="details__title">Quote Details</h4>
                        <table class="details__table"
                            style="color:#66563E;width:100%;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                    Name:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    ${obj.projectName}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                    ID:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    ${obj.projectId}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                    Industry:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    ${obj.industry.name}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                    Estimated delivery date:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    ${moment(obj.deadline).format('LLL')}</td>
                            </tr>
                        </table>
                        </br>
                        <table class="details__table"
                            style="width:100%;color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Service</td>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Language</td>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Unit Price</td>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Unit</td>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Quantity</td>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Cost</td>
                            </tr>
                            ${tasksInfo}

                        </table>
                        </br>
                        <table class="details__table"
                            style="color:#66563E;min-width: 32%;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Sub-total:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                                    &euro; ${subTotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    TM Discount:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                                    &euro; ${tmDiscount}</td>
                            </tr>

                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                ${fromMinimumCharge ? 'Total (minimum charge)' : 'Total'}:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                                    &euro; ${total}</td>
                            </tr>
                        </table>

                    </div>
                    <p class="main_weight600 main_line15" style="font-weight:600;line-height:1.5;">
                        By clicking on one of the link below, you can accept or reject our offer.<br>
                        <span class="main_line15-red"
                            style="background-color:#FBF3DB;padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;">
                            Clicking "I accept" will also approve and accept our <a
                                href="https://www.pangea.global/wp-content/uploads/2019/11/Pangea-Terms-Conditions.pdf" class="link"
                                style="color:#D15F46;">terms and conditions</a>
                        </span>
                    </p>
                    <p>You can accept the quote by clicking the link below:</p>
                    I accept - ${acceptQuote}
                    <p>or</p>
                    I reject - ${declineQuote}
                    <p><span class="main_weight600 main_line15" style="font-weight:600;line-height:1.5;">Please note:</span>once
                        accepting the quote, the project will start
                        automatically.<br>
                        In case of any questions, please do not hesitate to contact us :-)</p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global"
                        style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;">www.pangea.global</a>
                </footer>
            </div>`;

}

const getMessagesForContacts = (quotesArr) => {
  // const messagesArr = [];
  // for (let quote of quotesArr) {
  //   messagesArr.push(messageForClient(quote));
  // }
  // return messagesArr;
};

function getSubTotal (tasks, steps) {
  return tasks.reduce((acc, cur) => {
    const taskSteps = steps.filter(item => item.taskId === cur.taskId);
    let unitPrice = taskSteps.reduce((sum, c) => {
      return sum += c.clientRate ? c.clientRate.value : 0;
    }, 0);
    let totalQuantity = cur.metrics ? cur.metrics.totalWords : 0;
    if (cur.service.calculationUnit !== 'Words') {
      totalQuantity = cur.finance.Price.receivables;
            unitPrice = 1;
        }
        return acc + +(unitPrice*totalQuantity);
    }, 0);
}

function getTasksInfo(tasks, steps) {
    const tasksInfo = tasks.reduce((acc, cur) => {
        const taskSteps = steps.filter(item => item.taskId === cur.taskId);
        const unitPrice = taskSteps.reduce((sum, c) => {
            return sum += c.clientRate ? c.clientRate.value : 0;
        }, 0);
        const langPair = cur.sourceLanguage ? `${cur.sourceLanguage} >> ${cur.targetLanguage}` : `${cur.targetLanguage} / ${cur.packageSize}`;
        let totalQuantity = cur.metrics ? cur.metrics.totalWords : 0;
        let cost = unitPrice*totalQuantity;
        if(cur.service.calculationUnit !== 'Words') {
            totalQuantity = cur.service.calculationUnit === 'Hours' ? taskSteps[0].quantity : 1;
            cost = cur.finance.Price.receivables;
        }
        acc.push({
            task: cur.service.title,
            langPair: `${langPair}`,
            unitPrice: unitPrice,
            unit: cur.service.calculationUnit,
            quantity: totalQuantity,
            cost
        })
        return [...acc];
    }, [])
    let result = "";
    for(let info of tasksInfo) {
        result += getTaskCode(info);
    }
    return result;
}

function getTaskCode(taskInfo) {
    return `<tr>
                <td
                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${taskInfo.task}</td>
                <td
                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${taskInfo.langPair}</td>
                <td
                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    &euro; ${taskInfo.unitPrice}</td>
                <td
                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${taskInfo.unit}</td>
                <td
                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${taskInfo.quantity}</td>
                <td
                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    &euro; ${taskInfo.cost.toFixed(2)}</td>
            </tr>`;
}

function getPdfOfQuote(obj, tasksIds = []){
    const selectedTasks = !tasksIds.length  ? obj.tasks.filter(item => item.status !== "Cancelled") : obj.tasks.filter(task => tasksIds.includes(task.taskId));
    const tasksInfo = getTasksInfoPdf(selectedTasks, obj.steps);
    const subTotal = getSubTotal(selectedTasks, obj.steps);
    const clientName = obj.customer.officialName || obj.customer.name;
    const contact = obj.customer._doc.contact ? obj.customer._doc.contact : obj.customer.contacts.find(item => item.leadContact);
    return `<div class="wrapper pdf" style="width:800px;font-size:12px!important;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="text-align:center;padding-top:15px;padding-bottom:15px;padding-right:0;padding-left:0;" >
                    <img src="static/logo.png" alt="">
                </header>
                <div class="quote__header" style="font-size:14px;background-color:#66563D;color:white;text-transform:uppercase;text-align:center;font-weight:bold;padding-top:15px;padding-bottom:15px;padding-right:0;padding-left:0;" >
                    quote
                </div>
                <div class="quote" style="display: -webkit-box;" >
                    <div class="quote__left" style="width:380px;margin-top:20px;margin-bottom:20px;margin-right:10px;margin-left:10px;" >
                        <div class="quote__row" style="padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;display:-webkit-box;" >
                            <div class="quote__row-title to" style="text-align:center;font-weight:bold;width:100px;" >
                                To:
                            </div>
                            <div class="quote__row-text" style="width:300px;" >
                                <b>${contact.firstName} ${contact.surname}</b>
                            </div>
                        </div>
                        <div class="quote__row" style="padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;display:-webkit-box;" >
                            <div class="quote__row-title" style="font-weight:bold;width:100px;" ></div>
                            <div class="quote__row-text" style="width:300px;" >
                                ${clientName}
                            </div>
                        </div>
                        <div class="quote__row" style="padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;display:-webkit-box;" >
                            <div class="quote__row-title" style="font-weight:bold;width:100px;" ></div>
                            <div class="quote__row-text" style="width:300px;" >
                                ${obj.customer.address}
                            </div>
                        </div>
                    </div>
                    <div class="quote__right" style="width:380px;margin-top:20px;margin-bottom:20px;margin-right:10px;margin-left:10px;" >
                        <div class="quote__row" style="padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;display:-webkit-box;" >
                            <div class="quote__row-title" style="font-weight:bold;width:100px;" >
                                Date:
                            </div>
                            <div class="quote__row-text" style="width:300px;" >
                                ${moment(obj.deadline).format('LLL')}
                            </div>
                        </div>
                        <div class="quote__row" style="padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;display:-webkit-box;" >
                            <div class="quote__row-title" style="font-weight:bold;width:100px;" >
                                Currency:
                            </div>
                            <div class="quote__row-text" style="width:300px;" >
                                Euros
                            </div>
                        </div>
                        <div class="quote__row" style="padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;display:-webkit-box;" >
                            <div class="quote__row-title" style="font-weight:bold;width:100px;" >
                                Quote ID:
                            </div>
                            <div class="quote__row-text" style="width:300px;" >
                                ${obj.projectId}
                            </div>
                        </div>
                    </div>

                </div>
                <div class="quote__subheader" style="text-align:center;font-weight:bold;padding-top:15px;padding-bottom:15px;padding-right:0;padding-left:0;border-top-width:1px;border-top-style:solid;border-top-color:#66563D;" >
                    ${obj.projectName}
                </div>
                <table style="width:100%;border-collapse:collapse;color:#66563D;" >
                    <thead style="background-color:#66563D;color:white;" >
                        <tr>
                            <th style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" >Quantity</th>
                            <th style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" >Unit</th>
                            <th style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" >Description</th>
                            <th style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" >Unit Price</th>
                            <th style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" >Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tasksInfo}
                        <tr>
                            <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                            <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                            <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                            <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                            <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                        </tr>
                        <tr>
                            <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                            <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                            <td class="table__text-bold" style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:bold;" >
                            Sub-total</td>
                            <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                            <td class="table__text-right table__text-bold" style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:bold;text-align:right;" ><span style="padding-right: 5px;" >&euro;</span>
                            ${subTotal.toFixed(2)}</td>
                        </tr>

                        <tr>
                            <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                            <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                            <td class="table__text-bold" style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:bold;" >
                            Total</td>
                            <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                            <td class="table__text-right table__text-bold" style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:bold;text-align:right;" ><span style="padding-right: 5px;" >&euro;</span>
                            ${obj.finance.Price.receivables}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="notes__header" style="background-color:#66563D;color:white;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:15px;font-weight:bold;" >
                    Notes
                </div>
                <div class="notes__right" style="width:600px;margin-top:10px;margin-bottom:10px;margin-right:15px;margin-left:15px;" >
                    <div class="notes__row" style="display:-webkit-box;padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;" >
                        <div class="notes__row-title" style="width:150px;font-weight:bold;" >
                            Valid for:
                        </div>
                        <div class="notes__row-text">
                            30 days
                        </div>
                    </div>
                    <div class="notes__row" style="display:-webkit-box;padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;" >
                        <div class="notes__row-title" style="width:150px;font-weight:bold;" >
                            Payment terms:
                        </div>
                        <div class="notes__row-text">
                            30 days after invoice
                        </div>
                    </div>
                    <div class="notes__row" style="display:-webkit-box;padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;" >
                        <div class="notes__row-title" style="width:150px;font-weight:bold;" >
                            Turnaround time:
                        </div>
                        <div class="notes__row-text">
                            ${moment(obj.deadline).format('LLL')}
                        </div>
                    </div>
                </div>
            </div>`;
}

function getTasksInfoPdf(tasks, steps) {
    const tasksInfo = tasks.reduce((acc, cur) => {
        const taskSteps = steps.filter(item => item.taskId === cur.taskId);
        const unitPrice = taskSteps.reduce((sum, c) => {
            return sum += c.clientRate ? c.clientRate.value : 0;
        }, 0);
        const langPair = cur.sourceLanguage ? `${cur.sourceLanguage} >> ${cur.targetLanguage}` : `${cur.targetLanguage} / ${cur.packageSize}`;
        let totalQuantity = cur.metrics ? cur.metrics.totalWords : 0;
        let cost = unitPrice*totalQuantity;
        if(cur.service.calculationUnit !== 'Words') {
            totalQuantity = cur.service.calculationUnit === 'Hours' ? taskSteps[0].quantity : 1;
            cost = cur.finance.Price.receivables;
        }
        acc.push({
            task: cur.service.title,
            langPair: `${langPair}`,
            unitPrice: unitPrice,
            unit: cur.service.calculationUnit,
            quantity: totalQuantity,
            cost
        })
        return [...acc];
    }, [])

    function groupByKey(array, key){
        return array.reduce((result, currentValue) => {
            (result[currentValue[key]] = result[currentValue[key]] || []).push(
                currentValue);
            return result;
        }, {});
    }

    let result = "";
    let languageGroup = groupByKey(tasksInfo, 'langPair');

    for(let language in languageGroup) {
        result += getUniqueLanguage(language);
        let taskGroup = groupByKey(languageGroup[language], 'task');
        for(let task in taskGroup){
            result += getUniqueTask(task);
            for(let info in taskGroup[task]){
                result += getTaskCodePdf(taskGroup[task][info]);
            }
        }
    }
    return result;
}

function getUniqueLanguage(language){
    return `<tr>
                <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                <td class="language" style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;background-color:#DED8C8;background-image:none;background-repeat:repeat;background-position:top left;background-attachment:scroll;font-weight:bold;" >
                ${language}</td>
                <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
            </tr>`;
}

function getUniqueTask(task){
    return `<tr>
                <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                <td class="task" style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;background-color:#F4C040;background-image:none;background-repeat:repeat;background-position:top left;background-attachment:scroll;font-weight:bold;" >
                ${task}</td>
                <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
                <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" ></td>
            </tr>`;
}

function getTaskCodePdf(taskInfo) {
    return `<tr>
                <td class="table__text-right" style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;text-align:right;" >${taskInfo.quantity}</td>
                <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" >${taskInfo.unit}</td>
                <td style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;" >${taskInfo.task}</td>
                <td class="table__text-right" style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;text-align:right;" ><span style="padding-right: 5px;" >&euro;</span>${taskInfo.unitPrice}</td>
                <td class="table__text-right" style="border-right-width:1px;border-right-style:solid;border-right-color:#66563D;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;text-align:right;" ><span style="padding-right: 5px;" >&euro;</span>${taskInfo.cost.toFixed(2)}</td>
            </tr>`
}

function emailMessageForContact(obj) {
    const surname = obj.surname || "";
    const langPairs = obj.tasks.reduce((acc, cur) => {
        const pair = cur.sourceLanguage ? `${cur.sourceLanguage} >> ${cur.targetLanguage}; ` : `${cur.targetLanguage} / ${cur.packageSize}; `;
        return acc + pair;
    }, "")
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.firstName} ${surname},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Here is the information about the project:
                </p>
                <h3 class="detailsTitle">Project Details</h3>
                <table class="details">
                    <tr>
                        <td>Project number:</td>
                        <td>${obj.projectId}</td>
                    </tr>
                    <tr>
                        <td>Project name:</td>
                        <td>${obj.projectName}</td>
                    </tr>
                    <tr>
                        <td>Service:</td>
                        <td>${obj.service}</td>
                    </tr>
                    <tr>
                        <td>Languages:</td>
                        <td>${langPairs}</td>
                    </tr>
                    <tr>
                        <td>Specialization:</td>
                        <td>${obj.industry.name}</td>
                    </tr>
                    <tr>
                        <td>Start date: </td>
                        <td>${obj.startDate}</td>
                    </tr>
                    <tr>
                        <td>Deadline: </td>
                        <td>${obj.deadline}</td>
                    </tr>
                </table>
                <h2 class="contact" style="border-bottom: 1px solid rgb(29, 29, 29);">Contact Pangea Translation Services (Cyprus) LTD</h2>
                <a href="http://pangea.global" target="_blank"><img src="cid:logo@pan" style="width: 50%; margin-left: 145px;"></a>
            </div>
        </div>`;
}

function taskReadyMessage(obj) {
    const am = `${obj.project.accountManager.firstName} ${obj.project.accountManager.lastName}`;
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${am}</p>
                    <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                    <p>
                        Task ${obj.task.taskId} (${obj.task.service.title}) from project ${obj.project.projectId} - ${obj.project.projectName} is ready.
                    </p>
                    <p>
                        It will be delivered once all tasks have been completed.
                    </p>
                    <p>
                        In case of any questions, please do not hesitate to contact us :-)
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function taskDeliveryMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                    <header style="background-color:#66563E;text-align:center;" >
                        <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                    </header>
                    <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                        <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                            This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
                        <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                        <p>
                            I'm pleased to inform you that task <strong>${obj.task.taskId} (${obj.task.service.title})</strong> from project <strong>${obj.projectId} - ${obj.projectName}</strong> has been completed and is ready for review.
                        </p>
                        <p>
                            The files are available for you in our <a href="https://portal.pangea.global/dashboard/details/${obj.id}">Portal</a> and attached to this email in a zip format.
                        </p>
                        <p>
                            In case of any questions, please do not hesitate to contact us :-)
                        </p>
                    </div>
                    <footer>
                        <hr size="15" color="#66563E">
                        <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                    </footer>
                </div>`;
}

function projectCancelledMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
                    <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                    <p>
                        We are sorry to update you , but project <strong>${obj.projectId} - ${obj.projectName}</strong> has been cancelled.
                    </p>
                    <p>
                        Reason: <strong>${obj.reason}</strong>
                    </p>
                    <p>
                        Kindly contact your Account Manager for further information.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function projectMiddleCancelledMessage(obj) {
    const isPayRow = obj.isPay ? `<p>You will need to pay a partial amount of <strong>${obj.finance.Price.receivables} &euro;</strong></p>` : `<p>You will not be charged for this project.</p>`;
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
                    <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                    <p>
                        We would like to inform you that project <strong>${obj.projectId} - ${obj.projectName}</strong> has been cancelled in the middle of the work.
                    </p>
                    <p>
                        Reason: <strong>${obj.reason}</strong>.
                    </p>
                    <p>
                        ${isPayRow}
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;

}

function tasksCancelledMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
                    <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                    <p>
                        The task <strong>${obj.taskId}</strong> from your project <strong>${obj.projectId} - ${obj.projectName}</strong> has been cancelled.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}


function listOfPaymentTasks(taskList, steps) {
    let tableBody="";
    for (let task of taskList) {
        const taskSteps = steps.filter(item => item.taskId === task.taskId);
        const porgress = getTaskProgress(task, taskSteps);
        tableBody += `<tr>
                        <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">${task.taskId}</td>
                        <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">${porgress}%</td>
                        <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">${task.finance.Price.halfReceivables} EUR</td>
                    </tr>`
    }
    return tableBody;
}

function listOfTasks(taskList) {
    let list="";
    for (let task of taskList) {
        list += `<li>${task.taskId}</li>`
    }
    return list;
}

function tasksMiddleCancelledMessage(obj) {
    const paymentTasks = listOfPaymentTasks(obj.tasks, obj.project.steps)
    const listTasks = listOfTasks(obj.tasks);
    const isPayHead = obj.isPay ? `<p>The following tasks have been completed partially and payment will be as following</p>` : `<p>You will not be charged for the following tasks:</p>`
    let isPayRow;
    if (obj.isPay) {
        isPayRow = `<table style="width:100%;color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
            <thead>
                <tr>
                    <th style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">Task ID</th>
                    <th style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">Completion</th>
                    <th style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">Cost</th>
                </tr>
            </thead>
            <tbody>
                ${paymentTasks}
            </tbody>
        </table>`
    } else {
        isPayRow = `<ul>${listTasks}</ul>`
    }
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                    This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
                    <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                    <p>
                        We would like to information that task(s) from project <strong>${obj.project.projectId} - ${obj.project.projectName}</strong> has been cancelled in the middle of the work.
                    </p>
                    <p>
                        Reason: <strong>${obj.reason}</strong>.
                    </p>
                    ${isPayHead}
                    ${isPayRow}
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function projectDeliveryMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
                    <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                    <p>
                        I'm pleased to inform you that project: <strong>${obj.projectId} - ${obj.projectName}</strong>, has been completed and is ready
                        for review.
                    </p>
                    <p>
                        The files are available for you in our
                        <a href="${apiUrl}/dashboard/details/${obj.id}">Portal</a>
                        and attached to this email in a zip format.
                    </p>
                    <p>
                        In case of any questions, please do not hesitate to contact us
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function getTaskProgress(task, steps) {
    if(task.service.calculationUnit === 'Words') {
        return steps.reduce((init, cur) => {
            return init + (cur.progress.wordsDone/cur.progress.totalWordCount)*100/steps.length;
        }, 0).toFixed(2);
    }
    return Math.round(steps.reduce((init, cur) => {
            return init + cur.progress/steps.length;
        }, 0))
}

module.exports = {
  messageForClient,
  emailMessageForContact,
  taskReadyMessage,
  taskDeliveryMessage,
  projectCancelledMessage,
  tasksCancelledMessage,
  tasksMiddleCancelledMessage,
  projectDeliveryMessage,
  projectMiddleCancelledMessage,
  getPdfOfQuote,
  getMessagesForContacts
}
