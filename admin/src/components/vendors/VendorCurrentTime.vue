<template lang="pug">
  .action
    .action__title Vendor's time:
    .time {{ new Date().toLocaleString('en-US', { timeZone: currentTimeZone}) }}
</template>
<script>

export default {
  name: 'VendorCurrentTime',
  props: ['currentTimeZone'],
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
  border-radius: 2px;
  background: white;
  margin-left: 50px;
  margin-top: 25px;

  &__title {
    font-size: 16px;
    border-bottom: 1px solid $light-border;
    font-family: Myriad600;
    margin-bottom: 20px;
    width: 100%;
    padding-bottom: 8px;
  }
}
</style>
