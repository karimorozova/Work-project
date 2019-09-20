export const sendNewPassword = async function({ dispatch }, payload) {
    try {
        await this.$axios.post('/vendor/reset-pass', {email: payload});
    } catch(err) {
        dispatch('alertToggle', {message: err.message, isShow: true, type: "error"});
        throw err;
    }    
};