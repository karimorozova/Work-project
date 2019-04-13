<template lang="pug">
.custom-radio(@click.stop="toggle")
    .custom-radio__inside-circle(:class="{'custom-radio_checked': isChecked}")
</template>

<script>
export default {
    props: {
        isChecked: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        toggle() {
            this.$emit('toggleRadio')
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.custom-radio {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid $main-color;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &__inside-circle {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }
    &_checked {
        background-color: $main-color;
    }
}

</style>
