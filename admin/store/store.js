import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = () => new Vuex.Store({
    actions: {
        referFiles(context, payload) {
            context.commit('reffilesToDetails', payload)
        },
        jsession(context, payload) {
            context.commit('sesCook', payload)
        },
        files(context, payload) {
            context.commit('detfilesToDetails', payload)
        },
        mutations: {
            reffilesToDetails(state, payload) {
                if(payload) {              
                    state.orderDetails.refFiles = payload.name;
                }
            }
        }
    }
});