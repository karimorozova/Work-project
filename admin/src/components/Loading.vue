<template lang="pug">
  .alert-message
    .alert-message__loading
      .alert-message__text Loading ...
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
@import '../assets/scss/colors';
%messageBox {
  border-radius: 4px;
  padding: 10px 30px;
  display: flex;
  font-size: 14px;
  border-right: 3px solid;
}

.alert-message {
  position: fixed;
  z-index: 90000;
  right: 50px;
  top: 70px;
  background: white;
  border-radius: 4px;
  box-shadow: $box-shadow;

  &__loading {
    color: $green;
    @extend %messageBox;
  }

}

.icon {
  font-size: 14px;
  margin-right: 10px;
}
</style>
