<template lang="pug">
.action-button
    input.action-button__button(type="button" :value="value" @click="clicked")    
</template>

<script>
export default {
    props: {
        value: {
            type: String
        }
    },
    methods: {
        clicked() {
            this.$emit('clicked', {value: this.value})
        }
    }
}
</script>

<style lang="scss" scoped>

.action-button {
    &__button {
        width: 138px;
        height: 33px;
        color: #FFF;
        font-size: 14px;
        font-weight: 700;
        border-radius: 10px;
        box-shadow: 0 3px 5px rgba(103, 87, 62, 0.5);
        background-color: #D15F45;
        border: 1px solid #D15F45;
        cursor: pointer;
        outline: none;
        &:hover {
            box-shadow: 0 0 7px rgba(103, 87, 62, 0.8);     
        }
        &:active {
            box-shadow: 0 0px 15px rgba(103, 87, 62, 1);
        }
    }
    .other-choice & {
        margin: 7px;
        @media (max-width: 450px) {
            margin: 5px;
        }
    }
}

</style>
