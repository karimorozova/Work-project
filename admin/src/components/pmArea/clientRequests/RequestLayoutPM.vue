<template lang="pug">
  .client-req__layout
    .main-wrapper
      Request(:project="currentClientRequest")
      RequestTasksAndSteps(
        :originallyLanguages="originallyLanguages"
        :originallyUnits="originallyUnits"
        :originallySteps="originallySteps"
        :originallyServices="originallyServices"
      )
    .sub-wrapper
      RequestSubInformation(:project="currentClientRequest")
      RequestAction(:project="currentClientRequest")

</template>

<script>
	import Request from "./subComponents/Request"
	import { mapGetters, mapActions } from "vuex"
	import RequestSubInformation from "./subComponents/RequestSubInformation"
	import RequestTasksAndSteps from "./RequestTasksAndSteps"
	import RequestAction from "./subComponents/RequestAction"

	export default {
		data() {
			return {}
		},
		methods: {
			showErrors() {

			},
			setDate() {

			}

		},
		computed: {
			...mapGetters({
				currentClientRequest: "getCurrentClientRequest",
				originallyLanguages: 'getAllLanguages',
				originallySteps: 'getAllSteps',
				originallyServices: "getAllServices",
				originallyUnits: "getAllUnits"
			})
		},
		components: { RequestAction, RequestTasksAndSteps, RequestSubInformation, Request }
	}
</script>

<style scoped lang="scss">
  .client-req {
    &__layout {
      margin: 50px;
      display: flex;
    }
  }

  .main-wrapper {
  }

  .sub-wrapper {
    margin-left: 40px;
    padding-right: 40px;
  }

</style>
