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

</template>

<script>
import Request from "./subComponents/Request"
import { mapGetters, mapActions } from "vuex"
import RequestSubInformation from "./subComponents/RequestSubInformation"
import RequestTasksAndSteps from "./RequestTasksAndSteps";

export default {
  data(){
    return {
      clientRequest: {}
    }
  },
	methods: {
		showErrors() {

		},
		setDate(){

    },

	},
  computed: {
    ...mapGetters({
      currentClientRequest: "getCurrentClientRequest",
	    originallyLanguages: 'getAllLanguages',
	    originallySteps: 'getAllSteps',
	    originallyServices: "getAllServices",
	    originallyUnits: "getAllUnits",
    }),
  },
  components: {RequestTasksAndSteps, RequestSubInformation, Request }
}
</script>

<style scoped lang="scss">
  .client-req {
    &__layout {
      margin: 40px;
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
