<template lang="pug">
.step-info-title(@click="click") {{ title }}
    img.step-info-title__icon(src="../../../../assets/images/open-close-arrow-brown.png" :class="{'step-info-title_reverse': isIconReversed}")
</template>

<script>
export default {
    props: {
        title: {
            type: String
        },
        isIconReversed: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        click() {
            this.$emit("titleClick");
        }
    }
}
</script>

<style lang="scss" scoped>
.step-info-title {
    font-size: 19px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    &__icon {
        transition: all 0.2s;
    }
    &_reverse {
        transform: rotate(180deg);
    }
}
</style>
