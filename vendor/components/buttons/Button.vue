<template lang="pug">
.action-button
    input.action-button__button(type="button" :value="value" @click="makeAction")    
</template>

<script>
export default {
    props: {
        value: {
            type: String
        }
    },
    methods: {
        makeAction() {
            this.$emit('makeAction', {value: this.value})
        }
    }
}
</script>

<style lang="scss" scoped>

.action-button {
    margin: 20px;
    &__button {
        width: 138px;
        height: 33px;
        color: white;
        font-size: 14px;
        border-radius: 10px;
        box-shadow: 0 3px 5px rgba(103, 87, 62, 0.5);
        background-color: #ff876c;
        border: 1px solid #ff876c;
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
