<template lang="pug">
.approve-modal(:class="{'approve-modal_centered': isCentered}")
    .approve-modal__text
      span  {{text}}
    slot
    .approve-modal__buttons
        .approve-modal__button(@click="approve")
            Button(:value="approveValue" class="width-191")
        .approve-modal__button(@click="notApprove")
            Button(:value="notApproveValue" class="width-191")
    span.approve-modal__close(@click="close") +
</template>

<script>
import Button from "../components/overall/Button";

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
    padding: 20px;
    box-shadow: 0 0 10px #67573e9d;
    background-color: $white;
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
    padding: 25px;
    .approve-modal {
        &__text {
            font-size: 18px;
            text-align: center;
        }
    }
}
</style>
