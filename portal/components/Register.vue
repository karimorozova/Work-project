<template lang="pug">
  .registerMain
    .labelWrapper
        label.warningMessage(v-if="isRegisterWarning") Check your details
    .registerForm(v-if="isShowRegisterForm")
        .firstPair
            input.name(v-model="form.name" placeholder="Name")
            input.companyName(v-model="form.companyName" placeholder="Company Name")
        .secondPair
            input.email(v-model="form.email" placeholder="Email")
            input.skypeName(v-model="form.skypeName" placeholder="Skype Name")
        .thirdPair
            input.website(v-model="form.website" placeholder="Website")
            input.phoneNumber(v-model="form.phoneNumber" placeholder="Phone Number")
        .registerButton
            button(@click="sendForm" v-model="form.name, form.companyName, form.email, form.skypeName, form.website, form.phoneNumber" 
            :class="{changeRegisterButton: form.name && form.companyName && form.email && form.skypeName && form.skypeName && form.website && form.phoneNumber}") Register
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: "",
        email: "",
        website: "",
        companyName: "",
        skypeName: "",
        phoneNumber: ""
      },
    //   isRegisterWarning: false
      isRegisterWarning: true,
      isShowRegisterForm: true
    //   isShowRegisterForm: false
    };
  },
  methods: {
      sendForm(){

      }
  }
};
</script>

<style lang="scss">
    .registerMain {
        position: absolute;
        margin-left: -250px;
        left: 30%;
        top: 37%;
        padding: 0.3% 1% 1% 1%;
        margin: 0 auto;
        width: 840px;
        background-color: #fff;

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

        .labelWrapper {
            margin-bottom: 1%;
            .warningMessage {
                color: #ff0000;
                padding-left: 0.3%;
                font-size: 15px;
      }
    }

        input {
            width: 356px;
            height: 41px;
            font-size: 20px;
            color: #66563d;
            padding-left: 3%;
            border-radius: 8px;
            border: 2px solid #dedede;
            margin-bottom: 3%;
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
            justify-content: space-between;
        }
        .secondPair {
            display: flex;
            justify-content: space-between;
        }
        .thirdPair {
            display: flex;
            justify-content: space-between;
        }

        .registerButton {
            display: flex;
            justify-content: center;
            button {
                width: 142px;
                height: 35px;
                background-color: #84ca8e;
                color: #66563d;
                opacity: 0.4;
                border-radius: 8px;
                font-size: 20px;
            }
            .changeRegisterButton {
                opacity: 1;
                color: #fff;
            }
        }
    }
</style>