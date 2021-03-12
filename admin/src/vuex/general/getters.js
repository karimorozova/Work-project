export const getRequestCounter = state => state.requestCounter;
export const isLoggedIn = state => state.isLoggedIn;
export const getUser = state => state.user;
export const getUserGroup = state => state.userGroup;
export const loading = state => state.isLoading;
export const isAlert = state => state.isAlert;
export const alertType = state => state.alertType;
export const alertMessage = state => state.alertMessage;

export const getVuexServices = state => state.services;
export const getAllLanguages = state => state.languages;
export const getAllIndustries= state => state.industries;
export const getAllSteps = state => state.steps;
export const getAllVendorsForProject = state => state.vendorsForProject

export const getClients = state => state.customers;
export const getVendors = state => state.vendors;
export const getRatesDuo = state => state.duoRates;
export const getAllProjects = state => state.projects;
export const getCurrentProject = state => state.currentProject;
export const getTiersInfo = state => state.tiersInfo;
