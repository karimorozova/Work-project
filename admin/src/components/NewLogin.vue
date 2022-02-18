<template lang="pug">
  .login
    .login__block
      .login__logo.center
        img(src="../../static/email-logo2.png")
      .login__text.center
        span.text__title Login
        p.text__welcome Welcome back! Please login to your account.
      .login__email-block
        .input__block
          .input__title E-mail:
          input.input__field(v-model='form.email' placeholder="example@pangea.global" )
        .input__block
          .input__title
            span Password:
            router-link.login__forget(to="/password-reset-request") Forget Password?
          input.input__field(v-model='form.password' type="password" placeholder="Password")
        input.action-button__button( type="button" value="Login" @click="login")
      .login__oauth

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
        password: '',
      }
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
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
.login {
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
    padding: 20px 35px 35px;
  }

  &__text {
    font-family: Myriad600;
    margin-bottom: 10px;
    p {
      margin: 5px 0;
    }
  }

  &__logo img{
    width: 60px;
  }



  &__forget {
    text-decoration: none;
    color: $dark-border;
  }


  .text{
    &__title {
      font-size: 25px;
    }
    &__welcome {
      color: $dark-border;
    }
  }
  .input {
    &__block {
      margin-bottom: 15px;
    }
    &__title {
      font-size: 14px;
      margin-bottom: 3px;
      display: flex;
      justify-content: space-between;
    }
    &__field {
      box-sizing: border-box;
      border: none;
      outline: none;
      width: 100%;
      height: 35px;
      border-radius: 4px;
      padding: 5px 10px;
      background-color: $light-border;
    }
  }
}

.action-button {
  &__button {
    min-width: 110px;
    padding: 0 30px 0 30px;
    height: 35px;
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

.center {
  text-align: center;
}
</style>