<template lang="pug">
  .container
    h2 Email
    input(v-model='form.logemail')
    h2 Password
    input(v-model='form.logpassword')
    button(@click='sendForm') Log In
    h2(v-if='isLogin') You are logged in!

</template>
<script>
export default {
  data() {
    return {
      form: {
        logemail: "",
        logpassword: ""
      },
      isLogin: false,      
    };
  },
  methods: {
    sendForm() {
      this.$http.post("/login", this.form).then(
        response => {
          this.isLogin = true;

          setTimeout(() => {
            this.$router.push("/");
          }, 1500);
        },
        err => {
          console.log("Errored : ");
          console.log(err);
        }
      );
    },  
  },
  computed: {},
  mounted() {},
  components: {}
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

</style>
