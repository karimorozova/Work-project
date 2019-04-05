<template lang="pug">
  .login
    .login__main(v-if="forgotLink")
      .login__logo
        img.login__image(src="../assets/images/new-logo.png")
      form.login__form(@submit.prevent="sendForm")
        .login__warning
          label.login__warning-message(v-if="isLoginWarning") Check your email or password
        .login__email
          input.login__input(v-model='form.logemail' placeholder='Email' :class="{'login_shadow': form.logemail}")
        .login__password
          input.login__input(type="password" v-model='form.logpassword' placeholder='Password' :class="{'login_shadow': form.logpassword}")
        .login__checkbox
          input.login__checkbox-input(type="checkbox")
          label.login__checkbox-label Remember me
        button.login__button(type="submit" :class="{'login_button-backgr': form.logemail && form.logpassword}") Sign In
        span.login__forgot(@click="forget") Forgot Your Password?
    passwordrestore(@loginVisible="forget" v-else )
</template>
<script>

  // import axios from "axios";
  import PasswordRestore from '../components/PasswordRestore';
  import { mapActions } from "vuex";

  export default {
    data() {
      return {
        form: {
          logemail: "",
          logpassword: ""
        },
        isLogin: false,
        isLoginWarning: false,
        forgotLink: true
      };
    },
    methods: {
      async sendForm() {
        try {
          const result = await this.$axios.$post("/portal/auth", { ...this.form});
          // console.log('result: ', result);
          this.setProjects(result.projects);
          this.login(result.jsession);
          this.$router.push("/dashboard");
          this.alertToggle({message: "You are logged in", isShow: true, type: "success"});
        } catch(err) {
          console.log(err);
          this.alertToggle({message: err.response.data, isShow: true, type: "error"});
        }
      },
      forget(){
        this.forgotLink = !this.forgotLink;
      },
      ...mapActions({
        alertToggle: "alertToggle",
        login: "login",
        setProjects: "projects"
      })
    },
    components: {
      "passwordrestore": PasswordRestore
    }
  };
</script>

<style lang="scss" scoped>
  @font-face {
    font-family: MyriadPro;
    src: url('/assets/fonts/MyriadPro-Regular.otf');
  }
  .login {
    font-family: MyriadPro;
    background-image: url("/assets/images/signin-background.jpg");
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    &__main {
      position: absolute;
      margin-left: -250px;
      left: 50%;
      top: 50%;
      margin-top: -266px;
      width: 436px;
    }
    &__logo {
      display: flex;
      justify-content: center;
      margin-bottom: 10px;
    }
    &__image {
      width: 269px;
      height: 76px;
    }
    &__form {
      padding: 10px;
      width: 100%;
      background-color: #fff;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
    }
    &__warning {
      margin-bottom: 5px;
      padding-top: 5px;
    }
    &__warning-message {
      color: #ff0000;
      padding-left: 20px;
    }
    &__email, &__password {
      width: 85%;
      margin: 10px 0;
    }
    &__input {
      font-family: MyriadPro;
      box-sizing: border-box;
      margin-top: 20px;
      height: 41px;
      width: 100%;
      font-size: 20px;
      color: #66563d;
      padding-left: 10px;
      padding-right: 10px;
      border-radius: 8px;
      border: 2px solid #dedede;
      &::-webkit-input-placeholder {
        opacity:0.38;
      }
      &:focus {
        box-shadow: 0 0 4px #66563D;
        outline: none;
      }
    }
    &__checkbox {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      &-input {
        width: 13px;
        height: 13px;
        margin-left: 30px;
      }
      &-label {
        font-size: 15px;
        color: #2d2d2d;
        margin-left: 5px;
      }
    }
    &__button {
      width: 142px;
      height: 35px;
      border-radius: 8px;
      font-size: 20px;
      background-color: #4BA5A5;
      color: #66563d;
      opacity: 0.22;
    }
    &__forgot {
      color: #4280d3;
      font-size: 20px;
      margin: 10px 0;
      cursor: pointer;
      align-self: flex-start;
      padding-left: 30px;
    }
    &_shadow {
      box-shadow: 0 0 10px #66563d;
    }
    &_button-backgr {
      opacity: 1;
      color: #fff;
    }
  }

</style>
