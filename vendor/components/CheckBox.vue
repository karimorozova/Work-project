<template lang="pug">
    .check-box
        img.check-box__image(v-if="isChecked" src="../assets/images/selected-checkbox.png" @click="unCheck")
        img.check-box__image(v-else src="../assets/images/unselected-checkbox.png" @click="check")
            
</template>

<script>
export default {
    props: {
        isChecked: {type: Boolean}
    },
    methods: {
        check() {
            this.$emit("check");
        },
        unCheck() {
            this.$emit("unCheck");
        }
    }
}
</script>

<style lang="scss" scoped>
    .check-box {
        &__image {
            height: 25px;
            width: 25px;
        }
    }
</style>
