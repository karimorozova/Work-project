<template lang="pug">
.add-button(@click="click")
    span.add-button__sign &#43;
</template>

<script>
export default {
    methods: {
        click() {
            this.$emit("add");
        }
    }
}
</script>

<style lang="scss" scoped>

.add-button {
    border: 1px solid #66563D;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.8;
    transition: all 0.4s;
    cursor: pointer;
    &__sign {
        font-size: 28px;
        margin-top: -2px;
    }
}
.add-button:hover {
    opacity: 1;
}

</style>
