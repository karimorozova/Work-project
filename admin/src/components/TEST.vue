<template lang="html">
  <div>
    <meta name="google-signin-client_id" content="852042192934-p9rjqn11t4f38ele1soo143b9ju5mdcf.apps.googleusercontent.com">
    <p>
      SING IN
    </p>
    <div class="g-signin2" data-onsuccess="onSignIn"></div>

    <script>
			function onSignIn(googleUser) {
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
			}
    </script>
    <br>
    <a href="#" @click="signOut">Sign out</a>

  </div>
</template>

<script>

	export default {
		methods: {
			signOut() {
				var auth2 = gapi.auth2.getAuthInstance()
				auth2.signOut().then(function () {
					console.log('User signed out.')
				})
			}
		},
		created() {
			const scripts = [
				"https://apis.google.com/js/platform.js"
			]
			scripts.forEach(script => {
				let tag = document.createElement("script")
				tag.setAttribute("src", script)
				document.head.appendChild(tag)
			})
		}
	}
</script>

<style lang="scss" scoped>

</style>