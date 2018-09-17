import { SET_APPLICATION_DATA } from "../../mutation-types";
export default ( { commit }, payload ) => {
    commit(SET_APPLICATION_DATA, payload)
}