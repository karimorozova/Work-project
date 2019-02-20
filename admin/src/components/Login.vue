<template lang="pug">
  .login-main
    .login-main__forgot(v-if="forgotLink")
      .login-main__image
        img(src="../assets/images/new-logo.png")
      .login-main__form
        .login-main__warning
          label.login-main__message(v-if="isLoginWarning") Check your email or password
        .login-main__item
          input.login-main__email(v-model='form.logemail' placeholder='Email' :class="{addShadow: form.logemail}")
        .login-main__item
          input.login-main__password(type="password" v-model='form.logpassword' placeholder='Password' :class="{addShadow: form.logpassword}")
        .login-main__check-wrap
          input.login-main__check-input(type="checkbox")
          label.login-main__check-label Remember me
        button.login-main__button(@click='login' v-model='form.logemail, form.logpassword' :class="{'login-main_full-opacity': form.logemail && form.logpassword}") Sign In
        .login-main__footer
          span.login-main__footer-text(@click="forget") Forgot Your Password?
    passwordrestore(v-else)
</template>
<script>
import PasswordRestore from '../components/PasswordRestore';
import { mapGetters, mapActions } from "vuex";

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
    async login() {
      try {
      const loginResult = await this.$http.post('/login', this.form); 
      await this.loggingIn(loginResult.body);
      this.alertToggle({message: "You are logged in", isShow: true, type: "success"})
      this.$router.push("/")
      } catch(err) {
        this.alertToggle({message: err.body, isShow: true, type: "error"});
      }
    },
    async logout() {
      try {
        await this.loggingOut();
        this.$router.push("/login");
      } catch(err) {
        this.alertToggle({message: "Cannot log out", isShow: true, type: "error"})
      }
    },
    forget(){
      this.forgotLink = !this.forgotLink;
    },
    ...mapActions({
      alertToggle: "alertToggle",
      loggingIn: "login",
      loggingOut: "logout"
    })
  },
  components: {
    "passwordrestore": PasswordRestore
  }
};
</script>

<style lang="scss" scoped>

  .login-main {
    background-image: url('../assets/images/image-background.jpg');
    height: 100vh;
    overflow: hidden;
  }

  .login-main__forgot {
      position: absolute;
      margin-left: -250px;
      left: 50%;
      top: 50%;
      margin-top: -266px;
      width: 436px;
  
      border-radius: 26px;
  
      .login-main__image {
        display: flex;
        justify-content: center;
        margin-bottom: 2%;
        img {
          width: 269px;
          height: 76px;
        }
      }
  
    .login-main__form {
      padding: 1%;
      margin: 0 auto;
      width: 436px;
      background-color: #fff;
  
      .login-main__warning {
        margin-bottom: -3%;
        padding-top: 1%;
        .login-main__message {
          color: #ff0000;
          padding-left: 7.3%;
        }
      }
  
      .login-main__item {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
  
      input {
        height: 41px;
        width: 356px;
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
  
      .addShadow {
        box-shadow: 0 0 10px #66563d;
      }
  
      .login-main__email {
        margin-top: 5.5%;
        margin-bottom: 5.5%;
      }
  
      .login-main__password {
        margin-top: 0;
        margin-bottom: 2.5%;
      }
  
      .login-main__check-wrap {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        .login-main__check-input {
          width: 13px;
          height: 13px;
          margin-left: 7%;
        }
        .login-main__check-label {
          font-size: 15px;
          color: #2d2d2d;
          margin-left: 2%;
        }
      }
  
      .login-main__button {
        display: flex;
        justify-content: center;
        margin: 10px auto;
        width: 142px;
        height: 35px;
        border-radius: 8px;
        font-size: 20px;
        background-color: #84ca8e;
        color: #66563d;
        opacity: 0.22; 
      }
      
      .login-main_full-opacity {
        opacity: 1;
        color: #fff;
      }
  
      .login-main__footer {
        display: flex;
        justify-content: space-between;
        font-size: 20px;
        .login-main__footer-text {
          color: #4280d3;
          padding-left: 6%;
          margin-bottom: 4%;
          cursor: pointer;
        }
      }
    }
  
    @media (max-width: 625px) {
      width: 450px;
    }
    @media (max-width: 560px) {
      width: 350px;
    }
    @media (max-width: 374px) {
      width: 300px;
    }
  
    border-radius: 26px;
  }
</style>
