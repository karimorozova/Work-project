<template lang="pug">
.restore
    form.restore__form(@submit.prevent="send" v-if="isForm")
        .restore__data
            label.restore__comment Enter your email to get the instructions:
            input.restore__email(v-model='email' placeholder='Enter your email' )
        .restore__buttons
            router-link.restore__back(to="/login") Back
            button.restore__send(type="submit" :class="{'restore_opacity-1': email}") Send
    .restore__errors(v-if="isError")
        ValidationErrors(:errors="errors" @closeErrors="closeErrors" isAbsolute)
    .restore__success(v-if="!isForm")
        .restore__message Thank you. Please, check your email and follow instructions.
        .restore__buttons
            router-link.restore__back(to="/login") Back to login page
</template>

<script>
import ValidationErrors from "@/components/ValidationErrors";
import { mapActions } from "vuex";

export default {
  data() {
    return {
        isForm: true,
        email: "",
        isError: false,
        errors: []
    };
  },
  methods: {
    ...mapActions(["alertToggle"]),
    async send() {
        this.errors = [];
        const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if(!this.email || !regex.test(this.email)) {
            this.errors = ["Please, enter valid email address"];
            return this.isError = true;
        }
        try {
            await this.$axios.post('/vendor/reset-pass', {email: this.email});
            this.isForm = false;
        } catch(err) { 
            this.alertToggle({message: err.response.data, isShow: true, type: "error"});
        }
    },
    closeErrors() {
        this.isError = false;
    }
  },
  components: {
      ValidationErrors
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.restore {
  background-image: url("../assets/images/signin-background.jpg");
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  &__form {
    position: absolute;
    margin-left: -250px;
    left: 50%;
    top: 60%;
    margin-top: -266px;
    width: 476px;
    padding: 20px;
    box-sizing: border-box;
    background-color: $white;
  }
  &__data {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }
  &__comment {
      font-size: 22px;
      color: $main-color;
  }
  &__email {
    height: 41px;
    width: 376px;
    font-size: 20px;
    color: $main-color;
    padding: 0 10px;
    box-sizing: border-box;
    border-radius: 8px;
    border: 2px solid #dedede;
    margin-top: 15px;
    &::-webkit-input-placeholder {
        opacity: 0.4;
    }
    &:focus {
        box-shadow: 0 0 4px $deep-brown;
        outline: none;
    }
  }
  &__buttons {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  &__send {
    width: 142px;
    height: 35px;
    border-radius: 8px;
    font-size: 20px;
    background-color: $green;
    color: $white;
    opacity: 0.5;
  }
  &__back {
    color: #4280d3;
    font-size: 20px;
  }
  &__success {
    background-color: $white;
    padding: 20px;
    box-sizing: border-box;
    color: $main-color;
  }
  &__message {
    font-size: 20px;
  }
  &_opacity-1 {
      opacity: 1;
  }
}

</style>
