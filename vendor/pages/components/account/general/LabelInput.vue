<template lang="pug">
    .pair
        label.pair__name {{ name }}:
        input.pair__input(type="text" :value="value" :readonly="isReadonly" @input="input" :class="{'pair_opacity-08': isReadonly}")
</template>

<script>
export default {
    props: {
        name: {type: String},
        value: {type: String},
        isReadonly: {type: Boolean}
    },
    methods: {
        input(e) {
            this.$emit("input", { value: e.target.value })
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.pair {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    &__name {
        font-size: 14px;
    }
    &__input {
        font-size: 14px;
        color: #67573e;
        border: 1px solid #67573e;
        border-radius: 4px;
        padding: 0 5px;
        outline: none;
        width: 191px;
        height: 30px;
        box-sizing: border-box;
    }
    &_opacity-08 {
        opacity: 0.8;
    }
}

</style>
