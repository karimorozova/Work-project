<template lang="pug">
    .clients 
        h2 Clients portal
        p.company Company Name: 
            span {{ companyName }}
</template>

<script>
export default {
    data() {
        return {
            companyName: '',
        }
    },
    methods: {
        getCookie() {
            let sessionCookie = document.cookie.split('=')[1];
            if(sessionCookie) {
                return true
            }
            else {
                console.log('Redirected to login page');
                this.$router.push('/login')
            } 
        },
        async clientInfo() {
            //const result = await this.$axios.get("/clientsinfo");
            const result = await( this.$axios.request({
                method: "get",
                url: "/clientsinfo",
                withCredentials:true,
            }))
            console.log(result);
            this.companyName = result.data.name; 
        }
    },
    mounted() {
        this.getCookie();
        this.clientInfo();
    }
}
</script>

<style lang="scss">
    .clients {
        background: white;
        .company {
            span {
                font-weight: 600;
                font-size: 18px;
                color: darkslategray;
                font-style: italic;
            }
            
        }
    }
</style>
