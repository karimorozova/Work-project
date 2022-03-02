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
	import ValidationErrors from "../components/general/ValidationErrors";
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
					await this.$axios.post('/vendor/reset-pass', { email: this.email });
					this.isForm = false;
				} catch (err) {
					this.alertToggle({ message: err.response.data, isShow: true, type: "error" });
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
      padding: 40px;
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
      font-size: 18px;
    }

    &__email {
      height: 40px;
      width: 100%;
      font-size: 18px;
      padding: 0 10px;
      box-sizing: border-box;
      border-radius: 4px;
      border: 2px solid #dedede;
      margin-top: 20px;

      &::-webkit-input-placeholder {
        opacity: 0.4;
      }

      &:focus {
        border: 2px solid #dedede;
        box-shadow: inset 1px 2px 4px rgba(0, 0, 0, 0.01),
        0px 0px 6px rgba(0, 0, 0, 0.2);
        outline: none;
      }
    }

    &__buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__send {
      width: 165px;
      height: 36px;
      border-radius: 4px;
      font-size: 18px;
      background-color: #4BA5A5;
      color: #fff;
      border: none;
      opacity: 0.5;
      outline: none;
      transition: .1s ease;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);

      &:active {
        transform: scale(.98);
      }

      &:hover {
        cursor: pointer;
        box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.14), 0 1px 7px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -1px rgba(0, 0, 0, 0.2);
      }
    }

    &__back {
      color: $green;
      font-size: 16px;
      text-decoration: none;
      transition: .1s ease;


      &:hover {
        text-decoration: underline;
      }
    }

    &__success {
      background-color: $white;
      padding: 40px;
      box-sizing: border-box;
    }

    &__message {
      font-size: 18px;
      margin-bottom: 20px;
    }

    &_opacity-1 {
      opacity: 1;
    }
  }

</style>
