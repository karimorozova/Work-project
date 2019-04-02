<template lang="pug">
    .checkbox
        img.checkbox__image(v-if="!isChecked" src="../assets/images/unselected-checkbox.png" @click="check")
        img.checkbox__image(v-else src="../assets/images/selected-checkbox.png" @click="uncheck")   
</template>

<script>
export default {
    props: {
        isChecked: {type: Boolean}
    },
    methods: {
        check() {
            this.$emit('check')
        },
        uncheck() {
            this.$emit('uncheck')
        }
    }
}
</script>

<style lang="scss" scoped>

.checkbox {
    &__image {
        width: 18px;
    }
}

</style>
