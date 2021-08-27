<template lang="pug">
  .details(v-if="clientRequests.length")
    ClientRequestTranslationCompleted(v-if="currentClientRequest.requestForm.service.title === 'Translation'" :isStartOption="false" :values="groupAllData()")
    ClientRequestCompleted(v-else :isStartOption="false" :values="groupAllData()")
</template>

<script>
	// import MainInfo from "./MainInfo"
	// import OtherInfo from "./OtherInfo"
	import { mapGetters } from "vuex"
  import ClientRequestCompleted from "../../../../components/completedOrder/clientRequestCompleted";
  import ClientRequestTranslationCompleted from "../../../../components/completedOrder/clientRequestTranslationCompleted";
  import moment from "moment";

	export default {
		data() {
			return {}
		},
		methods: {
      customFormatter(date) {
        return moment(date).format('DD-MM-YYYY, HH:mm')
      },
      groupAllData() {
        return {
          currentProjectName: this.currentClientRequest.projectName,
          currentDeadline: this.customFormatter(this.currentClientRequest.deadline),
          currentIndustries: this.currentClientRequest.industry,
          currentSourceLang: this.currentClientRequest.requestForm.sourceLanguage,
          currentTargetLang: this.currentClientRequest.requestForm.targetLanguages,
          currentService: this.currentClientRequest.requestForm.service.title,
          files: this.files,
          currentComplianceTemplate: this.currentClientRequest.requestForm.complianceOptions,
          currentBrief: this.currentClientRequest.brief,

        }
      },
		},
		computed: {
			...mapGetters({
        clientRequests: "getClientRequests",
			}),
      currentClientRequest() {
        const { id } = this.$route.params
        return this.clientRequests.find(({_id}) => id === _id)
      },
      files() {
        const sourceFiles = this.currentClientRequest.requestForm.sourceFiles
        const refFiles = this.currentClientRequest.requestForm.refFiles
        return [
          ...Array.from(sourceFiles).map(item => ({ type: 'Source', name: item.filename })),
          ...Array.from(refFiles).map(item => ({ type: 'Reference', name: item.filename }))
        ]
      },
			// ...mapGetters({
			// 	project: "getSelectedProject",
			// 	allProjects: "getAllProjects",
			// 	allRequests: "getAllRequests"
			// }),
			// title() {
			// 	let result = "Quote Details"
			// 	let statuses = ['Quote sent', 'Requested']
			// 	if (statuses.indexOf(this.project.status) === -1) {
			// 		result = 'Project Details'
			// 	}
			// 	return result
			// }
		},
		components: {
      ClientRequestCompleted,
      ClientRequestTranslationCompleted,
			// MainInfo,
			// OtherInfo
		},
		mounted() {
			// this.getProjectInfo()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .details {
    color: $main-color;
    width: 100%;
    box-sizing: border-box;
    width: 1040px;

    &__data {
      box-sizing: border-box;
      box-shadow: rgba(103, 87, 62, .3) 0px 2px 5px, rgba(103, 87, 62, .15) 0px 2px 6px 2px;
    }

    &__header {
      padding: 20px;
      border-bottom: 1px solid $light-brown;
    }

    &__title {
      margin: 30px 0 10px;
      font-size: 20px;
    }

    &__info {
      display: flex;
      height: 100%;
    }

    &__main {
      width: 72%;
    }

    &__describe {
      width: 28%;
      background-color: #f4f2f1;
    }
  }

</style>
