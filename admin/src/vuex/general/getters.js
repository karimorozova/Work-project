export const getRequestCounter = state => state.requestCounter;
export const isLoggedIn = state => state.isLoggedIn;
export const getUserGroup = state => state.userGroup;
export const loading = state => state.isLoading;
export const isAlert = state => state.isAlert;
export const alertType = state => state.alertType;
export const alertMessage = state => state.alertMessage;

// ===>
export const getUsers = state => state.users;
export const getUser = state => state.user;
export const getAllLanguages = state => state.languages;
export const getAllIndustries= state => state.industries;
export const getAllSteps = state => state.steps;
export const getAllUnits = state => state.units
export const getAllServices = state => state.services

// export const getAllVendorsForProject = state => state.vendorsForProject
// export const getAllVendorsForOptions = state => state.vendorsForOptions
// export const getAllClientsForOptions = state => state.clientsForOptions
// ===>

export const getClients = state => state.customers;
export const getVendors = state => state.vendors;
export const getCurrentProject = state => state.currentProject;
export const getTiersInfo = state => state.tiersInfo;
