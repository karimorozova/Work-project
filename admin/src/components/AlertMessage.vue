<template lang="pug">
.alert-message
  .icon__success(v-if="type !== 'error'")
    i.icon.fa.fa-check(aria-hidden="true")
  .icon__error(v-else)
    i.icon.fa.fa-exclamation(aria-hidden="true")
  .text {{ text }}
</template>

<script>
export default {
  props: {
    text: {
      type: String,
    },
    type: {
      type: String,
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";
.alert-message {
  position: fixed;
  z-index: 90000;
  right: 50px;
  top: 120px;
  background: white;
  border-radius: 2px;
  box-shadow: $box-shadow;
  display: flex;
  padding: 10px 20px 10px 12px;
  align-items: center;
  gap: 12px;
}

.icon {
  font-size: 15px;
  background: $table-list;
  height: 25px;
  width: 25px;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;

  &__success {
    color: $green;
  }

  &__error {
    color: $red;
  }
}
</style>
