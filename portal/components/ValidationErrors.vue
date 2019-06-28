<template lang="pug">
.validation(:class="[customClass, {'validation_absolute': isAbsolute}]")
    .validation__errors(:style="customStyles")
        .validation__messages
            .validation__errors-title Errors:
            li.validation__error(v-for="error in errors") {{ error }}
            span.validation__close(@click="closeErrors") +
</template>

<script>
export default {
    props: {
        errors: {
            type: Array
        },
        customClass: {
            type: String
        },
        customStyles: {
            type: Object
        },
        isAbsolute: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        closeErrors() {
            this.$emit("closeErrors");
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.validation {
    &__errors {
        position: fixed;
        top: 45%;
        left: 50%;
        margin-left: -300px;
        width: 320px;
        padding: 15px;
        box-shadow: 0 0 10px $brown-shadow;
        background-color: $white;
        box-sizing: border-box;
        z-index: 50;
    }
    &__errors-title {
        font-size: 18px;
        text-align: center;
        margin-bottom: 10px;
    }
    &__messages {
        position: relative;
    }
    &__error {
        color: $orange;
        font-size: 16px;
        font-weight: 600;
    }
    &__close {
        transform: rotate(45deg);
        position: absolute;
        top: -12px;
        right: -8px;
        font-size: 24px;
        font-weight: 700;
        cursor: pointer;
    }
}

.validation_absolute {
    .validation__errors {
        position: absolute;
        background: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: none;
        width: 100%;
        margin-left: 0;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-color: transparent;
        z-index: 50;
    }
    .validation__messages {
        box-shadow: 0 0 5px $red;
        background-color: white;
        padding: 20px;
    }
    .validation__close {
        transform: rotate(45deg);
        position: absolute;
        top: 0;
        right: 8px;
        font-size: 24px;
        font-weight: 700;
        cursor: pointer;
    }
}

.request-quote__errors {
    .validation__errors {
        margin-left: 0;
        left: 40%;
        @media (max-width: 1024px) {
            left: 30%;
        }
        @media (max-width: 550px) {
            left: 15%;
        }
        @media (max-width: 420px) {
            left: 30px;
            width: 300px;
        }
    }
}

</style>
