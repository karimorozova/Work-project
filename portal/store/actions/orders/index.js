import { appendData } from "../../../utils/order";

export const getXtmCustomers = async function ({ commit, dispatch }) {
    try {
        const result = await this.$axios.get('/xtm/xtm-customers');
        commit('SET_XTM_CUSTOMERS', result.data);
    } catch(err) {
        dispatch('alertToggle', {message: err.message, isShow: true, type: "error"})
    }
}

export const setClientsXtmId = async function ({commit, dispatch, state}, payload) {
    let xtmCustomer = state.xtmCustomers.find(item => item.name === state.clientInfo.name);
    try {
        if(!xtmCustomer) {
            await dispatch('createNewXtmCustomer');
            xtmCustomer = state.xtmCustomers.find(item => item.name === state.clientInfo.name);
        }
        commit('SET_CLIENTS_XTM', xtmCustomer.id);
    } catch(err) {
        dispatch('alertToggle', {message: err.message, isShow: true, type: "error"});
    }
}

export const setOrderDetails = ({commit}, payload) => {
    commit('SET_ORDER_DETAILS', payload);
}

export const setOrderDetail = ({commit}, payload) => {
    commit('SET_DETAIL', payload);
}

export const setOrderNestedDetail = ({commit}, payload) => {
    commit('SET_NESTED_DETAIL', payload);
}

export const setDefaultSource = async function ({commit}, payload) {
    try {
        const english = await this.$axios.get(`/portal/default-source?ratesProp=${payload.ratesProp}`);
        const source = english.data.source || {lang: 'Select'};
        commit('SET_DETAIL', {prop: 'source', value: source});
    } catch(err) {
        dispatch('alertToggle', {message: err.message, isShow: true, type: "error"});
    }
}

export const removeFile = ({commit}, payload) => {
    commit('REMOVE_FILE', payload);
}

export const submitForm = async function ({commit, dispatch, state}, payload) {
    let orderDetails = {...state.orderDetails,
        source: JSON.stringify(state.orderDetails.source) || "",
        packageSize: JSON.stringify(state.orderDetails.packageSize) || "",
        targets: JSON.stringify(state.orderDetails.targets),
        genbrief: JSON.stringify(state.orderDetails.genbrief) || "",
        tones: JSON.stringify(state.orderDetails.tones) || "",
        designs: JSON.stringify(state.orderDetails.designs) || "",
        createdAt: new Date(),
        customer: state.clientInfo._id,
        projectManager: state.clientInfo.projectManager._id,
        status: 'Requested',
        service: payload.service._id
    }
    try {
        const details = appendData(orderDetails);
        const newProject = await this.$axios.post('/portal/request', details);
        const projects = [...state.projects, newProject.data];
        commit('SET_PROJECTS', projects);
        dispatch('setOrderDetails', {});
    } catch(err) {
        dispatch('alertToggle', {message: err.message, isShow: true, type: "error"});
    }
}

export const createNewXtmCustomer = async function ({commit, state}, payload) {
    try {
        const result = await this.$axios.get(`/xtm/newcustomer?name=${state.clientInfo.name}`);
        commit('ADD_XTM_CUSTOMER', result.data);
    } catch(err) {
        dispatch('alertToggle', {message: err.message, isShow: true, type: "error"});
    }
}