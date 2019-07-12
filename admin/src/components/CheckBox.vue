<template lang="pug">
    .checkbox(:class="customClass")
        .checkbox__brown(v-if="!isWhite")
            img.checkbox__image(v-if="!isChecked" src="../assets/images/unselected-checkbox.png" @click.stop="check")
            img.checkbox__image(v-else src="../assets/images/selected-checkbox.png" @click.stop="uncheck")
        .checkbox__white(v-else)
            img.checkbox__image(v-if="!isChecked" src="../assets/images/checkbox_white.png" @click.stop="check")
            img.checkbox__image(v-else src="../assets/images/checkbox-tick_white.png" @click.stop="uncheck")   
</template>

<script>
export default {
    props: {
        isChecked: {type: Boolean},
        customClass: {type: String},
        isWhite: {type: Boolean},
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
    height: 18px;
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
