const { Vendors } = require('../models');
const { getVendor, getVendorAfterUpdate } = require('./getVendors');
const bcrypt = require('bcryptjs');
const { moveFile } = require('../utils/movingFile');
const fs = require('fs');
const ObjectId = require('mongodb').ObjectID;

const managePaymentMethods = async ({ vendorId, paymentTypeObj, index }) => {
  const Q = { _id: vendorId }
  if (index !== null) return await getVendorAfterUpdate(Q, { $set: { [`billingInfo.paymentMethod.${index}`]: paymentTypeObj} })
  return await getVendorAfterUpdate(Q, { $push: { "billingInfo.paymentMethod": paymentTypeObj } })
}

async function saveVendorDocumentDefault({ vendorId, category }) {
  try {
    const vendor = await Vendors.findOne({ _id: vendorId });
    let { documents } = vendor;
    const newDoc = { fileName: '', path: `${new Date().getTime()}`, category };
    documents.push(newDoc);
    return await getVendorAfterUpdate({ _id: vendorId }, { documents });
  } catch (err) {
    console.log(err);
    console.log("Error in saveVendorDocumentDefault");
  }
}

async function saveVendorDocument({ vendorId, file, category, oldFilePath, oldName, oldCategory }) {
  try {
    if (!file) {
      return await getVendorAfterUpdate(
        { _id: vendorId, "documents.category": oldCategory, "documents.fileName": oldName },
        { "documents.$.category": category }
      );
    }
    const vendor = await Vendors.findOne({ _id: vendorId });
    let { documents } = vendor;
    const namePrefix = category.slice(0, 3).toLowerCase();
    const newPath = `/vendorsDocs/${vendorId}/${namePrefix}-${file.filename}`;
    await moveFile(file, `./dist${newPath}`);
    const newDoc = { fileName: file.filename, path: newPath, category };
    if (oldFilePath) {
      await removeOldVendorFile(oldFilePath, newPath);
      const index = documents.findIndex(item => item.path === oldFilePath && item.category === category);
      documents.splice(index, 1, newDoc);
    } else {
      documents.push(newDoc);
    }
    return await getVendorAfterUpdate({ _id: vendorId }, { documents });
  } catch (err) {
    console.log(err);
    console.log("Error in saveVendorDocument");
  }
}

async function removeVendorDoc({ vendorId, fileName, path, category }) {
  try {
    await removeOldVendorFile(path, "");
    return await getVendorAfterUpdate({ _id: vendorId }, { $pull: { documents: { fileName, path, category } } });
  } catch (err) {
    console.log(err);
    console.log("Error in removeVendorDoc");
  }
}

async function removeVendorEdu({ vendorId, index, path }) {
  try {
    const query = `educations.${index}`;
    await Vendors.updateOne({ _id: vendorId }, { [query]: null });
    if (path) {
      await removeOldVendorFile(path, "");
    }
    return await getVendorAfterUpdate({ _id: vendorId }, { $pull: { "educations": null } });
  } catch (err) {
    console.log(err);
    console.log("Error in removeVendorEdu");
  }
}

async function updateVendorEducation({ vendorId, education, file, index }) {
  try {
    const vendor = await Vendors.findOne({ _id: vendorId });
    let { educations } = vendor;
    let currentEdu = { ...education };
    currentEdu.document = educations[index] ? educations[index].document : "";
    if (file) {
      const newPath = `/vendorsDocs/${vendorId}/doc${index}-${file.filename}`;
      await moveFile(file, `./dist${newPath}`);
      if (currentEdu.document) {
        await removeOldVendorFile(currentEdu.document.path, newPath);
      }
      currentEdu.document = { name: file.filename, path: newPath };
    }
    educations.splice(index, 1, currentEdu);
    return await getVendorAfterUpdate({ _id: vendorId }, { educations });
  } catch (err) {
    console.log(err);
    console.log("Error in saveHashedPassword");
  }
}

async function saveNotPassedTest({ vendorId, qId, file }){
  const vendor = await Vendors.findOne({"_id": vendorId})
  let { notPassedQualifications } = vendor
  const idx = notPassedQualifications.findIndex(item => item.qId === qId)
  let dt = new Date()
  let num =  Number.parseInt((dt.getMilliseconds() * 24 / 7).toString())

  if (file) {
    const newPath = `/vendorsDocs/${ vendorId }/test-${ num }-${ file.filename }`
    await moveFile(file, `./dist${ newPath }`)

    if (idx === -1) {
      notPassedQualifications.push({
        fileName: file.filename,
        path: `/vendorsDocs/${ vendorId }/test-${ num }-${ file.filename }`,
        qId
      })
    } else {
      notPassedQualifications.splice(idx, 1, {
        fileName: file.filename,
        path: `/vendorsDocs/${ vendorId }/test-${ num }-${ file.filename }`,
        qId
      })
    }
  }

  return await getVendorAfterUpdate({ _id: vendorId }, { notPassedQualifications });
}

