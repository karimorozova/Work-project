<template lang="pug">
  .zoho-code
    p.zoho-code__message Extracting code for generating token for ZOHO Api. Please wait...
<<<<<<< HEAD
=======
    p {{ result }}
>>>>>>> b0df725911eac6b1cf36c396233c3b78a850e099
</template>

<script>
	export default {
		data() {
			return {
<<<<<<< HEAD
				code: ""
=======
				code: "",
				result: ''
>>>>>>> b0df725911eac6b1cf36c396233c3b78a850e099
			}
		},
		methods: {
			async generateTokens() {
				try {
					const result = await this.$http.get(`/zoho/getTokens?code=${ this.code }`)
<<<<<<< HEAD
					this.$router.go(-1)
=======
					this.result = result.body.access_token
>>>>>>> b0df725911eac6b1cf36c396233c3b78a850e099
				} catch (err) {
					this.alertToggle({ message: err.data, isShow: true, type: "error" })
				}
			}
		},
		mounted() {
			this.code = this.$route.query.code
			this.generateTokens()
		}
	}
</script>

<style lang="scss" scoped>

  .zoho-code {
    padding: 40px;

    &__message {
      font-size: 20px;
    }
  }

</style>
