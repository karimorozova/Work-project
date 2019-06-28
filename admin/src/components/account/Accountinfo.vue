<template lang="pug">
    .account
        form.account__form(@submit.prevent="saveInfo")
            .companyDetails
                .companyDetails__title.blockTitle
                    span Company Details
                .companyDetails__details
                    .name
                        p.name__title Company Name
</template>

<script>

export default {
    props: {
        client: {
            type: Object
        },
        user: {
            type: Object
        },
        projects : {
            type: Array
        },
        quotes: {
            type: Array
        }
    },
    data() {
        return {
            readonly: true,
            successShow: false,
            password: "",
            confirmPassword: "",
        }
    },
    methods: {
        saveInfo() {

        }
    }
}
</script>

<style lang="scss" scoped>

.account {
    position: relative;
    width: 80%;
    color: #67573e;
    &__form {
        padding: 20px 40px;
        display: flex;
        flex-direction: column;
        max-width: 100%;
    }
}

</style>
