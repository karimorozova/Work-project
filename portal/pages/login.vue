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

          input.input__field(v-model='form.logpassword' type="password" placeholder="Enter your password" v-on:keyup.enter="sendForm")

        router-link(to="/password-reset-request")
          .login__forget Forgot password

        input.action-button__button( type="button" value="Sign in" @click="sendForm")

      .login__splitter
        .login__splitter-text or sign in with

      .login__oauth
        .icons
          .icon( @click="singInGoogle")
            i(class="fa-brands fa-google")
          //.icon
          //  i(class="fa-brands fa-facebook-f")

  //.login
  //  .login__main
  //    .login__logo
  //      img.login__image(src="../assets/images/new-logo.png")
  //    form.login__form(@submit.prevent="checkFields")
  //      .login__required-message(v-if="isAllFieldsError") All fields are required!
  //      .login__email
  //        input.login__input(v-model='form.logemail' placeholder='Email' :class="{'login_shadow': form.logemail}")
  //      .login__password
  //        input.login__input(type="password" v-model='form.logpassword' placeholder='Password' :class="{'login_shadow': form.logpassword}")
  //      .login__textrow
  //        .login__checkbox
  //          input.login__checkbox-input(type="checkbox")
  //          label.login__checkbox-label Remember me
  //        .login__fogotContainer
  //          nuxt-link.login__forgot(to="/forgot") Forgot Your Password?
  //      button.login__button(type="submit" :class="{'login_button-backgr': form.logemail && form.logpassword}") Sign In

</template>

<script>
import { mapActions, mapGetters } from "vuex"
// import gapii from "vue-google-oauth2"

export default {
  data() {
    return {
      form: {
        logemail: "",
        logpassword: ""
      },
      isAllFieldsError: false
    }
  },
  methods: {


    start() {
      const gapi = window.gapi
      // 2. Initialize the JavaScript client library.
      gapi.auth2.init({
        'clientId': '685135225652-b1hhjrvjrvsl488b6eklkc5rdhnparoh.apps.googleusercontent.com',
      }).then(() => {
        this.GoogleAuth = gapi.auth2.getAuthInstance();
        gapi.auth2.getAuthInstance()
        this.GoogleAuth.signIn().then((data)=> {
          console.log(data.wc.id_token)
          this.$axios.post('/login-with-google', { idToken: data.wc.id_token, portal: 'portal'}, { withCredentials: true }).then(( data ) => {
            console.log({data})
            const loginResult = data
            console.log({ loginResult })
            if (loginResult.status === 'success') {
              // await this.loggingIn(loginResult)
              this.alertToggle({ message: "You are logged in", isShow: true, type: "success" })
              this.$router.push("/")

              // this.isSignIn = this.$gAuth.isAuthorized
            } else {
              // this.signOutGoogle()
              this.alertToggle({ message: "No such user in system", isShow: true, type: "error" })
            }
          })

        })

      })
    },

    async singInGoogle() {

      window.gapi.load('auth2', this.start);
    },

    // async singInGoogle() {
    //   console.log("clicked")
    //   try {
    //     gapi.load('client', loadSDK);
    //     await this.loadSDK(document, "script", "googless")
    //     // const googleUser = await this.$gAuth.signIn()
    //     // if (!googleUser) {
    //     //   return null
    //     // }
    //     // console.log('testtttauth')
    //     //
    //     // this.isAllFieldsError = false
    //     // const data = await this.$http.post('/login-with-google', { idToken: googleUser.getAuthResponse().id_token, portal: 'vendor'})
    //     // const loginResult = data.body
    //     // console.log(loginResult)
    //     // if (loginResult.status === 'success') {
    //     //   // await this.loggingIn(loginResult)
    //     //   this.alertToggle({ message: "You are logged in", isShow: true, type: "success" })
    //     //   this.$router.push("/")
    //     //
    //     //   this.isSignIn = this.$gAuth.isAuthorized
    //     // } else {
    //     //   this.signOutGoogle()
    //     //   this.alertToggle({ message: "No such user in system", isShow: true, type: "error" })
    //     // }
    //
    //   } catch (error) {
    //     console.log(error)
    //     //on fail do something
    //     this.alertToggle({ message: "No such user in system", isShow: true, type: "error" })
    //     return null
    //   }
    // },
    // async signOutGoogle() {
    //   try {
    //     await this.$gAuth.signOut()
    //     this.isSignIn = this.$gAuth.isAuthorized
    //     console.log("isSignIn", this.$gAuth.isAuthorized)
    //   } catch (error) {
    //     console.error(error)
    //   }
    // },
    async sendForm() {
      try {
        this.isAllFieldsError = false
        const result = await this.$axios.$post("/portal/auth", {
          ...this.form
        })
        this.login(result.clientToken)

        !!result.clientToken && !!this.getPreviousLink && this.getPreviousLink !== '/login' ?
            this.$router.push(this.getPreviousLink) :
            this.$router.push('/dashboard')

        this.alertToggle({ message: "You are logged in", isShow: true, type: "success" })
      } catch (err) {
        let message = err.message
        if (err.response && err.response.data) {
          message = err.response.data
        }
        this.alertToggle({ message, isShow: true, type: "error" })
      }
    },
    async loadSDK(d, s, id) {
      let js,
          fjs = d.getElementsByTagName(s)[0]
      console.log(fjs)
      console.log(d.getElementById(id))
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
    })
  },
  async mounted() {
    await this.loadSDK(document, "script", "googless")
  },
  computed: {
    ...mapGetters({
      getPreviousLink: 'getPreviousLink'
    })
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
