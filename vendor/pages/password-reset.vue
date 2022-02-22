<template lang="pug">
  .reset-pass
    .reset-pass__block
      .login__text.center
        .text__title Set new password
        .text__welcome Enter a new password for your account
      .reset-pass__email-block
        .input__block
          .input__title Password
          input.input__field(v-model='pass' placeholder="Enter your password"  type="password")

        .input__block
          .input__title Confirm password
          input.input__field(v-model='passRepeat' placeholder="Confirm your password" type="password" v-on:keyup.enter="sendRequest")

        input.action-button__button( type="button" value="Reset password" @click="sendRequest")

        .reset-pass__login.center
          router-link(to="/login") Back to Login


  //input(v-model="pass" type="password")
  //  input(v-model="passRepeat" type="password")
  //  Button(value="Reset" @clicked="sendRequest")
</template>

<script>
import { mapActions } from "vuex"

export default {
  data() {
    return {
      pass: '',
      passRepeat: '',
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
    }),
    async sendRequest() {
      try {
        const { status, message } = (await this.$axios.post('/pass-reset', { pass: this.pass, passRepeat: this.passRepeat, token: this.$route.query.token })).data
        this.alertToggle({ message, isShow: true, type: status })
        await this.$router.push('/login')
      } catch (e) {
        this.alertToggle({ message: e.body.message, isShow: true, type: "error" })
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/scss/colors";

.reset-pass {
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
    padding: 40px;
    box-shadow: $box-shadow;
  }

  .text {
    &__title {
      font-size: 24px;
      font-family: Roboto600;
    }

    &__welcome {
      color: $dark-border;
      padding: 10px 0 25px;
    }
  }

  &__login {
    margin-top: 20px;
    color: #ccc;
  }

  .input {
    &__block {
      margin-bottom: 20px;
    }

    &__title {
      font-size: 14px;
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      color: #ccc;
      letter-spacing: 0.2px;

    }

    &__field {
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