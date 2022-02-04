<template lang="pug">
  .action
    .action__title Actions
    .action__icons
      .action__icon
        i.fa.fa-envelope(@click="openPreview")
      .action__icon(@click="goToVendor")
        i.fas.fa-sign-in-alt

</template>
<script>
export default {
  methods: {
    openPreview() {
      this.$emit("openPreview")
    },
    goToVendor() {
      this.$emit("openVendor")
    }
  }
}
</script>
<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.action {
  box-sizing: border-box;
  padding: 25px;
  box-shadow: $box-shadow;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 420px;
  width: 420px;
  border-radius: 4px;
  background: white;
  margin-left: 50px;
  margin-top: 25px;

  &__title {
    font-size: 18px;
    border-bottom: 1px solid $light-border;
    font-family: Myriad600;
    margin-bottom: 20px;
    width: 100%;
    padding-bottom: 8px;
  }

  &__icons {
    display: flex;
    gap: 12px;
  }

  &__icon {
    font-size: 15px;
    border-radius: 4px;
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: .2s ease-out;
    justify-content: center;
    border: 1px solid $border;
    color: $dark-border;

    &:hover {
      color: $text;
    }
  }
}
</style>