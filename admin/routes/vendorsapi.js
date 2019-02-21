const router = require('express').Router();
const { upload, stepEmailToVendor } = require('../utils');
const mv = require('mv');
const fse = require('fs-extra');
const { updateProject, getProject } = require('../projects');
const { getVendor, getVendors, getVendorAfterUpdate, getVendorRates, updateVendorRates, deleteRate, addSeveralCombinations } = require('./vendors');
const { Vendors, Projects } = require('../models');

function moveFile(oldFile, vendorId) {

let newFile = './dist/vendorsDocs/' + vendorId + '/' + oldFile.filename;

mv(oldFile.path, newFile, {
        mkdirp: true
    }, function (err) {
});

return oldFile.filename;
}

router.get('/vendor', async (req, res) => {
    const id = req.query.id;
    try {
        const vendor = await getVendor({"_id": id});
        res.send(vendor)
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting Vendors");
    }
})

router.post('/step-email', async (req, res) => {
    const { projectId, step } = req.body;
    try {
        const project = await getProject({"_id": projectId});
        const stepsAfterMailSent = await stepEmailToVendor(project, step);
        await updateProject({"_id": projectId}, {steps: stepsAfterMailSent});
        res.send('Email has been sent')
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on sending email to Vendor");
    }
})

router.get('/rates', async (req, res) => {
    const { vendorId, form } = req.query;
    try {
        let vendor = await getVendor({"_id": vendorId});
        const rates = await getVendorRates({vendor, form});
        res.send(rates);
    } catch(err) {
        console.log(err);
        res.status(500).send('Error on getting Vendor rates');
    }
})

router.post('/rates', async (req, res) => {
    const { ratesInfo } = req.body;
    try {
        const updatedVendor = await updateVendorRates(ratesInfo);
        res.send(updatedVendor);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating rates of Vendor");
    }
})

router.delete('/rate/:id', async (req,res) => {
    let  deleteInfo = {...req.body};
    const { id } = req.params;
    if(id === "undefined") {
        return res.send("Deleted");
    }
    try {
        const updatedVendor = await deleteRate(deleteInfo, id);
        res.send(updatedVendor);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting rates of Vendor");
    }
})

router.post('/several-langs', async (req, res) => {
    const { priceId, combinations, vendorId } = req.body;
    try {
        const updatedVendor = await addSeveralCombinations({priceId, vendorId, combinations});
        res.send(updatedVendor);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on adding several languages for Vendor");
    }
})

router.post('/new-vendor', upload.fields([{ name: 'photo' }]), async (req, res) => {
    let vendor = JSON.parse(req.body.vendor);
    const photoFile = req.files["photo"];
    try {
        const saveVendor = await Vendors.create(vendor);
        const id = saveVendor.id;
        if(photoFile) {
            await moveFile(photoFile[0], id)
            vendor.photo = `/vendorsDocs/${id}/${photoFile[0].filename}`;
        }
        const updatedVendor = await getVendorAfterUpdate({"_id": id}, {photo: vendor.photo});
        res.send(updatedVendor);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on creating Vendor");
    }
})

router.post('/update-vendor', upload.fields([{ name: 'photo' }]), async (req, res) => {
    let vendor = JSON.parse(req.body.vendor);
    const photoFile = req.files["photo"];
    try {
        if(photoFile) {
            await moveFile(photoFile[0], vendor._id);
            vendor.photo = `/vendorsDocs/${vendor._id}/${photoFile[0].filename}`;
        }
        const updatedVendor = await getVendorAfterUpdate({"_id": vendor._id}, vendor);
        res.send(updatedVendor);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on updating Vendor");
    }
})

router.delete('/deletevendor/:id', async (req, res) => {
    const { id } = req.params;
    try { 
        await Vendors.deleteOne({"_id": id});
        await fse.remove('./dist/vendorsDocs/' + id);
        res.send("Vendor deleted");
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on deleting Vendor");
    }
})

// router.get('/step-decision', async (req, res) => {
//     const { decision, vendorId, projectId, taskId, stepName, to } = req.query;
//     const date = Date.now();
//     try {
//         if((date - +to) > 900000) {
//             res.set('Content-Type', 'text/html')
//             res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry! The link is already expired.</p></body>`)
//         } else {
//             const project = await Projects.findOne({"_id": projectId});
//             const steps = [...project.steps];
//             let parent = steps.findIndex(item => item.name === stepName && +item.taskId === +taskId);
//             if(steps[parent].vendorsClickedOffer.indexOf(vendorId) !== -1) {
//                 res.set('Content-Type', 'text/html');
//                 return res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. You've already made your decision.</p></body>`)
//             }
//             steps[main].status = (decision === "accept") ? "Accepted" : "Rejected";
//             steps[parent].vendorsClickedOffer.push(vendorId);
//             await Projects.updateOne({"_id": projectId}, {steps: steps});
//             res.set('Content-Type', 'text/html')
//             res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Thank you.</p></body>`)
//         }
//     } catch(err) {
//         console.log(err);
//         res.set('Content-Type', 'text/html')
//         res.send(`<body onload="javascript:setTimeout('self.close()',5000);"><p>Sorry. Acception failed! Try again later.</p></body>`)
//     }
// })

router.post('/update-matrix', async (req, res) => {
    const { _id, matrix } = req.body;
    try {
        const updatedVendor = await getVendorAfterUpdate({"_id": _id}, {matrix: matrix});
        res.send(updatedVendor);
    } catch(err) {
        res.status(500).send("Error on updating Vendor's matrix");
    }
})

module.exports = router;
