<template lang="pug">
  .error
    .error__body
      .error__code
        span 4
        span 0
        span 4
      h3.error__title Oops! This Page Could Not Be Found
      p.error__text Sorry but the page you are looking for does not exist, have been removed. name changed or is temporarily unavailable
      Button(value="Go to home page" custom-class="width-191" @clicked="redirectToMain")

</template>

<script>
import Button from "../components/overall/Button"

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
    font-family: Myriad400;
    max-width: 767px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

  }

  &__code {
    font-size: 186px;
    font-family: Myriad900;
    margin: 0 0 30px 0;
    text-transform: uppercase;
    line-height: 0.85;

    span:nth-child(1) {
      color: #ebbb46
    }

    span:nth-child(2) {
      color: #4ba5a5
    }

    span:nth-child(3) {
      color: #cb644a
    }
  }

  &__title {
    font-size: 25px;
    font-family: Myriad600;
    margin: 0;
    margin-bottom: 5px;
  }

  &__text {
    margin: 0;
    margin-bottom: 20px;
    font-size: 18px;
    opacity: 0.5;
  }
}
</style>
