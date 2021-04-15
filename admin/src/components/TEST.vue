<template lang="html">
  <div>
    <meta name="google-signin-client_id" content="852042192934-p9rjqn11t4f38ele1soo143b9ju5mdcf.apps.googleusercontent.com">
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

        const el = document.getElementsByTagName('h4')
        el.innerHTML = "ID: " + profile.getId() + 'Full Name: ' + profile.getName() + 'Given Name: ' + profile.getGivenName() + 'Family Name: ' + profile.getFamilyName() + "Image URL: " + profile.getImageUrl() + "Email: " + profile.getEmail()
			},
			// foo(){
			// 	console.log('foo')
			// 	var auth2 = gapi.auth2.getAuthInstance()
			// 	if (auth2.isSignedIn.get()) {
			// 		var profile = auth2.currentUser.get().getBasicProfile();
			// 		console.log('full', profile)
			// 		console.log('ID: ' + profile.getId());
			// 		console.log('Full Name: ' + profile.getName());
			// 		console.log('Given Name: ' + profile.getGivenName());
			// 		console.log('Family Name: ' + profile.getFamilyName());
			// 		console.log('Image URL: ' + profile.getImageUrl());
			// 		console.log('Email: ' + profile.getEmail());
			// 	}
      // },
			signOut() {
				var auth2 = gapi.auth2.getAuthInstance()
				auth2.signOut().then(function () {
					console.log('User signed out.')
				})
			}

		},
    mounted() {
      gapi.signin2.render('google-signin-button', {
        onsuccess: this.onSignIn
      })
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
