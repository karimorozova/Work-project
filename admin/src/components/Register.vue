<template lang="pug">
  .container
    h2 Email
    input(v-model='form.email')
    h2 UserName
    input(v-model='form.userName')
    h2 Password
    input(v-model='form.password')
    h2 password Confirm
    input(v-model='form.passwordConf')
    button(@click='sendForm') Send

</template>
<script>
export default {
  data() {
    return {
      form: {
        email: "",
        userName: "",
        password: "",
        passwordConf: ""
      }
    };
  },
  methods: {
    sendForm() {
      this.$http.post("/register", this.form).then(
        response => {
          console.log(response)
        },
        err => {
          // error callback
          console.log(err)
        }
      );
    }
  },
  computed: {},
  mounted() {
    console.log(this);
  },
  components: {}
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

</style>
