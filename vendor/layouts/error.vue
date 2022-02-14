<template lang="pug">
  .error
    .error__body
      .error__code Oops!
      h3.error__title This Page Could Not Be Found
      p.error__text Sorry but the page you are looking for does not exist, have been removed. name changed or is temporarily unavailable
      Button(value="Go to home page" @clicked="redirectToMain")

</template>

<script>
import Button from "../components/general/Button"

export default {
  components: { Button },
  props: [ 'error' ],
  methods: {
    redirectToMain() {
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style lang="scss" scoped>
.error {
  &__body {
    color: #333;
    font-family: Roboto400;
    max-width: 600px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  &__code {
    font-family: Roboto900;
    font-size: 125px;
    margin-bottom: 15px;
    color: #ddd;
    cursor: default;
  }

  &__title {
    font-size: 24px;
    font-family: Roboto600;
    margin: 0;
    margin-bottom: 10px;
    cursor: default;
  }

  &__text {
    margin: 0;
    margin-bottom: 15px;
    font-size: 16px;
    opacity: 0.5;
    cursor: default;
  }
}
</style>
