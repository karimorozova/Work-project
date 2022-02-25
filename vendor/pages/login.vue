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
          input.input__field(v-model='form.logemail' placeholder="Enter your email" )
        .input__block
          .input__title
            span Password

          input.input__field(v-model='form.logpassword' type="password" placeholder="Enter your password" v-on:keyup.enter="onEnter")

        router-link(to="/password-reset-request")
          .login__forget Forgot password

        input.action-button__button( type="button" value="Sign in" @click="sendForm")

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
  data() {
    return {
      form: {
        logemail: "",
        logpassword: ""
      },
      isAllFieldsError: false,
      GoogleAuth: {},
    }
  },
  methods: {
    async start() {
      const gapi = window.gapi
      // 2. Initialize the JavaScript client library.
      await gapi.auth2.init({
        'clientId': '1057113930206-vcj6erd2h955k9jr2e3ib3lqddrcsn7b.apps.googleusercontent.com',
      })

      this.GoogleAuth = gapi.auth2.getAuthInstance();

      const data = await this.GoogleAuth.signIn()
      const response = (await this.$axios.post('/login-with-google', { idToken: data.wc.id_token, portal: 'vendor' }, { withCredentials: true })).data
      const {status, token} = response
      if (status === 'success') {
        this.login(token)
        this.alertToggle({ message: "You are logged in", isShow: true, type: "success" })
        this.$router.push('/dashboard')
      } else {
        this.GoogleAuth.signOut()
        this.alertToggle({ message: "No such user in system", isShow: true, type: "error" })
      }





    },

    async singInGoogle() {
      window.gapi.load('auth2', this.start);
    },

    async sendForm() {
      try {
        const result = await this.$axios.$post("/vendor/login", {
          ...this.form
        })
        this.login(result)

        const previousLink = this.$cookie.get('previousPath')
        !!result && !!previousLink && previousLink !== '/login' && previousLink !== '/' ?
            await this.$router.push(previousLink) :
            await this.$router.push('/dashboard')

        this.$cookie.delete('previousPath')
        this.alertToggle({ message: "You are logged in", isShow: true, type: "success" })
      } catch (err) {
        let message = err.message
        if (err.response && err.response.data) {
          message = err.response.data
        }
        this.alertToggle({ message, isShow: true, type: "error" })
      }
    },
    forget() {
      this.forgotLink = !this.forgotLink
    },
    async loadSDK(d, s, id) {
      let js,
          fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) {
        return
      }
      js = d.createElement(s)
      js.id = id
      js.src = "https://apis.google.com/js/api.js"
      fjs.parentNode.insertBefore(js, fjs)
    },
    ...mapActions({
      alertToggle: "alertToggle",
      login: "login"
    }),
  },
  async created() {
    await this.loadSDK(document, "script", "googless")
  }
}
</script>

<style lang="scss" scoped>
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
      font-family: Roboto600;
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
