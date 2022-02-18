<template lang="pug">
  .login
    .login__block
      //.login__logo.center
      //  img(src="../../static/email-logo2.png")
      .login__text.center
        .text__title Sign in
        .text__welcome Welcome back! Please login to your account.

      .login__email-block
        .input__block
          .input__title E-mail
          input.input__field(v-model='form.email' placeholder="Enter your email" )
        .input__block
          .input__title
            span Password

          input.input__field(v-model='form.password' type="password" placeholder="Enter your password")

        router-link(to="/password-reset-request")
          .login__forget Forgot password

        input.action-button__button( type="button" value="Sign in" @click="login")

      .login__splitter
        .login__splitter-text or sign in with

      .login__oauth
        .icons
          .icon
            i(class="fa-solid fa-user")
          .icon
            i(class="fa-solid fa-user")

</template>

<script>
import Button from './Button'
import { mapActions } from "vuex"

export default {
  name: "NewLogin",
  components: {
    Button
  },
  data() {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    async login() {

      try {
        await this.$http.post('/login', this.form)
        this.alertToggle({ message: 'You are login', isShow: true, type: "success" })
        this.$router.push("/")
      } catch (err) {
        this.alertToggle({ message: err.body, isShow: true, type: "error" })

      }
    }

  }
}
</script>

<style scoped lang="scss">
@import "../assets/scss/colors";

.icons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.icon {
  cursor: pointer;
  color: $border;
  transition: .2s ease-out;
  font-size: 18px;

  &:hover {
    color: $dark-border
  }
}

.login {
  background-image: url("../assets/images/signin-background.jpg");
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: $text;
  background-size: cover;

  &__splitter {
    padding-bottom: 30px;
    border-bottom: 1px solid $light-border;
    margin-bottom: 30px;
    position: relative;

    &-text {
      position: absolute;
      background-color: white;
      top: 18px;
      left: 110px;
      padding: 5px;
      color: #ccc;
    }
  }

  &__block {
    background-color: $white;
    border-radius: 4px;
    padding: 40px;
    box-shadow: $box-shadow;
  }

  &__text {
    //margin-bottom: 10px;
    //p {
    //  margin: 5px 0;
    //}
  }

  //&__logo img{
  //  width: 60px;
  //}


  &__forget {
    text-decoration: none;
    color: #ccc;
    text-align: center;
  }


  .text {
    &__title {
      font-size: 24px;
      font-family: Myriad600;
    }

    &__welcome {
      color: $dark-border;
      padding: 10px 0 25px;
    }
  }

  .input {
    &__block {
      margin-bottom: 15px;
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
    margin-top: 15px;

    &:hover {
      filter: brightness(0.96);
    }

    &:active {
      transform: scale(.97);
    }
  }
}

.center {
  text-align: center;
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