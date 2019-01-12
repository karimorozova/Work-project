<template lang="pug">
  .loginMain
    .loginWrapper(v-if="forgotLink")
      .imageWrapper
        img(src="../assets/images/new-logo.png")
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
      this.$axios.post("/portal/auth", this.form).then(
        response => {
          console.log(response);
          document.cookie = "ses=" + response.data.jsessionId + "; max-age=3600;" + "domain=pangea.global";
          this.isLogin = true;
          window.location.href = "/main";
        },
        err => {
          alert("Bad credentials");
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
  mounted() {},
  components: {
    "passwordrestore": PasswordRestore
  }
};
</script>

<style lang="scss">
@import "../assets/styles/index.scss";

</style>
