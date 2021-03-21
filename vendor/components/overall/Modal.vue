<template lang="pug">
  .modal
    .modal__body
      slot
    span.modal__close(@click.stop="close") &#215;
</template>

<script>
import Button from "./Button"
import SelectSingle from "./SelectSingle"

export default {
  props: {
    text: {
      type: String
    },
  },
  data() {
    return {}
  },
  methods: {
    close() {
      this.$emit("close")
    },
  },
}
</script>

<style lang="scss">
@import "../../assets/scss/colors.scss";

.modal {
  position: absolute;
  padding: 20px;
  background-color: $white;
  font-size: 16px;
  z-index: 1000;

  &__buttons {
    margin-top: 10px;
    display: flex;
  }

  &__button {
    margin: 5px;
  }

  &__close {
    position: absolute;
    top: 5px;
    right: 7px;
    font-size: 22px;
    cursor: pointer;
    height: 22px;
    width: 22px;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: Myriad900;
    opacity: 0.8;
    transition: ease 0.2s;


    &:hover {
      opacity: 1
    }
  }
}
</style>
