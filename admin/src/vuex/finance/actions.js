export const addFinanceProperty = ({commit, rootState}, payload) => {
    rootState.a.currentProject.finance = {...rootState.a.currentProject.finance, 'Select': payload};
};