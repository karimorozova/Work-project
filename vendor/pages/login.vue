<template lang="pug">
  .login
    .login__main(v-if="forgotLink")
      .login__logo
        img(src="../assets/images/login_logo.png")
      .login__form
        .login__warning
          label.login__warning-message(v-if="isLoginWarning") Check your email or password
        .login__email
          input.login__input(v-model='form.logemail' placeholder='Email' :class="{'add-shadow': form.logemail}")
        .login__password
          input.login__input(type="password" v-model='form.logpassword' placeholder='Password' :class="{'add-shadow': form.logpassword}")
        .login__checkbox
          input.login__checkbox-input(type="checkbox")
          label.login__checkbox-label Remember me
        button.login__button(@click='sendForm' v-model='form.logemail, form.logpassword' :class="{'button-backgr': form.logemail && form.logpassword}") Sign In
          h2(v-if='isLogin') You are logged in!
        span.login__forgot(@click="forget") Forgot Your Password?
    passwordrestore(v-else)
</template>
<script>
import axios from "axios";
import PasswordRestore from '../components/PasswordRestore';
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
    sendForm() {

    },
    forget(){
      this.forgotLink = !this.forgotLink;
    }
  },
  computed: {},
  mounted() {},
  components: {
    "passwordrestore": PasswordRestore
  }
};
</script>

<style lang="scss">
body {
  background-image: url("/assets/images/image-background.jpg");
}

.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 95vh;
}

.login__main {
    width: 23%;
    border-radius: 26px;
    .login__logo {
      display: flex;
      justify-content: center;
      margin-bottom: 2%;
      img {
        width: 269px;
        height: 76px;
      }
    }

  .login__form {
    padding: 10px;
    width: 100%;
    background-color: #fff;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    .login__warning {
      margin-bottom: -3%;
      padding-top: 1%;
      .login__warning-message {
        color: #ff0000;
        padding-left: 7.3%;
      }
    }

    .login__email, .login__password {
      width: 85%;
      margin: 10px 0;
    }

    .login__input {
      margin-top: 20px;
      height: 41px;
      width: 97%;
      font-size: 20px;
      color: #66563d;
      padding-left: 3%;
      border-radius: 8px;
      border: 2px solid #dedede;
      &::-webkit-input-placeholder {
        opacity:0.38;
        }
      &::-moz-placeholder {
        opacity:0.38;
        }
      &:-ms-input-placeholder {
        opacity:0.38;
        }
      &:focus {
        box-shadow: 0 0 4px #66563D;
        outline: none;
      }
    }

    .add-shadow {
      box-shadow: 0 0 10px #66563d;
    }

    .login__checkbox {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      &-input {
        width: 13px;
        height: 13px;
        margin-left: 7%;
      }
      &-label {
        font-size: 15px;
        color: #2d2d2d;
        margin-left: 2%;
      }
    }
    .login__button {
      width: 142px;
      height: 35px;
      border-radius: 8px;
      font-size: 20px;
      background-color: #84ca8e;
      color: #66563d;
      opacity: 0.22;
    }
    .button-backgr {
      opacity: 1;
      color: #fff;
    }
    .login__forgot {
      color: #4280d3;
      font-size: 20px;
      margin: 10px 0;
      cursor: pointer;
      align-self: flex-start;
      padding-left: 30px;
    }
  }
}
</style>