async function updateVendorAssessment({ vendorId, assessment, file }) {
  try {
    const vendor = await getVendor({ _id: vendorId });
    let { assessments } = vendor;
    const { isNew } = assessment;
    const fileData = await saveAssessmentFile({ assessment, file, vendorId });
    if (isNew) {
      assessments = addNewAssessment(assessments, assessment, fileData);
    } else {
      assessments = updateExistingAssessment(assessment, assessments, fileData);
    }
    return await getVendorAfterUpdate({ _id: vendorId }, { assessments });
  } catch (err) {
    console.log(err);
    console.log("Error in updateVendorAssessment");
  }
}

async function saveAssessmentFile({ assessment, file, vendorId }) {
  try {
    const qaKey = Object.keys(assessment).find(item => assessment[item].grade && !assessment[item].path);
    const path = `/vendorsDocs/${vendorId}/${qaKey}${assessment.targetLanguage || assessment.target.lang}-${file.filename}`;
    await moveFile(file, `./dist${path}`);
    return { qaKey, path, fileName: file.filename };
  } catch (err) {
    console.log(err);
    console.log("Error in saveAssessmentFile");
  }
}

function updateExistingAssessment(assessment, assessments, fileData) {
  const { industry, step, source, target, ...assessmentData } = assessment;
  const { mainIndex, industryIndex, stepIndex } = assessment;
  const neededAssessment = assessments[mainIndex];
  const { qaKey, fileName, path } = fileData;
  neededAssessment.industries[industryIndex].steps[stepIndex][qaKey] = { ...assessmentData[qaKey], fileName, path };
  assessments[mainIndex] = neededAssessment;
  return assessments;
}

function addNewAssessment(assessments, assessment, fileData) {
  let { step, source, target, industry: industryArr, ...assessmentData } = assessment;
  const { qaKey, fileName, path } = fileData;
  assessmentData[qaKey] = { ...assessmentData[qaKey], fileName, path };
  const sameLangPairIndex = assessments.findIndex(({ sourceLanguage, targetLanguage }) => (
    `${sourceLanguage._id} ${targetLanguage._id}` === `${source._id} ${target._id}`
  ));

  if (sameLangPairIndex !== -1) {
      const industries = assessments[sameLangPairIndex].industries;
      assessments[sameLangPairIndex].industries = getUpdatedIndustries(industries, industryArr, step, assessmentData);
  } else {
      const steps = [];
      const industries = [];
      for (let { _id } of step) steps.push({ step: ObjectId(_id), ...assessmentData });
      for(let industry of industryArr) industries.push({ industry: ObjectId(industry._id), steps, })
      assessments.push({ sourceLanguage: ObjectId(source._id), targetLanguage: ObjectId(target._id), industries, });
  }

  return assessments;
}

const getUpdatedIndustries = (assessmentIndustries, newIndustries, newSteps, newAssessmentData) => {
  const steps = [];
  for (let { _id } of newSteps) steps.push({ step: ObjectId(_id), ...newAssessmentData });

  for(let newIndustry of newIndustries) {
    const sameIndustryIndex = assessmentIndustries.findIndex(({ industry }) => industry._id.toString() === newIndustry._id);
    if (sameIndustryIndex !== -1) {
      for (let step of newSteps) assessmentIndustries[sameIndustryIndex].steps.push(...steps);
    } else {
      assessmentIndustries.push({ industry: ObjectId(newIndustry._id), steps});
    }
  }

  return assessmentIndustries;
};

async function saveHashedPassword(id, pass) {
  try {
    await bcrypt.hash(pass, 10, async (err, hash) => {
      if(err) {
        throw new Error("bcrypt error");
      }
      await Vendors.updateOne({ "_id": id }, { password: hash});
    });
  } catch (err) {
    console.log(err);
    console.log("Error in saveHashedPassword");
  }
}

async function getPhotoLink(id, file) {
  try {
    const newPath = await moveFile(file[0], `./dist/vendorsDocs/${id}/${file[0].filename}`);
    return newPath.split('./dist')[1];
  } catch (err) {
    console.log(err);
    console.log("Error in getPhotoLink");
  }
}

function removeOldVendorFile(oldPath, newPath) {
  if (oldPath === newPath || !oldPath) return;
  return new Promise((resolve, reject) => {
    fs.unlink(`./dist${oldPath}`, (err) => {
      if (err) {
        console.log(err);
        console.log("Error in removeOldVendorFile");
        reject(err);
      }
    });
    resolve("removed");
  });
}

module.exports = {
  saveVendorDocument,
  saveVendorDocumentDefault,
  removeVendorDoc,
  saveHashedPassword,
  getPhotoLink,
  removeOldVendorFile,
  updateVendorEducation,
  removeVendorEdu,
  updateVendorAssessment,
  saveNotPassedTest,
  managePaymentMethods
};
