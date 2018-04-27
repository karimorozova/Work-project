<template lang="pug">
   .container
    .summaryTable(v-if="gotData")
      h1 Summary
      table.table.reportTable(border='bordered')
        tr
          th(v-for="datas in fromApi.header.columns") {{ datas.header }}
        tr(v-for="row in fromApi.rows")           
            td(v-for="rowVal in row.columns") {{ rowVal }}
    .loginWrapper(v-else)
      .h2Wrapper
        h2 Email
        input(v-model='form.logemail')
      .h2Wrapper
        h2 Password
        input(type="password" v-model='form.logpassword')
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
      gotData: false,
      isLogin: false,
      fromApi: [] 
    };
  },
  methods: {
    sendForm() {
      this.$axios.get(`/vendorJobs?email=${this.form.logemail}`).then(
        response => {
          this.fromApi = response.data;
          console.log(this.fromApi);
          this.gotData = true;
          // setTimeout(() => {
          //   this.$router.push("/project");
          // }, 1500);
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
  }

  .loginWrapper {
    background-color: #bfb3b3;
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
          font-size: 15px;
        }
    }
  }
</style>
