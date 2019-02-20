import Vue from 'vue';

Vue.prototype.$localStorage = () => {
    if(process.browser) {
        const token = localStorage.getItem("token");
        return token;
    }
};