<template lang="pug">
  .layout(v-if="currentClientRequest._id")
    .content(v-if="currentClientRequest.status === 'Client Request'")
      FormLayoutCompliance
    .content(v-if="currentClientRequest.status === 'Request Approved'")
      ProjectLayout
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import FormLayoutCompliance from "./FormLayoutCompliance"
	import ProjectLayout from "./ProjectLayout"

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
		components: { ProjectLayout, FormLayoutCompliance },
		created() {
			this.getClientRequest()
		}
	}
</script>

<style scoped lang="scss">

</style>
