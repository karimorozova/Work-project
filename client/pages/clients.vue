<template lang="pug">
  .clients
    h1 Clients Portal
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
            if (sessionCookie) {
                console.log(sessionCookie);
                return true;
            } else {
                console.log('Redirected')
                this.$router.push('/login');
            }
        }
    },
    mounted() {
        this.getCookie()
    }
}
</script>

<style lang="scss">

</style>
