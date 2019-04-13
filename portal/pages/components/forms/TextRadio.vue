<template lang="pug">
    .text-radio(:class="{'text-radio_shadow': isChecked}" @click="check")
        CustomRadio(:isChecked="isChecked")
        .text-radio__text
            p.text-radio__head {{ title }}
            p.text-radio__inner {{ text }}    
</template>

<script>
import CustomRadio from "~/components/CustomRadio";

export default {
    props: {
        isChecked: {type: Boolean},
        title: {type: String},
        text: {type: String}
    },
    methods: {
        check() {
            this.$emit('check');
        }
    },
    components: {
        CustomRadio
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.text-radio {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    border: 1px solid $main-color;
    padding: 10px;
    margin-left: 12px;
    border-radius: 10px;
    cursor: pointer;
    color: $main-color;
    &__text {
        width: 88%;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
    }
    &__head {
        margin-bottom: 5px;
        font-size: 14px;
        font-weight: bold;
    }
    &__inner {
        text-align: center;
        font-size: 12px;
        margin-top: 0;
    }
    &_shadow {
        box-shadow: 0 0 10px $brown-shadow;
    }
}

</style>