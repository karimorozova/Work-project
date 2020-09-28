const router = require('express').Router();
const { checkVendor } = require('../../middleware');
const jwt = require("jsonwebtoken");
const { secretKey } = require('../../configs');
const { Vendors } = require('../../models');
const { getVendor, getVendorAfterUpdate, saveHashedPassword, getPhotoLink, removeOldVendorFile, getJobs, updateStepProp } = require('../../vendors');
const { upload, sendEmail } = require('../../utils');
const { setVendorNewPassword } = require('../../users');
const { createVendorOnMemoq } = require('../../vendors/memoq');
const { sendMemoqCredentials } = require('../../emailMessages/vendorCommunication');
const { assignMemoqTranslator } = require('../../projects');

router.post("/login", async (req, res, next) => {
  if (req.body.logemail) {
    Vendors.authenticate(req.body.logemail, req.body.logpassword, async (error, vendor) => {
      if (error || !vendor) {
        let err = new Error('Wrong email or password.');
        err.status = 401;
        res.status(401).send("Wrong email or password.");
      } else {
        try {
					const token = await jwt.sign({ vendorId: vendor._id }, secretKey, { expiresIn: '2h' });
					res.statusCode = 200;
					res.send(token);
				} catch (err) {
					console.log(err);
					res.status(500).send("Server Error. Try again later.");
				}
			}
		});
	} else {
		let err = new Error('All fields required.');
		err.status = 400;
		res.status(400).send("All fields required.");
	}
})

router.post("/reset-pass", async (req, res) => {
	const { email } = req.body;
	try {
		const vendor = await Vendors.findOne({ "email": email });
		if(!vendor) {
			return res.status(400).send("No such user");
		}
		await setVendorNewPassword(vendor, email);
		res.send("new password sent");
	} catch (err) {
		console.log(err);
		res.status(500).send("Server error. Try again later.");
	}
})

router.get("/info", checkVendor, async (req, res) => {
	const { token } = req.query;
	try {
		const verificationResult = jwt.verify(token, secretKey);
		const vendor = await getVendor({ "_id": verificationResult.vendorId });
		res.send(vendor);
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on getting Vendor info. Try later.");
	}
})

router.post("/info", checkVendor, upload.fields([{ name: 'photo' }]), async (req, res) => {
	let info = JSON.parse(req.body.info)
	let { id, password } = req.body;
	const photoFile = req.files["photo"];
	try {
		if(password) {
			await saveHashedPassword(id, password);
		}
		if(photoFile) {
			let oldPath = info.photo;
			info.photo = await getPhotoLink(id, photoFile);
			await removeOldVendorFile(oldPath, info.photo);
		}
		vendor = await getVendorAfterUpdate({ "_id": id }, { ...info })
		res.send(vendor);
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on saving data. Try later.");
	}
})

router.get("/jobs", checkVendor, async (req, res) => {
	const { token } = req.query;
	try {
		const verificationResult = jwt.verify(token, secretKey);
		const jobs = await getJobs(verificationResult.vendorId);
		res.send(jobs);
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on getting jobs.");
	}
})

router.post("/job", checkVendor, async (req, res) => {
	const { jobId, status } = req.body;
	try {
		await updateStepProp({ jobId, prop: 'status', value: status });
		res.send("Status updated");
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on changing job status");
	}
})

router.post("/selected-job", checkVendor, async (req, res) => {
	const { jobId, value } = req.body;
	try {
		await updateStepProp({ jobId, prop: 'isVendorRead', value });
		res.send("Terms agreement status changed");
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on checking job's terms agreement");
	}
})

router.post("/create-memoq-vendor", checkVendor, async (req, res) => {
  const { token } = req.body;
  const { vendorId } = jwt.verify(token, secretKey);
  const vendor = await Vendors.findOne({ _id: vendorId });
  const guid = await createVendorOnMemoq(vendor);
  if (guid) {
    const message = sendMemoqCredentials(vendor);
    const subject = `MemoQ account`;
    await sendEmail({ to: vendor.email, subject }, message);
    await Vendors.updateOne({ _id: vendorId }, { guid });
    res.status(200).send('Saved');
  } else {
    res.status(500).send('Error on creating vendor in memoQ');
  }
});

router.post("/assign-translator", checkVendor, async (req, res) => {
  const { token, stepId, projectId } = req.body;
  try {
    const { vendorId } = jwt.verify(token, secretKey);
    await assignMemoqTranslator(vendorId, stepId, projectId);
    res.send('Assigned');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on assigning vendor as translator');
  }
});

module.exports = router;
