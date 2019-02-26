const state = {
  token: "",
  vendor: {},
  accountInfo: {},
  newPassword: {password: "", confirmedPassword: ""},
  languages: [],
  timezones: [],
  applicationFormData: {
    name: "",
    surname: "",
    phone: "",
    email: "",
    motherTongue: "",
    timezone: "",
    languagePairs: [],
    cvFiles: [],
    position: [],
    education: [],
    translationExp: "",
    technicalComp: {
      internet: "",
      cat: "",
      software: []
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
  alertType: "success"
};
export default state
