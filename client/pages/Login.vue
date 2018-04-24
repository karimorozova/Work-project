<template lang="pug">
  .loginWrapper
    .h2Wrapper
      h2 Email
      input(v-model='form.logemail')
    .h2Wrapper
      h2 Password
      input(v-model='form.logpassword')
    .buttonWrapper
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

<style lang="scss">
  body {
    margin: 0;
    overflow-y: hidden;
  }

  .loginWrapper {
    background-color: #bfb3b3;
    margin: 20% auto;
    width: 350px;
    @media (max-width: 374px) {
      width: 300px;
    }

    border-radius: 26px;

    .h2Wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    h2 {
      color: #fff;
      margin: 3%;
    }

    input {
      height: 26px;
      width: 70%;
    }

    .buttonWrapper {
      display: flex;
      justify-content: center;
      margin: 7% 0 1.2% 0;
      padding-bottom: 5%;
        button {
          width: 37%;
          height: 38px;
          border-radius: 8px;
        }
    }
  }
</style>
