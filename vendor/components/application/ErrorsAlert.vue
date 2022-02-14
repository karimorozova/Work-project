<template lang="pug">
  .errors
    .errors__close
      span.errors__icon(@click="closeErrors") +
    .errors__title Errors occured:    
    ul.errors__list
      li.errors__item(v-for="error in errors") {{ error }}
</template>

<script>
export default {
  props: {
    errors: {
      type: Array
    }
  },
  methods: {
    closeErrors() {
      this.$emit("closeErrors")
    }
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.errors {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 331px;
  padding: 20px;
  box-shadow: $box-shadow;
  position: fixed;
  z-index: 100;
  background-color: #FFF;
  top: calc(50% - 200px);
  left: calc(50% - 165px);

  @media all and (orientation: portrait) and (max-width: 767px) {
    box-shadow: none;
    width: auto;
    left: 0;
    border: 1px solid #d66f58;
  }
  @media all and (orientation: landscape) and (max-width: 1000px) {
    box-shadow: none;
    width: auto;
    left: 0;
    top: 40px;
    border: 1px solid #d66f58;
  }

  &__close {
    position: relative;
    width: 100%;
  }

  &__icon {
    position: absolute;
    top: -15px;
    right: -10px;
    transform: rotate(45deg);
    font-size: 30px;
    transition: all 0.2s;
    cursor: pointer;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }

  &__title {
    font-size: 16px;
    color: $red;
    text-transform: uppercase;
    font-family: Roboto600;
  }

  &__list {
    display: flex;
    flex-direction: column;
  }

  &__item {
    color: #333;
    margin: 2px 0;
  }
}

</style>
