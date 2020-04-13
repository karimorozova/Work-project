<template lang="pug">
    .instructions
        .instructions__textarea
            .instructions__title Brief:
            textarea.instructions__text(disabled) {{ job.brief }}
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
    box-sizing: border-box;
    overflow: hidden;
    &__textarea {
        padding: 8px;
        box-sizing: border-box;
        border: 2px solid $light-brown;
        border-radius: 5px;
        height: 125px;
    }
    &__text {
        box-sizing: border-box;
        padding: 10px 0;
        font-size: 14px;
        overflow-y: auto;
        border: none;
        outline: none;
        width: 100%;
        height: 100%;
        background: transparent;
        resize: none;
    }
}


</style>
