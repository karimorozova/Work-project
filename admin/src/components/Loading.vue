<template lang="pug">
  .alert-message
    .icon__loading
      .icon
        i(class="fa-solid fa-spinner fa-spin-pulse" style="--fa-animation-duration: 0.5s;")
    .text Loading
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

.alert-message {
  position: fixed;
  z-index: 90000;
  right: 50px;
  top: 60px;
  background: white;
  border-radius: 2px;
  box-shadow: $box-shadow;
  display: flex;
  padding: 10px 20px 10px 12px;
  align-items: center;
  gap: 12px;
}

.icon {
  font-size: 16px;
  background: $table-list;
  height: 25px;
  width: 25px;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;

  &__loading {
    color: $dark-border;
  }
}
</style>
