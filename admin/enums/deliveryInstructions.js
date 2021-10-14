const dr1Instructions = [
  {text: "Check files/work on Memoq to ensure all segments were translated and mark in green", title:"On PMQA step we do the following", isChecked: false, isNotRelevant: false},
  {text: "Run a QA to see if there are any warnings or comments left by the vendors", title:"On PMQA step we do the following", isChecked: false, isNotRelevant: false},
  {text: "If there are any failures in the QA- please contact the vendors to modify the output, and re start the PMQA", title:"On PMQA step we do the following", isChecked: false, isNotRelevant: false},
  {text: "Check that the terms are translated according to the client's instructions, and that any character limitations have been followed", title:"On PMQA step we do the following", isChecked: false, isNotRelevant: false},
  {text: "If QA pass - Complete PMQA", title:"On PMQA step we do the following", isChecked: false, isNotRelevant: false},

  {text: "Open file to see if all is OK", title: "Download deliverables", isChecked: false, isNotRelevant: false},
  {text: "If file is word/excel/powerpoint/HTML (visual files) - send for sanity checkup to either translator or revisor", title: "Download deliverables", isChecked: false, isNotRelevant: false},
  {text: "Check Client's brief/instructions ", title: "Download deliverables", isChecked: false, isNotRelevant: false},
  {text: "Prepare & deliver file to AM", title: "Download deliverables", isChecked: false, isNotRelevant: false},
]
const dr2Instructions = [
  {text: "Check Language combinations (If the languages that were requested are the languages we are delivering)", title:"", isChecked: false, isNotRelevant: false},
  {text: "Check File Type (Are we delivering the file format that was requested/required)", title:"", isChecked: false, isNotRelevant: false},
  {text: "Check Number of files (Are the number of files that were request and the same as the number of files we are delivering)", title:"", isChecked: false, isNotRelevant: false},

  {text: "Client's Brief & Other Instructions", title:"Check if instructions followed", isChecked: false, isNotRelevant: false},
  {text: "Terms", title: "Check if instructions followed", isChecked: false, isNotRelevant: false},
  {text: "Compare source & target files [Beyond Compare stage] (to check for any issues, omits or other mismatches)", title: "Check if instructions followed", isChecked: false, isNotRelevant: false},
]

const drInstructionsCompliance = [
  {text: "Check Template", title: "", isChecked: false, isNotRelevant: false},
  {text: "Check Language combinations", title: "", isChecked: false, isNotRelevant: false},
  {text: "Check Number of files", title: "", isChecked: false, isNotRelevant: false},
  {text: "Check Certificate", title: "", isChecked: false, isNotRelevant: false},
]

module.exports = {
  dr1Instructions,
  dr2Instructions,
  drInstructionsCompliance
}
