<template lang="pug">
  .wrapper
    .content
      .amount Amount:
      .input
        input(type="text" placeholder="Value" :value="projectIdValue" @change="projectIdSetFilter" @keyup.13="projectIdSetFilter")
        span.currency &euro;


</template>

<script>
export default {
  name: "MinimumPaymentVendorAmount"
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.wrapper {
  width: fit-content;
  border-radius: 4px;
  margin: 50px;
  background-color: white;
  padding: 25px;
  box-shadow: $box-shadow;
}

.content {
  display: flex;
  align-items: center;
  gap: 20px;
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  height: 32px;
  transition: .1s ease-out;
  width: 220px;
  font-family: 'Myriad400';

  &:focus {
    border: 1px solid $border-focus;
  }
}

.currency {
  margin-left: 7px;
  color: $dark-border;
}

</style>