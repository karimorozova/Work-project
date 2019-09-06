export const DETAILS = (state, payload) => {
    state.orderDetails = payload
};

export const DETFILES_TO_DETAILS = (state, payload) => {
    if (payload.length) {
        state.orderDetails.detailFiles = [];
        for (let i = 0; i < payload.length; i++) {
            state.orderDetails.detailFiles.push(payload[i].name);
        }
    }
};

export const REFFILES_TO_DETAILS = (state, payload) => {
    if (payload) {
        state.orderDetails.refFiles = payload.name;
    }
};

export const ORDER_TYPE = (state, payload) => {
    state.orderDetails.requestType = payload;
};

export const LANGS = (state, payload) => {
    state.clientLanguages = payload
};

export const CLIENT_FOR_REQUEST = (state, payload) => {
    state.clientInfo = payload
};
export const SERVICES_FILL = (state, payload) => {
    state.services = payload
};

export const SET_USER = (state, payload) => {
    state.user = payload;
}

export const SET_CLIENT = (state, payload) => {
    state.clientInfo = payload;
}

export const SET_PROJECTS = (state, payload) => {
    let projects = [];
    if(payload.length) {
        projects = payload.sort((a, b) => {
            if (a.createdAt > b.createdAt) return -1
            if (a.createdAt < b.createdAt) return 1;
        });
    }
    state.projects = projects;
};

export const SET_REQUESTS = (state, payload) => {
    let requests = [];
    if(payload.length) {
        requests = payload.sort((a, b) => {
            if (a.createdAt > b.createdAt) return -1
            if (a.createdAt < b.createdAt) return 1;
        });
    }
    state.requests = requests;
};

export const SET_MONO_COMBINATIONS = (state, payload) => {
    const pairs = !payload.length ? [] : payload.filter((item, index, self) => {
        return self.map(elem => elem.target.lang + elem.packageSize).indexOf(item.target.lang + item.packageSize) === index;
    });
    state.clientLanguages.monoRates = pairs;
}

export const SET_DUO_COMBINATIONS = (state, payload) => {
    const { prop, combs } = payload;
    const uniquePairs = !combs.length ? [] : combs.filter((item, index, self) => {
        return self.map(elem => elem.source.lang + elem.target.lang).indexOf(item.source.lang + item.target.lang) === index;
    });
    state.clientLanguages[prop] = uniquePairs;
}
