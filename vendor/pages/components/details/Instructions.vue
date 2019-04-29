<template lang="pug">
    .instructions
        .instructions__textarea
            .instructions__title Instructions:
            p.instructions__text Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.
</template>

<script>
export default {
    
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
        max-height: 125px;
        overflow-y: overlay;
    }
    &__text {
        margin: 10px 0;
        font-size: 14px;
    }
}


</style>
