<template lang="pug">
.approve-modal(:class="{'approve-modal_centered': isCentered}")
    .approve-modal__text {{ text }}
    .approve-modal__buttons
        .approve-modal__button(@click="approve")
            Button(:value="approveValue")
        .approve-modal__button(@click="notApprove")
            Button(:value="notApproveValue")
    span.approve-modal__close(@click="close") +
</template>

<script>
import Button from "./buttons/Button";

export default {
    props: {
        text: {
            type: String
        },
        approveValue: {
            type: String
        },
        notApproveValue: {
            type: String
        },
        isCentered: {
            type: Boolean
        }
    },
    data() {
        return {

        }
    },
    methods: {
        approve() {
            this.$emit("approve");
        },
        notApprove() {
            this.$emit("notApprove");
        },
        close() {
            this.$emit("close");
        }
    },
    components: {
        Button
    }
}
</script>

<style lang="scss">
@import "../assets/scss/colors.scss";

.approve-modal {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    box-shadow: 0 0 5px $brown-shadow;
    background-color: $white;
    max-width: 300px;
    &__buttons {
        margin-top: 10px;
        display: flex;
    }
    &__button {
        margin: 5px;
    }
    &__close {
        position: absolute;
        top: 2px;
        right: 8px;
        transform: rotate(45deg);
        cursor: pointer;
        font-size: 22px;
        font-weight: bold;
    }
}

.approve-modal_centered {
    padding: 30px;
    .approve-modal {
        &__text {
            line-height: 1.5;
            font-size: 20px;
            text-align: center;       
        }
    }
}
</style>
