export const REPLACE_QUOTE = (state, payload) => {
    const { id, updatedQuote } = payload;
    let projects = [...state.projects];
    const index = projects.findIndex(item => item._id === id);
    projects[index] = updatedQuote;
    state.projects = [...projects]
}

export const SET_PROJECT = (state, payload) => {
    state.selectedProject = payload;
}