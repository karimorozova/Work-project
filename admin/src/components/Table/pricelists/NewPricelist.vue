<template lang="pug">
.new-price
    .new-price__title Add a new Pricelist
    .new-price__main
        .new-price__block
            .new-price__item
                LabelVal(text="Name:")
                    input(type="text")
            .new-price__item
                LabelVal(text="Copy from:")
                    input(type="text")
        .new-price__block
            .new-price__item.new-price_less-width
                LabelVal(text="Default:")
                    Toggler(
                        :isDisabled="isTogglerDisabled" 
                        :isActive="isPricelistDefault"
                        @toggle="toggleDefault")
            .new-price__item.new-price_less-width
                LabelVal(text="Active:")
                    Toggler(
                        :isDisabled="isTogglerDisabled"
                        :isActive="isPricelistActive"
                        @toggle="toggleActive")
</template>

<script>
import LabelVal from "../../LabelVal";
import Toggler from "../../Toggler";

export default {
    data() {
        return {
            isTogglerDisabled: false,
            isPricelistDefault: false,
            isPricelistActive: false
        }
    },
    methods: {
        toggleDefault() {
            this.isPricelistDefault = !this.isPricelistDefault;
        },
        toggleActive() {
            this.isPricelistActive = !this.isPricelistActive;
        }
    },
    components: {
        LabelVal,
        Toggler
    }
}
</script>

<style lang="scss" scoped>
.new-price {
    display: flex;
    flex-direction: column;
    &__title {
        font-size: 24px;
        margin-bottom: 20px;
    }
    &__main {
        display: flex;
        justify-content: space-between;
    }
    &__block {
        width: 45%;
        &:last-child {
            width: 30%;
        }
    }
    &__item {
        margin-bottom: 20px;
    }
    &_less-width {
        width: 80%;
    }
}
</style>
