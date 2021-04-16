<template lang="html">
  <div>
    <p>
      SING IN
    </p>
    <div id="google-signin-button"></div>

    <br>
    <a href="#" @click="signOut">Sign out</a>
    <br>
    <div @click="foo"> gET PROFILE INFO</div>
    <h4></h4>


  </div>
</template>

<script>

	export default {
		methods: {
			onSignIn(googleUser) {
				console.log('googleUser', googleUser)
				// Useful data for your client-side scripts:
				var profile = googleUser.getBasicProfile()
				console.log(profile)
				console.log("ID: " + profile.getId()) // Don't send this directly to your server!
				console.log('Full Name: ' + profile.getName())
				console.log('Given Name: ' + profile.getGivenName())
				console.log('Family Name: ' + profile.getFamilyName())
				console.log("Image URL: " + profile.getImageUrl())
				console.log("Email: " + profile.getEmail())

				// The ID token you need to pass to your backend:
				var id_token = googleUser.getAuthResponse().id_token
				console.log("ID Token: " + id_token)

        // const el = document.getElementsByTagName('h4')
        // el.innerHTML = "ID: " + profile.getId() + 'Full Name: ' + profile.getName() + 'Given Name: ' + profile.getGivenName() + 'Family Name: ' + profile.getFamilyName() + "Image URL: " + profile.getImageUrl() + "Email: " + profile.getEmail()
			},
			// foo(){
      //   this.$gAuth.signin2.render('google-signin-button', {
      //     onsuccess: this.onSignIn
      //   })
      // },
			signOut() {
				var auth2 = this.$gAuth.auth2.getAuthInstance()
				auth2.signOut().then(function () {
					console.log('User signed out.')
				})
			}

		},
    mounted() {
      this.$gAuth.signin2.render('google-signin-button', {
        onsuccess: this.onSignIn
      })
    },
		created() {
		}
	}
</script>

<style lang="scss" scoped>

</style>
