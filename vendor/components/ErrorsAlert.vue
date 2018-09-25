<template lang="pug">
.errors
    .errors__close
        span.errors__icon(@click="closeErrors") +
    .errors__title Errors occured:    
    ul.errors__list
        li.errors__item(v-for="error in errors") {{ error }}
</template>

<script>
export default {
    props: {
        errors: {
            type: Array
        }
    },
    methods: {
        closeErrors() {
            this.$emit("closeErrors")
        }
    }    
}
</script>

<style lang="scss" scoped>

.errors {
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid #66563D;
    border-radius: 20px;
    width: 331px;
    padding: 40px 30px;
    box-shadow: 0 3px 8px rgba(103, 87, 62, 0.5);
    position:fixed;
    z-index: 100;
    background-color: #FFF;
    top: calc(50% - 200px);
    left: calc(50% - 165px);
    @media (max-width: 450px) {
        width: 268px;
        left: calc(50% - 135px);
        padding: 20px 15px;
    }
    @media (max-width: 460px) {
        width: 248px;
    }
    &__close {
        position: relative;
        width: 100%;
    }
    &__icon {
        position: absolute;
        top: -36px;
        right: -16px;
        transform: rotate(45deg);
        font-size: 30px;
        font-weight: 700;
        transition: all 0.2s;
        cursor: pointer;
        &:hover {
            text-shadow: 0 0 5px rgba(102, 86, 61, 0.5);
        }
        @media (max-width: 450px) {
            top: -20px;
            right: -3px;
        }
    }
    &__title {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 10px;
    }
    &__list {
        display: flex;
        flex-direction: column;
    }
    &__item {
        color: #FF876C;
    }
}

</style>
