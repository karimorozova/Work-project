const state = {
  token: "",
  vendor: {},
  accountInfo: {},
  newPassword: {password: "", confirmedPassword: ""},
  jobs: [],
  selectedJob: {},
  languages: [],
  timezones: [],
  steps: [],
  packages: [],
  applicationFormData: {
    firstName: "",
    surname: "",
    phone: "",
    email: "",
    motherTongue: "",
    timezone: "",
    languagePairs: [],
    cvFiles: [],
    positions: [],
    educations: [],
    experienceYears: "",
    technicalComp: {
      internet: "",
      cat: "",
      softwares: []
    },
    industries: [],
    availability: "",
    testAgree: "",
    rate: "",
    coverLetter: "",
    coverLetterFiles: [],
    confirmed: ""
  },
  currentRequests: 0,
  alertMessage: "",
  isAlert: false,
  alertType: "success",
  originallyUnits: [],
  previousLink : ''
};
export default state
