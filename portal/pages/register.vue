<template lang="pug">
.registerMain
  .registerWrapper
    .imageWrapper
      img(src="../assets/images/new-logo.png")
    .registerForm
      .labelWrapper
        label.warningMessage(v-if="isRegisterWarning") Check your details
      .firstPair
        input.name(v-model="form.name" placeholder="Name")
        input.companyName(v-model="form.password" placeholder="Password")
        input.companyName(v-model="form.reapeat_password" placeholder="Repeat Password")
      .registerButton
        button(@click="sendForm" v-model="form.name, form.password, form.reapeat_password" 
        :class="{changeRegisterButton: form.name && form.password && form.reapeat_password}") Register
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: "",
        password: "",
        reapeat_password: ""
      },
      isRegisterWarning: false
      // isRegisterWarning: true
    };
  },
  methods: {
    sendForm() {}
  }
};
</script>

<style lang="scss">
body {
  background-image: url("/assets/images/image-background.jpg");
}

.registerWrapper {
  position: absolute;
  margin-left: -250px;
  left: 39%;
  top: 29%;
  padding: 0.3% 1% 1% 1%;
  margin: 0 auto;
  width: 436px;

  @media (max-width: 1855px) {
    left: 20%;
  }
  @media (max-width: 1370px) {
    left: 8%;
  }
  @media (max-width: 768px) {
    left: 6%;
    top: 33%;
    width: 662px;
  }
  @media (max-width: 450px) {
    left: 4.9%;
    top: 33%;
    width: 370px;
  }

  .imageWrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 2%;
    img {
      width: 269px;
      height: 76px;
    }
  }

  .registerForm {
    padding: 1%;
    margin: 0 auto;
    width: 436px;
    background-color: #fff;

    .labelWrapper {
      margin-bottom: 3%;
      .warningMessage {
        color: #ff0000;
        padding-left: 4.3%;
        font-size: 15px;
      }
    }

    input {
      width: 377px;
      height: 41px;
      font-size: 20px;
      color: #66563d;
      padding-left: 3%;
      border-radius: 4px;
      border: 2px solid #dedede;
      margin-bottom: 3%;
      margin-left: 4%;
      &::-webkit-input-placeholder {
        opacity: 0.38;
      }
      &::-moz-placeholder {
        opacity: 0.38;
      }
      &:-ms-input-placeholder {
        opacity: 0.38;
      }
      &:focus {
        box-shadow: 0 0 4px #66563d;
        outline: none;
      }
      @media (max-width: 768px) {
        width: 286px;
      }
      @media (max-width: 450px) {
        width: 159px;
        font-size: 16px;
      }
    }

    .firstPair {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .registerButton {
      display: flex;
      justify-content: center;
      margin-bottom: 3%;
      button {
        width: 142px;
        height: 35px;
        background-color: #84ca8e;
        color: #66563d;
        opacity: 0.4;
        border-radius: 4px;
        font-size: 20px;
      }
      .changeRegisterButton {
        opacity: 1;
        color: #fff;
      }
    }
  }
}
</style>