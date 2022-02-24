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

          input.input__field(v-model='form.password' type="password" placeholder="Enter your password" v-on:keyup.enter="login")

        router-link(to="/password-reset-request")
          .login__forget Forgot password

        input.action-button__button( type="button" value="Sign in" @click="login")

      .login__splitter
        .login__splitter-text or sign in with

      .login__oauth
        .icons
          .icon(@click="singInGoogle")
            i(class="fa-brands fa-google" )
          //.icon
          //  i(class="fa-brands fa-facebook-f")

</template>

<script>
import { mapActions } from "vuex"

export default {
  name: "NewLogin",
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
    },

    async singInGoogle() {
      try {

        const googleUser = await this.$gAuth.signIn()
        if (!googleUser) {
          return null
        }

        this.isAllFieldsError = false
        const data = await this.$http.post('/login-with-google', { idToken: googleUser.getAuthResponse().id_token, portal: 'admin'})
        const loginResult = data.body
        console.log(loginResult)
        if (loginResult.status === 'success') {
          // await this.loggingIn(loginResult)
          this.alertToggle({ message: "You are logged in", isShow: true, type: "success" })
          this.$router.push("/")

          this.isSignIn = this.$gAuth.isAuthorized
        } else {
          this.signOutGoogle()
          this.alertToggle({ message: "No such user in system", isShow: true, type: "error" })
        }

      } catch (error) {
        console.log(error)
        //on fail do something
        this.alertToggle({ message: "No such user in system", isShow: true, type: "error" })
        return null
      }
    },
    async signOutGoogle() {
      try {
        await this.$gAuth.signOut()
        this.isSignIn = this.$gAuth.isAuthorized
        console.log("isSignIn", this.$gAuth.isAuthorized)
      } catch (error) {
        console.error(error)
      }
    },
    async logInWithFacebook() {
      await this.loadFacebookSDK(document, "script", "facebook-jssdk")
      await this.initFacebook()
      window.FB.login(function (response) {
        if (response.authResponse) {
          alert("You are logged in &amp; cookie set!")
          // Now you can redirect the user or do an AJAX request to
          // a PHP script that grabs the signed request from the cookie.
        } else {
          alert("User cancelled login or did not fully authorize.")
        }
      })
      return false
    },
    async initFacebook() {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: "8220179XXXXXXXXX", //You will need to change this
          cookie: true, // This is important, it's not enabled by default
          version: "v13.0"
        })
      }
    },
    async loadFacebookSDK(d, s, id) {
      var js,
          fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) {
        return
      }
      js = d.createElement(s)
      js.id = id
      js.src = "https://connect.facebook.net/en_US/sdk.js"
      fjs.parentNode.insertBefore(js, fjs)
    }

  },
  created() {
    let that = this
    let checkGauthLoad = setInterval(function () {
      that.isInit = that.$gAuth.isInit
      that.isSignIn = that.$gAuth.isAuthorized
      if (that.isInit) clearInterval(checkGauthLoad)
    }, 1000)

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
  color: $dark-border;
  transition: .1s ease-out;
  font-size: 16px;
  border: 1px solid $light-border;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;

  &:hover {
    color: $text
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
      color: $dark-border;
    }
  }

  &__block {
    background-color: $white;
    border-radius: 4px;
    padding: 30px;
    box-shadow: $box-shadow;
  }


  &__forget {
    text-decoration: none;
    color: $dark-border;
    text-align: center;
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

  .input {
    &__block {
      margin-bottom: 15px;
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
      box-sizing: border-box;
      border: 1px solid $light-border;
      outline: none;
      width: 320px;
      height: 40px;
      border-radius: 4px;
      transition: .1s ease-out;
      box-shadow: 0 0 0 30px white inset !important;
      padding: 0px 10px;
      font-size: 14px;
      color: $text;

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

::placeholder {
  opacity: 0.4;
}
</style>