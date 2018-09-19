<template lang="pug">
.add-button(@click="addElement")
    span.add-button__sign +
</template>

<script>
export default {
    methods: {
        addElement() {
            this.$emit("addElement");
        }
    }
}
</script>

<style lang="scss" scoped>

.add-button {
    margin-top: 10px;
    border: 1px solid #66563D;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.8;
    cursor: pointer;
    &__sign {
        font-size: 29px;
    }
}

</style>
