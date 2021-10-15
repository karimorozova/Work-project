<template lang="pug">
  .loading
    .loading__message
      span.loading__text Loading
      .loading__spinner
</template>

<script>
	export default {}
</script>

<style lang="scss" scoped>
  @import '../assets/scss/colors';

  .loading {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    z-index: 10000;

    &__message {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      position: fixed;
      top: 0;
      left: 50%;
      margin-left: -125px;
      padding: 20px 0;
      width: 250px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: white;
      box-shadow: $box-shadow;
    }

    &__text {
      color: $text;
      font-size: 16px;
      margin-right: 20px;
    }

    &__spinner {
      border: 6px solid $light-border;
      border-top: 6px solid $dark-border;
      border-radius: 50%;
      width: 15px;
      height: 15px;
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
