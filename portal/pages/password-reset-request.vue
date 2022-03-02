<template lang="pug">
  .reset-request
    .reset-request__block
      .login__text.center
        .text__title Forgot password
        .text__welcome No worries, we'll send you reset instructions.
      .reset-request__email-block
        .input__block
          .input__title E-mail
          input.input__field(v-model='email' placeholder="Enter your email" @keyup.enter="sendRequest")

        input.action-button__button( type="button" value="Reset password" @click="sendRequest")

        router-link(to="/login")
          .back Back to Login

</template>

<script>
import { mapActions } from "vuex"

export default {
  data() {
    return {
      email: ''
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    async sendRequest() {
      try {
        await this.$axios.post('/pass-generate-mail', { email: this.email, portal: 'portal' })
        this.alertToggle({ message: 'Instruction sent', isShow: true, type: "success" })
        await this.$router.push('/login')
      } catch (e) {

        this.alertToggle({ message: 'Something went wrong', isShow: true, type: "error" })
        console.log(e)
      }

    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/scss/colors";

.back {
  text-decoration: none;
  color: $dark-border;
  text-align: center;
  margin-top: 20px;
}

.reset-request {
  background-image: url("../assets/images/signin-background.jpg");
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: $text;
  background-size: cover;

  &__block {
    background-color: $white;
    border-radius: 4px;
    padding: 30px;
    box-shadow: $box-shadow;
  }

  .text {
    &__title {
      font-size: 24px;
      font-family: Myriad600;
    }

    &__welcome {
      color: $border-focus;
      padding: 10px 0 25px;
    }
  }

  &__login {
    margin-top: 20px;
    color: $dark-border;
  }

  .input {
    &__block {
      margin-bottom: 25px;
    }

    &__title {
      font-size: 14px;
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      color: $dark-border;
      letter-spacing: 0.2px;

    }

    &__field {
      font-family: Myriad400;
      font-size: 14px;
      box-sizing: border-box;
      border: 1px solid $light-border;
      outline: none;
      width: 320px;
      height: 40px;
      border-radius: 4px;
      transition: .1s ease-out;
      box-shadow: 0 0 0 30px white inset !important;
      padding: 0px 10px;

      &:focus {
        border: 1px solid $border;
      }
    }
  }
}

.center {
  text-align: center;
}

.action-button {
  &__button {
    height: 40px;
    width: 100%;
    color: $white;
    font-size: 14px;
    border-radius: 2px;
    background-color: $red;
    border: none;
    outline: none;
    letter-spacing: 0.2px;
    cursor: pointer;
    transition: .05s ease-out;

    &:hover {
      filter: brightness(0.96);
    }

    &:active {
      transform: scale(.97);
    }
  }
}

a {
  color: inherit;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}
</style>