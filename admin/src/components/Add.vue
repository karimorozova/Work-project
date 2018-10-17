<template lang="pug">
.add-button(@click="click")
    span.add-button__sign +
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
    cursor: pointer;
    &__sign {
        font-size: 29px;
    }
    .language-pairs__delete & {
        @media (max-width: 450px) {
            position: absolute;
            right: -173px;
            top: -265px;
        }
        @media (max-width: 380px) {
            right: -154px;
            top: -247px;
        }
        @media (max-width: 360px) {
            right: -145px;
            top: -237px;
        }
        @media (max-width: 320px) {
            right: -122px;
            top: -215px;
        }
    }
}

</style>
