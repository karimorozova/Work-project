<template lang="html">
  <div>
    <p>
      SING IN
    </p>
    <div id="google-signin-button"></div>

    <br>
    <a href="#" @click="signOut">Sign out</a>
    <br>
    <div @click="onSignIn"> sign in with google</div>
    <h4></h4>


  </div>
</template>

<script>

	import {mapActions} from "vuex";

  export default {
		methods: {

      ...mapActions({
        alertToggle: "alertToggle",
        loggingIn: "login",
        loggingOut: "logout"
      }),
      async onSignIn() {
        try {
          const googleUser = await this.$gAuth.signIn();
          if (!googleUser) {
            return null;
          }
          console.log("googleUser", googleUser);
          console.log("getId", googleUser.getId());
          console.log("getBasicProfile", googleUser.getBasicProfile());
          console.log("getAuthResponse", googleUser.getAuthResponse());
          console.log(
            "getAuthResponse",
            this.$gAuth.GoogleAuth.currentUser.get().getAuthResponse()
          );


          this.isAllFieldsError = false;
          const loginResult = await this.$http.post('/login-with-google', {idToken: googleUser.getAuthResponse().id_token});
          await this.loggingIn(loginResult.body);
          this.alertToggle({ message: "You are logged in", isShow: true, type: "success" });
          this.$router.push("/")

          this.isSignIn = this.$gAuth.isAuthorized;
        } catch (error) {
          //on fail do something
          console.error(error);
          return null;
        }
      },
      async signOut() {
        try {
          await this.$gAuth.signOut();
          this.isSignIn = this.$gAuth.isAuthorized;
          console.log("isSignIn", this.$gAuth.isAuthorized);
        } catch (error) {
          console.error(error);
        }
      },


		},
    created() {
      let that = this;
      let checkGauthLoad = setInterval(function () {
        that.isInit = that.$gAuth.isInit;
        that.isSignIn = that.$gAuth.isAuthorized;
        if (that.isInit) clearInterval(checkGauthLoad);
      }, 1000);
    }
  }
</script>

<style lang="scss" scoped>

</style>
