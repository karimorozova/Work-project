<template lang="pug">
  .login
    .login__main
      .login__logo
        img.login__image(src="../assets/images/new-logo.png")
      form.login__form(@submit.prevent="checkFields")
        .login__required-message(v-if="isAllFieldsError") All fields are required!
        .login__email
          input.login__input(v-model='form.logemail' placeholder='Email' :class="{'login_shadow': form.logemail}")
        .login__password
          input.login__input(type="password" v-model='form.logpassword' placeholder='Password' :class="{'login_shadow': form.logpassword}")
        .login__textrow
          .login__checkbox
            input.login__checkbox-input(type="checkbox")
            label.login__checkbox-label Remember me
          .login__fogotContainer
            nuxt-link.login__forgot(to="/forgot") Forgot Your Password?
        button.login__button(type="submit" :class="{'login_button-backgr': form.logemail && form.logpassword}") Sign In

</template>

<script>
	import { mapActions, mapGetters } from "vuex";

	export default {
		data() {
			return {
				form: {
					logemail: "",
					logpassword: ""
				},
				isAllFieldsError: false
			};
		},
		methods: {
			async checkFields() {
				if(!this.form.logemail || !this.form.logpassword) {
					return this.isAllFieldsError = true;
				}
				await this.sendForm();
			},
			async sendForm() {
				try {
					this.isAllFieldsError = false;
					const result = await this.$axios.$post("/portal/auth", {
						...this.form
					});
					this.login(result.clientToken);

					!!result.clientToken && !!this.getPreviousLink && this.getPreviousLink !== '/login' ?
							this.$router.push(this.getPreviousLink) :
							this.$router.push('/dashboard')

					this.alertToggle({ message: "You are logged in", isShow: true, type: "success" });
				} catch (err) {
					let message = err.message;
					if(err.response && err.response.data) {
						message = err.response.data;
					}
					this.alertToggle({ message, isShow: true, type: "error" });
				}
			},
			forget() {
				this.forgotLink = !this.forgotLink;
			},
			...mapActions({
				alertToggle: "alertToggle",
				login: "login",
			})
		},
		computed: {
			...mapGetters({
				getPreviousLink: 'getPreviousLink'
      })
		}
	};
</script>

<style lang="scss" scoped>
  @import "../assets/scss/colors.scss";

  .login {
    font-family: Myriad400;
    background-image: url("/assets/images/signin-background.jpg");
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-size: cover;

    &__textrow {
      display: flex;
      width: 100%;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    &__required-message {
      position: absolute;
      top: 12px;
      font-size: 16px;
      color: #d66f58;
    }

    &__main {
      position: absolute;
      margin-left: -250px;
      left: 50%;
      top: 50%;
      margin-top: -266px;
      width: 476px;
    }

    &__logo {
      display: flex;
      justify-content: center;
      margin-bottom: 10px;
    }

    &__form {
      position: relative;
      padding: 40px;
      width: 100%;
      background-color: #fff;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
    }

    &__warning {
      margin-bottom: 5px;
      padding-top: 5px;
    }

    &__warning-message {
      color: #ff0000;
      padding-left: 20px;
    }

    &__email,
    &__password {
      width: 100%;
      margin-bottom: 20px;
    }

    &__input {
      box-sizing: border-box;
      height: 40px;
      width: 100%;
      font-size: 18px;
      color: #66563d;
      padding-left: 10px;
      padding-right: 10px;
      border-radius: 4px;
      border: 2px solid #dedede;

      &::-webkit-input-placeholder {
        opacity: 0.38;
      }

      &:focus {
        border: 2px solid #dedede;
        box-shadow: inset 1px 2px 4px rgba(0, 0, 0, 0.01),
        0px 0px 6px rgba(0, 0, 0, 0.2);
        outline: none;
      }
    }

    &__checkbox {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      &-input {
        width: 14px;
        height: 14px;
      }

      &-label {
        font-size: 16px;
        color: #67573E;
        margin-left: 6px;
      }
    }

    &__button {
      width: 165px;
      height: 36px;
      border-radius: 4px;
      font-size: 18px;
      background-color: $green;
      color: $white;
      opacity: 0.5;
      outline: none;
      border: none;
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

    &__forgot {
      color: $green;
      font-size: 16px;
      cursor: pointer;
      align-self: flex-start;
      text-decoration: none;
      transition: .1s ease;

      &:hover {
        text-decoration: underline;
      }
    }

    &_shadow {
      box-shadow: inset 1px 2px 4px rgba(0, 0, 0, 0.01),
      0px 0px 6px rgba(0, 0, 0, 0.2);
    }

    &_button-backgr {
      opacity: 1;
    }
  }
</style>
