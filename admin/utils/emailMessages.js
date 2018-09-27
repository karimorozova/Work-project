const apiUrl = require("../helpers/apiurl");

function applicationMessage(obj) {
    let cvFiles = "";
    let languagePairs = "";
    let software = "";
    let industries = "";
    let coverLetterFiles = "";
    let education = "";
    let positions = "";
    if(obj.cvFiles) {
        cvFiles = obj.cvFiles.reduce((initial, current, index) => {
            return initial + `<a href=https://admin.pangea.global/${current.split('./dist/')[1]} download target='_self'>cvFile${index+1}</a>; `
        }, "")
    }
    if(obj.coverLetterFiles) {
        coverLetterFiles = obj.coverLetterFiles.reduce((initial, current, index) => {
            return initial + `<a href=https://admin.pangea.global/${current.split('./dist/')[1]} download target='_self'>coverLetterFile${index+1}</a>; `
        }, "")
    }
    if(obj.languagePairs) {
        languagePairs = obj.languagePairs.reduce((initial, current, index) => {
            return initial + current.source + ' >> ' + current.target + "; "
        }, "")
    }
    if(obj.industries) {
        industries = obj.industries.reduce((initial, current, index) => {
            return initial + current + "; "
        }, "")
    }
    if(obj.position) {
        positions = obj.position.reduce((initial, current, index) => {
            return initial + current + "; " 
        }, "")
    }
    if(obj.technicalComp.software) {
        software = obj.technicalComp.software.reduce((initial, current, index) => {
            return initial + current + "; "
        }, "")
    }
    if(obj.education) {
        education = obj.education.reduce((initial, current, index) => {
            return initial + `${current.study}/${current.field}/${current.institute}/${current.grade} <br>`
        }, "")
    }
    return `<div class="main" style="font-weight:400;font-size:12px;border-width:1px;border-style:solid;border-color:#66563E;max-width:700px;display:flex;flex-direction:column;padding-top:10px;padding-bottom:10px;padding-right:10px;padding-left:10px;" >
    <h2 class="head-title" style="font-size:18px;align-self:center;" >New Application Request</h1>
        <div class="personal">
            <ul>
                <li style="margin-bottom:5px;" >Name: ${obj.firstName}</li>
                <li style="margin-bottom:5px;" >Surname: ${obj.surname}</li>
                <li style="margin-bottom:5px;" >Email: ${obj.email}</li>
                <li style="margin-bottom:5px;" >Phone Number: ${obj.phone}</li>
                <li style="margin-bottom:5px;" >Mother tongue: ${obj.native}</li>
                <li style="margin-bottom:5px;" >Time-zone: ${obj.timezone}</li>
                <li style="margin-bottom:5px;" >Language Pairs: ${languagePairs}</li>
                <li style="margin-bottom:5px;" >CV: ${cvFiles}</li>
                <li style="margin-bottom:5px;" >Position: ${positions}</li>
            </ul>
        </div>
        <div class="education">
            <ul>
                <li style="margin-bottom:5px;" >Education:
                    <div>
                        ${education}
                    </div>
                </li>
            </ul>
        </div>
        <div class="transExp">
            <ul>
                <li style="margin-bottom:5px;" >Transaltion Experience: <span>${obj.translationExp}</span></li>
            </ul>
        </div>
        <div class="tech">
            <ul>
                <li style="margin-bottom:5px;" >Internet Access: ${obj.technicalComp.internet}</li>
                <li style="margin-bottom:5px;" >CAT experience: ${obj.technicalComp.cat}</li>
                <li style="margin-bottom:5px;" >Software experience: ${software}</li>
            </ul>
        </div>
        <div class="industries">
            <ul>
                <li style="margin-bottom:5px;" >Industries: ${industries}</li>
            </ul>
        </div>
        <div class="other">
            <ul>
                <li style="margin-bottom:5px;" >Availability: ${obj.availability}</li>
                <li style="margin-bottom:5px;" >Willing to take a test: ${obj.testAgree}</li>
                <li style="margin-bottom:5px;" >Rate: ${obj.rate}</li>
                <li style="margin-bottom:5px;" >Cover Letter: ${obj.coverLetter}</li>
                <li style="margin-bottom:5px;" >Cover Letter (files): ${coverLetterFiles}</li>
            </ul>
        </div>
    </div>`
}

module.exports = applicationMessage;