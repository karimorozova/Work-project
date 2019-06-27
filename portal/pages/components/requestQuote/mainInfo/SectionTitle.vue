<template lang="pug">
    .section-title(:class="customClass")
        .section-title__number {{ number }}
        .section-title__text(:class="{'section-title_asterisk': isAsterisk}") {{ text }}
</template>

<script>
export default {
    props: {
        number: {type: String},
        text: {type: String},
        isAsterisk: {type: Boolean},
        customClass: {type: String}
    }
    
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.section-title {
    color: $main-color;
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    &__number {
        font-size: 28px;
        position: absolute;
        left: -20px;
    }
    &__text {
        font-size: 22px;
    }
    &_asterisk {
        position: relative;
        &:after {
            content: "*";
            position: absolute;
            top: -5px;
            right: -12px;
            color: red;
        }
    }
}

.details-titles {
    font-family: MyriadBold;
    margin-bottom: 5px;
    .section-title__text {
        font-size: 18px;
    }
}

</style>
