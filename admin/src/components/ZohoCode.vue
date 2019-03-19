<template lang="pug">
    .zoho-code 
        p.zoho-code__message Extracting code for generating token for ZOHO Api. Please wait...
</template>

<script>
export default {
    data() {
        return {
            code: ""
        }
    },
    methods: {
        async generateTokens() {
            try {
                const result = await this.$http.get(`/zoho/getTokens?code=${this.code}`);
                this.$router.go(-1);
            } catch(err) {
                this.alertToggle({message: err.data, isShow: true, type: "error"})
            }
        },
    },
    mounted() {
        this.code = this.$route.query.code;
        this.generateTokens();
    }
}
</script>

<style lang="scss" scoped>

.zoho-code {
    padding: 40px;
    &__message {
        font-size: 20px;
    }
}

</style>
