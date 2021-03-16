export const setApplicationData = (state, payload) => {
    state.applicationFormData = payload;
}

export const SET_VENDOR = (state, payload) => {
    state.vendor = payload;
}

export const SET_NEW_PASSWORD = (state, payload) => {
    state.newPassword.password = payload;
}

export const SET_CONFIRMED_PASSWORD = (state, payload) => {
    state.newPassword.confirmedPassword = payload;
}

export const SET_ACCOUNT_INFO = (state) => {
    let info = {};
    for(let key in state.vendor) {
        if(key !== "_id" && key!== "__v") {
            info[key] = state.vendor[key];
        }
    }
    state.accountInfo = info;
}

export const SET_ACCOUNT_PROP = (state, payload) => {
    const { prop, value } = payload;
    state.accountInfo[prop] = value;
}

export const SET_VENDOR_PROP = (state, payload) => {
  const { prop, value } = payload;
  state.vendor[prop] = value;
}

export const SET_JOBS = (state, payload) => {
    state.jobs = payload;
}

export const SELECT_JOB = (state, payload) => {
    state.selectedJob = payload;
}
