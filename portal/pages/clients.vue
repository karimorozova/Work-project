<template lang="pug">
    .clients Clients portal
</template>

<script>
export default {
    data() {
        return {

        }
    },
    methods: {
        getCookie() {
            let sessionCookie = document.cookie.split('=')[1];
            if(sessionCookie) {
                console.log(sessionCookie);
            }
            else {
                console.log('Redirected to login page');
                this.$router.push('/login')
            } 
        }
    },
    mounted() {
        this.getCookie();
    }
}
</script>

<style lang="scss">

</style>
