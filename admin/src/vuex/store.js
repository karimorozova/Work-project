import Vue from 'vue';
import Vuex from 'vuex';
import { generalStore } from "./general/";
import { finance } from "./finance/";
import { vendors } from "./vendors/";
import { clients } from "./clients/";
import { pmarea } from "./pmarea/";


Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        a: generalStore,
        b: finance,
        c: vendors,
        d: clients,
        e: pmarea
    }
});