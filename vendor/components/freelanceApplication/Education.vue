<template lang="pug">
    .education
        .education__main-title EDUCATION
        span.education__comment If you have any queries regarding the completion of this form, please contact vendor@pangea.global.

</template>

<script>

export default {
    data() {
        return {

        }
    },
    methods: {

    }
}
</script>

<style lang="scss" scoped>

.education {
    &__main-title {
        font-size: 24px;
        position: relative;
        margin-bottom: 20px;
        &:before {
            content: "2";
            position: absolute;
            left: -20px;
            bottom: -2px;
            font-size: 28px;
        }   
    }
    &__comment {
        font-size: 12px;
    }
}

</style>
