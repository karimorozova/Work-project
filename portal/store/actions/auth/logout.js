import Vue from "vue";

export const logout =  ({ commit }) => {
    commit("SET_TOKEN", "");
    commit("SET_PREVIOUS_LINK", "");
    // Vue.cookie.delete("client");

    //force deletion cookie
    let cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i]
        let eqPos = cookie.indexOf("=")
        let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
};
