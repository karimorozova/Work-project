const defaultSteps = [
  {title: "Translation", symbol: "translation", isStage1: true, isStage2: false, isEditor: true, isActive: true},
  {title: "Revising", symbol: "revising", isStage1: false, isStage2: true, isEditor: true, isActive: true},
  {title: "Editing", symbol: "editing", isStage1: true, isStage2: false, isEditor: true, isActive: true},
  {title: "QA", symbol: "qa", isStage1: true, isStage2: true, isEditor: true, isActive: true},
  {title: "Copywriting", symbol: "copywriting", isStage1: true, isStage2: false, isEditor: true, isActive: true},
  {title: "Proofreading", symbol: "proofreading", isStage1: true, isStage2: true, isEditor: true, isActive: true},
  {title: "Graphic Design", symbol: "graphic_design", isStage1: true, isStage2: true, isEditor: false, isActive: true},
];

const defaultUnits = [
  {
    type: 'CAT Wordcount', active: true, editable: false,
  },
  {
    type: 'Packages', active: true, editable: false,
  },
  {
    type: 'Hours', active: true, editable: false,
  },
];

module.exports = { defaultSteps, defaultUnits }
