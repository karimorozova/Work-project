const defaultSteps = [
	{ title: "Translation", isActive: true },
	{ title: "Revising", isActive: true },
	{ title: "Editing", isActive: true },
	{ title: "QA", isActive: true },
	{ title: "Copywriting", isActive: true },
	{ title: "Proofreading", isActive: true },
	{ title: "Graphic Design", isActive: true }
]

const defaultUnits = [
	{ type: 'CAT Wordcount', active: true, editable: false },
	{ type: 'Packages', active: true, editable: false },
	{ type: 'Hours', active: true, editable: false }
]

module.exports = { defaultSteps, defaultUnits }
