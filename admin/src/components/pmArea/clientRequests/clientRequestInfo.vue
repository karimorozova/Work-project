<template lang="pug">
  .layout(v-if="currentClientRequest._id")
    .content(v-if="currentClientRequest.status === 'Client Request'")
      FormLayoutCompliance
    .content(v-if="currentClientRequest.status === 'Request Approved'")
      RequestLayout
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import FormLayoutCompliance from "./FormLayoutCompliance"
	import RequestLayout from "./RequestLayout"

	export default {
		data() {
			return {
				clientRequest: {}
			}
		},
		methods: {
			...mapActions([ "setCurrentClientRequest" ]),
			async getClientRequest() {
				const { id } = this.$route.params
				try {
					const curClientRequest = await this.$http.post(`/clients-requests/by-id/${ id }`)
					this.setCurrentClientRequest(curClientRequest.data)
				} catch (err) {
				}
			}
		},
		computed: {
			...mapGetters({
				currentClientRequest: "getCurrentClientRequest"
			})
		},
		components: { RequestLayout, FormLayoutCompliance },
		created() {
			this.getClientRequest()
		},
		beforeDestroy() {
			this.setCurrentClientRequest({})
		}
	}
</script>

<style scoped lang="scss">

</style>
