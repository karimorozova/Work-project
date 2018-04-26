<template lang="pug">
  .loginMain
    .loginWrapper
      .imageWrapper
        img(src="../assets/images/login_logo.png")
      .formWrapper
        .h2Wrapper
          input.email(v-model='form.logemail' placeholder='Email')
        .h2Wrapper
          input.password(type="password" v-model='form.logpassword' placeholder='Password')
        .checkboxWrapper
          input.checkboxWrapper__input(type="checkbox")
          label.checkboxWrapper__label Remember me
        .buttonWrapper
          button(@click='sendForm') Sign In
          h2(v-if='isLogin') You are logged in!
        .formFooter
          label.firstLabel Forgot Your Password?
          label.secondLabel Register

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
          document.cookie =  "ses=" + response.data + `;max-age=60`;
          console.log(response);
          this.isLogin = true;
          window.location.replace("http://localhost:3000/");
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
    background-image: url('/assets/images/image-background.jpg');
  }

  .loginWrapper {
    position: absolute;
    margin-left: -250px;
    left: 50%;
    top: 50%;
    margin-top: -266px;

    .formWrapper {
      background-color: #fff;
    }
    
    // margin: auto;
    width: 436px;
    height: 266px;

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
      display: flex;
      justify-content: center;
      margin-bottom: 2%;
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
      width: 356px;
      font-size: 20px;
      color: #66563d;
      padding-left: 3%;
      opacity: 0.38;
      border-radius: 8px;
      border: 2px solid #DEDEDE;
    }

    .email {
      margin-top: 3.5%;
      margin-bottom: 5.5%;
    }

    .password {
      margin-top: 0;
      margin-bottom: 2.5%;
    }

    .checkboxWrapper {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      .checkboxWrapper__input {
        width: 13px;
        height: 13px;
        margin-left: 7%;
      }
      .checkboxWrapper__label {
        font-size: 15px;
        color: #2d2d2d;
        margin-left: 2%;
      }
    }

    .buttonWrapper {
      display: flex;
      justify-content: center;
      margin: 2% 0 0.2% 0;
      padding-bottom: 3%;
        button {
          width: 142px;
          height: 35px;
          border-radius: 8px;
          font-size: 20px;
          background-color: #84ca8e;
          color: #fff;
        }
    }

    .formFooter {
      display: flex;
      justify-content: space-between;
      font-size: 20px;
      .firstLabel {
        color: #4280d3;
        padding-left: 6%;
        margin-bottom: 4%;
      }
      .secondLabel {
        color: #66563d;
        padding-right: 8%;
        margin-bottom: 4%;
      }
    }
  }
</style>
