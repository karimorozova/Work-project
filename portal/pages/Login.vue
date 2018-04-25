<template lang="pug">
  .loginWrapper
    .imageWrapper
      img(src="../assets/images/login_logo.png")
    .h2Wrapper
      h2 Email
      input(v-model='form.logemail' placeholder='Email')
    .h2Wrapper
      h2 Password
      input(type="password" v-model='form.logpassword' placeholder='Password')
    .buttonWrapper
      button(@click='sendForm') Log In
      h2(v-if='isLogin') You are logged in!

</template>
<script>
import axios from 'axios';

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
      this.$axios.post("/auth", this.form).then(
        response => {
          let date = new Date();
          date.setDate(date.getSeconds() + 30)
          document.cookie =  "ses=" + response.data; + `;expires=${date}`;
          console.log(response);
          this.isLogin = true;

          setTimeout(() => {
            this.$router.push("/clients");
          }, 1500);
        },
        err => {
          alert("Bad credentials");
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
    background-image: url('/assets/images/image-background.jpg');
  }

  .loginWrapper {
    background-color: #fff;
    margin: 20% auto;
    width: 603px;
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

    .imageWrapper {
      position: absolute;
      top: 24%;
      left: 43%;
      img {
        width: 269px;
        height: 76px;
      }
    }

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
      height: 41px;
      width: 378px;
    }

    .buttonWrapper {
      display: flex;
      justify-content: center;
      margin: 7% 0 1.2% 0;
      padding-bottom: 5%;
        button {
          width: 142px;
          height: 35px;
          border-radius: 8px;
          font-size: 15px;
        }
    }
  }
</style>
