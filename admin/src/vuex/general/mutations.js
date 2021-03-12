export const mutations = {
    startRequest(state) {
        state.requestCounter++
    },
    endRequest(state) {
       state.requestCounter-- 
    },
    loadingValue(state, payload) {
        state.isLoading = payload;
    },
    alertingMessage(state, payload) {
        state.alertMessage = payload.message;
        state.isAlert = payload.isShow;
        state.alertType = payload.type;
    },
    setLoggedUser(state, payload) {
        state.user = payload;
    },
    servicesFill(state, payload) {
        state.services = payload
    },
    allProjects(state, payload) {
        state.projects = payload;
    },
    allCustomers(state, payload) {
        state.customers = payload
    },
    allVendors(state, payload) {
        state.vendors = payload.sort((a, b) => {
            return a.firstName > b.firstName;
        })
    },
    allVendorsForProject(state, payload) {
        state.vendorsForProject = payload.sort((a, b) => {
            return a.firstName > b.firstName;
        })
    },
    allLangs(state, payload) {
        state.languages = payload.sort((a, b) => {
            return a.lang > b.lang;
        })
    },
    allIndustries(state, payload) {
        state.industries = payload
    },
    allSteps(state, payload) {
        state.steps = payload
    },

    customerlangs(state, payload) {
        state.clientLangs = payload
    },
    duoRatesFill(state, payload) {
        state.duoRates = payload
    },
    storeCurrentProject(state, payload) {
        state.currentProject = payload
    },
    storeProjectProp(state, payload) {
        const {prop, value} = payload;
        state.currentProject = {...state.currentProject, [prop]: value}
    },
    stepDateStore(state, payload) {
        let { steps } = state.currentProject;
        const { index, prop, value } = payload;
        steps[index][prop] = value;
        if(prop === 'deadline' && index + 1 < steps.length && steps[index].taskId === steps[index + 1].taskId) {
            steps[index + 1].start = value;
        }
        state.currentProject = { ...state.currentProject, steps };
    },
    stepVendorDelete(state, payload) {
        state.currentProject.steps[payload.index].vendor = "";
    },
    updateMatrixData(state, payload) {
        const taskIndex = state.currentProject.tasks.findIndex(item => {
            return item.taskId === payload.taskId;
        })
        state.currentProject.tasks[taskIndex][payload.key] = payload.value;
    }
};