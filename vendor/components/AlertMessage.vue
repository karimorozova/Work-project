<template lang="pug">
.alert-message
    .alert-message__text(:class="[type === 'error' ? 'alert-message_error' : 'alert-message_success']") {{ text }}
</template>

<script>
export default {
    props: {
        text: {
            type: String
        },
        type: {
            type: String
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../assets/scss/colors.scss';

.alert-message {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    z-index: 1000;
    right: 20px;
    top: 70px;
    width: 230px;
    padding: 30px 20px 30px 40px;
    box-shadow: 0 0 15px $brown-shadow;
    background-color: $white;
    color: $green-success;
    &_error {
        position: relative;
        color: $orange;
        &:before {
            position: absolute;
            content: "+";
            border: 1px solid #d15f45;
            border-radius: 50%;
            background-color: #d15f45;
            color: #fff;
            left: -21px;
            transform: rotate(45deg);
            width: 12px;
            height: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    &_success {
        position: relative;
        &:before {
            position: absolute;
            content: "";
            border: 1px solid $green-success;
            height: 11px;
            transform: rotate(-45deg);
            left: -20px;
            top: 5px;
            height: 6px;
        }
        &:after {
            position: absolute;
            content: "";
            border: 1px solid $green-success;
            height: 11px;
            transform: rotate(30deg);
            left: -14px;
            top: 0;
            height: 12px;
        }
    }
}
</style>
