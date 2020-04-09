<template lang="pug">
    .instructions
        .instructions__textarea
            .instructions__title Brief:
            p.instructions__text {{ job.brief }}
</template>

<script>
export default {
    props: {
        job: {type: Object}
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.instructions {
    margin-top: 20px;
    padding-right: 10px;
    &__textarea {
        padding: 8px;
        box-sizing: border-box;
        border: 2px solid $light-brown;
        border-radius: 5px;
        height: 125px;
    }
    &__text {
        margin: 10px 0;
        font-size: 14px;
        max-height: 65px;
        overflow-y: auto;
    }
}


</style>
