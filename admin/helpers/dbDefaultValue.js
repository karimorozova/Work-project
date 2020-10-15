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
} = require("./defaults/index");

const leadSourcesDefault = [
  "Advertising",
  "Friend",
  "Landing Pages",
  "Internet",
  "Social Media",
  "Website"
];

const instructionsDefault = [
  { type: "Test", content: "Test content", isSpecific: false },
  {
    type: "Test specified",
    content: "Test content specified",
    isSpecific: true
  }
];

const cancelReasonsDefault = [
  { reason: "Reason 1" },
  { reason: "Reason 2" },
  { reason: "Reason 3" }
];

const defaultValue = {
  defaultLanguages,
  defaultUsers,
  defaultServices,
  defaultIndustries,
  defaultTimezones,
  defaultClients,
  leadSourcesDefault,
  defaultGroups,
  defaultSteps,
  instructionsDefault,
  cancelReasonsDefault,
  defaultUnits,
  defaultVendors
};

module.exports = defaultValue;
