<template lang="pug">
  .layout(v-if="currentClientRequest._id")
    .content(v-if="currentClientRequest.status === 'Client Request'")
      RequestLayoutAM
    .content(v-if="currentClientRequest.status === 'Request Approved'")
      RequestLayoutPM
    .content(v-if="currentClientRequest.status === 'Closed'")
      RequestLayoutClosed

</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import RequestLayoutAM from "./RequestLayoutAM"
	import RequestLayoutPM from "./RequestLayoutPM"
	import RequestLayoutClosed from "./RequestLayoutClosed"

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
		components: { RequestLayoutClosed, RequestLayoutAM, RequestLayoutPM },
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
