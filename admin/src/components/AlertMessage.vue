<template lang="pug">
  .alert-message
    .alert-message__success(v-if="type !== 'error'")
      i.icon.fa.fa-check(aria-hidden='true')
      .alert-message__text {{ text }}
    .alert-message__error(v-else)
      i.icon.fa.fa-exclamation(aria-hidden='true')
      .alert-message__text {{ text }}
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
  padding: 15px 25px;
  display: flex;
}

.alert-message {
  position: fixed;
  z-index: 70000;
  right: 50px;
  top: 70px;
  background: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  min-width: 150px;
  font-family: MYRIAD300;

  &__success {
    color: $green;
    @extend %messageBox;
  }

  &__error {
    color: $red;
    @extend %messageBox;
  }
}

.icon {
  font-size: 14px;
  margin-right: 10px;
}
</style>
