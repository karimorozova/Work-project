<template lang="pug">
    .checkbox(:class="customClass")
        img.checkbox__image(v-if="!isChecked" src="../assets/images/unselected-checkbox.png" @click="check")
        img.checkbox__image(v-else src="../assets/images/selected-checkbox.png" @click="uncheck")   
</template>

<script>
export default {
    props: {
        isChecked: {type: Boolean},
        customClass: {type: String}
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

.review-options {
    display: flex;
    align-items: center;
    .checkbox__image {
        width: 23px;
    }
}

</style>
