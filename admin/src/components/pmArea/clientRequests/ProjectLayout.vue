<template lang="pug">
  .client-req__layout
    .main-wrapper
      FormProject(:project="currentClientRequest")
      RequestTasksAndSteps(
        :originallyLanguages="originallyLanguages"
        :originallyUnits="originallyUnits"
        :originallySteps="originallySteps"
        :originallyServices="originallyServices"
      )
    .sub-wrapper
      ProjectSubInformation(:project="currentClientRequest")

</template>

<script>
import FormProject from "./subComponents/FormProject"
import { mapGetters, mapActions } from "vuex"
import ProjectSubInformation from "../ProjectSubInformation"
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
  components: {RequestTasksAndSteps, ProjectSubInformation, FormProject }
}
</script>

<style scoped lang="scss">
  .client-req {
    &__layout {
      margin: 30px;
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
