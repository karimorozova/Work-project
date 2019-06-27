<template lang="pug">
    .submit-button(:class="customClass")
        button.submit-button__button(type="submit" ) {{ value}}
</template>

<script>
export default {
    props: {
        value: { type: String, default: "Submit" },
        customClass: { type: String }
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.submit-button {
    &__button {
        width: 170px;
        height: 33px;
        color: $white;
        font-size: 14px;
        border-radius: 10px;
        box-shadow: 0 3px 5px $brown-shadow;
        background-color: $orange;
        border: 1px solid $orange;
        cursor: pointer;
        outline: none;
        &:hover {
            box-shadow: 0 0 7px rgba(103, 87, 62, 0.8);     
        }
        &:active {
            box-shadow: 0 0px 15px rgba(103, 87, 62, 1);
        }
    }
}

</style>
