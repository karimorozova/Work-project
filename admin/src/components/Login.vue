<template lang="pug">
  //- .container
  //-   h2 Email
  //-   input(v-model='form.logemail')
  //-   h2 Password
  //-   input(v-model='form.logpassword')
  //-   button(@click='sendForm') Log In
  //-   h2(v-if='isLogin') You are logged in!
  .loginMain
    .loginWrapper(v-if="forgotLink")
      .imageWrapper
        img(src="../assets/images/login_logo.png")
      .loginForm
        .labelWrapper
          label.warningMessage(v-if="isLoginWarning") Check your email or password
        .h2Wrapper
          input.email(v-model='form.logemail' placeholder='Email' :class="{addShadow: form.logemail}")
        .h2Wrapper
          input.password(type="password" v-model='form.logpassword' placeholder='Password' :class="{addShadow: form.logpassword}")
        .checkboxWrapper
          input.checkboxWrapper__input(type="checkbox")
          label.checkboxWrapper__label Remember me
        .buttonWrapper
          button(@click='sendForm' v-model='form.logemail, form.logpassword' :class="{changeButtonView: form.logemail && form.logpassword}") Sign In
          h2(v-if='isLogin') You are logged in!
        .formFooter
          span.firstLabel(@click="forget") Forgot Your Password?
    passwordrestore(v-else)
</template>
<script>
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
      this.$http.post(__WEBPACK__API_URL__ + "/login", this.form).then(
        response => {
          document.cookie = "ses=" + response.data + "; max-age=36000;"; // + "domain=.pangea.global";
          this.isLogin = true;
          window.location.href = "/main";

          /*
          setTimeout(() => {
            this.$router.push("/");
          }, 1500); 
          */
        },
        err => {
          console.log("Errored : ");
          console.log(err);
        }
      );
    },
    forget(){
      this.forgotLink = !this.forgotLink;
    } 
  },
  computed: {},
  mounted() {
    console.log(__WEBPACK__API_URL__)
  },
  components: {
    "passwordrestore": PasswordRestore
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "../assets/scss/login.scss";
</style>
