const router = require('express').Router();
const { upload, stepEmailToVendor } = require('../utils');
const mv = require('mv');
const fse = require('fs-extra');
const { updateProject, getProject } = require('../projects');
const { getVendor, getVendorAfterUpdate, getFilteredVendors, updateVendorRates, importRates, getVendorAfterCombinationsUpdated } = require('../vendors');
const { Vendors } = require('../models');


function moveFile(oldFile, vendorId) {
    let newFile = './dist/vendorsDocs/' + vendorId + '/' + oldFile.filename;
    mv(oldFile.path, newFile, {
        mkdirp: true
    }, function (err) {
    });
    return oldFile.filename;
}

router.post('/upload-vendor-document', upload.fields([{ name: 'documentFile' }]), async (req, res) => {
    let data = await JSON.parse(req.body.document);
    const file = req.files["documentFile"];
    try {
        if (file) {
            await moveFile(file[0], data.vendorId);
            data.fileLink = `/vendorsDocs/${data.vendorId}/${file[0].filename}`;
            data.fileName = file[0].filename;
        }
        res.send(data);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on updating");
    }
})

router.post('/upload-vendor-education', upload.fields([{ name: 'educationFile' }]), async (req, res) => {
    let data = await JSON.parse(req.body.education);
    const file = req.files["educationFile"];
    try {
        if (file) {
            await moveFile(file[0], data.vendorId);
            data.fileLink = `/vendorsDocs/${data.vendorId}/${file[0].filename}`;
            data.document = file[0].filename;
        }
        res.send(data);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on updating");
    }
})

router.post('/filtered-vendors', async (req, res) => {
    const { filters } = req.body;
    try {
        const filteredVendors = await getFilteredVendors(filters);
        res.send(filteredVendors);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on getting filtered Vendors");
    }
})

router.get('/vendor', async (req, res) => {
    const id = req.query.id;
    try {
        const vendor = await getVendor({ "_id": id });
        res.send(vendor)
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on getting Vendor");
    }
})

router.post('/step-email', async (req, res) => {
    const { projectId, step } = req.body;
    try {
        const project = await getProject({ "_id": projectId });
        const stepsAfterMailSent = await stepEmailToVendor(project, step);
        await updateProject({ "_id": projectId }, { steps: stepsAfterMailSent });
        res.send('Email has been sent')
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on sending email to Vendor");
    }
})

router.post('/rates', async (req, res) => {
    const { vendorId, ...rateInfo } = req.body;
    try {
        const vendor = await getVendor({ "_id": vendorId });
        const updatedVendor = await updateVendorRates(vendor, rateInfo);
        res.send(updatedVendor);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on updating rates of Vendor");
    }
})

router.post('/remove-rate', async (req, res) => {
    const { vendorId, rateId, prop } = req.body;
    try {
        const updatedVendor = await getVendorAfterUpdate({ "_id": vendorId }, {
            $pull: { [prop]: { '_id': rateId } }
        })
        res.send(updatedVendor);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on deleting rate of Vendor");
    }
})

router.post('/remove-rates', async (req, res) => {
    const { vendorId, checkedIds, prop } = req.body;
    try {
        const updatedVendor = await getVendorAfterUpdate({ "_id": vendorId }, {
            $pull: { [prop]: { '_id': { $in: checkedIds } } }
        })
        res.send(updatedVendor);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on deleting rate of Vendor");
    }
})

router.post('/combination', async (req, res) => {
    const { step, rate } = req.body;
    try {
        const project = await getProject({ "steps._id": step._id });
        const updatedVendor = await getVendorAfterCombinationsUpdated({ project, step, rate });
        res.send(updatedVendor);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on adding combination for Vendor");
    }
})

router.post('/import-rates', async (req, res) => {
    const { vendorId, ratesData, prop } = req.body;
    try {
        const updatedVendor = await importRates({ vendorId, ratesData, prop });
        res.send(updatedVendor);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on importing rates to Vendor");
    }
})

router.post('/new-vendor', upload.fields([{ name: 'photo' }]), async (req, res) => {
    let vendor = JSON.parse(req.body.vendor);
    const photoFile = req.files["photo"];
    try {
        const saveVendor = await Vendors.create(vendor);
        const id = saveVendor.id;
        if (photoFile) {
            await moveFile(photoFile[0], id)
            vendor.photo = `/vendorsDocs/${id}/${photoFile[0].filename}`;
        }
        const updatedVendor = await getVendorAfterUpdate({ "_id": id }, { photo: vendor.photo });
        res.send(updatedVendor);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on creating Vendor");
    }
})

router.post('/update-vendor', upload.fields([{ name: 'photo' }]), async (req, res) => {
    let vendor = JSON.parse(req.body.vendor);
    const photoFile = req.files["photo"];
    try {
        if (photoFile) {
            await moveFile(photoFile[0], vendor._id);
            vendor.photo = `/vendorsDocs/${vendor._id}/${photoFile[0].filename}`;
        }
        const updatedVendor = await getVendorAfterUpdate({ "_id": vendor._id }, vendor);
        res.send(updatedVendor);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on updating Vendor");
    }
})

router.delete('/deletevendor/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Vendors.deleteOne({ "_id": id });
        await fse.remove('./dist/vendorsDocs/' + id);
        res.send("Vendor deleted");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error on deleting Vendor");
    }
})

router.post('/update-matrix', async (req, res) => {
    const { _id, matrix } = req.body;
    try {
        const updatedVendor = await getVendorAfterUpdate({ "_id": _id }, { matrix: matrix });
        res.send(updatedVendor);
    } catch (err) {
        res.status(500).send("Error on updating Vendor's matrix");
    }
})

router.get('/any-step', async (req, res) => {
    const { id } = req.query;
    try {
        const project = await getProject({ "steps.vendor": id });
        res.send(project);
    } catch (err) {
        res.status(500).send("Error on gettinf any step with current Vendor");
    }
})

module.exports = router;
