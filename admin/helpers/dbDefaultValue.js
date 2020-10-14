const {
  defaultLanguages,
  defaultUsers,
  defaultSteps,
  defaultUnits,
  defaultClients,
  defaultVendors,
  defaultTimezones,
  defaultIndustries,
  defaultServices,
  defaultGroups
} = require('./defaults/index');

const requestsDefault = [];

const leadSourcesDefault = ["Advertising", "Friend", "Landing Pages", "Internet", "Social Media", "Website"]

const projectsDefault = [];

const emptyMatrix = {
    xTranslated: {text: "X translated", value: 0},
    repeat: {text: "Repetition", value: 0},
    contextMatch: {text: "Context match", value: 0},
    repeat100: {text: "100%", value: 0},
    repeat50: {text: "50-74%", value: 0},
    repeat75: {text: "75-84%", value: 0},
    repeat85: {text: "85-94%", value: 0},
    repeat95: {text: "95-99%", value: 0},
    noMatch: {text: "No match", value: 1}
}

const instructionsDefault = [
    {type: "Test", content: "Test content", isSpecific: false},
    {type: "Test specified", content: "Test content specified", isSpecific: true},
]

const cancelReasonsDefault = [
    {reason: "Reason 1"}, {reason: "Reason 2"}, {reason: "Reason 3"}
]

const tierLqasDefault = [
    {category: "1", lqa1: "10000", lqa2: "50000", lqa3: "100000"},
    {category: "2", lqa1: "5000", lqa2: "25000", lqa3: "50000"},
    {category: "3", lqa1: "1000", lqa2: "5000", lqa3: "10000"}
]

const defaultValue = {
    defaultLanguages,
    requestsDefault,
    projectsDefault,
    defaultUsers,
    defaultServices,
    defaultIndustries,
    defaultTimezones,
    defaultClients,
    leadSourcesDefault,
    defaultGroups,
    defaultSteps,
    emptyMatrix,
    instructionsDefault,
    cancelReasonsDefault,
    tierLqasDefault,
    defaultUnits,
    defaultVendors
};

module.exports = defaultValue;
