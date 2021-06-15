<template lang="pug">
    .text-input(:class="customClass")
        .text-input__label {{ label }}
            span.text-input__asterisk(v-if="isAsterisk") *
            img.text-input__info(v-if="isInfo" src="../../../../../assets/images/info-icon.png" @click="toggleTip")
            .text-input__tooltip(:class="{'text-input_visible': isTip}") {{ tip }}
        textarea.text-input__textarea(v-if="isArea" rows="1" @keyup="autoGrow()" :class="growClass" @input="setTextareaVal")
        input.text-input__input(v-else type="text" @input="setInputVal" :disabled="isDisabled")
</template>

<script>
export default {
    props: {
        label: {type: String},
        isAsterisk: {type: Boolean},
        tip: {type: String },
        isInfo: {type: Boolean},
        isArea: {type: Boolean},
        isDisabled: {type: Boolean},
        growClass: {type: String},
        customClass: {type: String}
    },
    data() {
        return {
            isTip: false
        }
    },
    methods: {
        autoGrow() {
            let element = document.querySelector(`.${this.growClass}`);
            let row = element.getAttribute("rows");
            if (element.clientHeight < element.scrollHeight) {
                element.style.height = element.scrollHeight * 2 - element.clientHeight + "px";
            }
        },
        setInputVal(e) {
            const { value } = e.target;
            this.$emit('setInputVal', { value });
        },
        setTextareaVal(e) {
            const { value } = e.target;
            this.$emit('setTextareaVal', { value });
        },
        toggleTip() {
            this.isTip = !this.isTip;
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors.scss";

%text-field {
    outline: none;
    box-sizing: border-box;
    padding: 5px;
    border: 1px solid $main-color;
    border-radius: 4px;
    width: 100%;
}

.text-input {
    &__label {
        font-size: 14px;
        position: relative;
    }
    &__asterisk {
        position: absolute;
        font-size: 16px;
        color: red;
        top: 2px;
    }
    &__info {
        position: relative;
        top: 3px;
        margin-left: 3px;
        cursor: pointer;
    }
    &__textarea {
        resize: none;
        vertical-align: top;
        @extend %text-field;
    }
    &__input {
        @extend %text-field;
    }
    &__tooltip {
        color: $orange;
        position: absolute;
        top: -10px;
        left: 0;
        display: none;
    }
    &_visible {
        display: block;
    }
}

.long-tip {
    .text-input_visible {
        width: 210%;
        left: -10px;
    }
}

.row-flexed {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    .text-input__input {
        width: 77%;
    }
}

</style>
