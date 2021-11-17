<template lang="pug">
  .test
    .details(v-if="clientRequest.hasOwnProperty('requestForm')")
      //ClientRequestTranslationCompleted(v-if="clientRequest.requestForm.service.title === 'Translation'" :isStartOption="false" :values="groupAllData()")
      //ClientRequestTranslationCompleted(v-if="clientRequest.requestForm.service.title === 'Translation'" :isStartOption="false" :values="groupAllData()")
      ClientRequestCompleted(:isStartOption="false" :values="groupAllData()")
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
			return {
        clientRequest: {}
      }
		},
		methods: {
      customFormatter(date) {
        return moment(date).format('DD-MM-YYYY, HH:mm')
      },
      groupAllData() {
        console.log({ currentService: this.clientRequest.requestForm.service.title })
        return {
          currentProjectName: this.clientRequest.projectName,
          currentDeadline: this.customFormatter(this.clientRequest.deadline),
          currentIndustries: this.clientRequest.industry,
          currentSourceLang: this.clientRequest.requestForm.sourceLanguage,
          currentTargetLang: this.clientRequest.requestForm.targetLanguages,
          currentService: this.clientRequest.requestForm.service.title,
          selectedInstructions: this.clientRequest.instructions,
          files: this.files,
          // currentComplianceTemplate: this.clientRequest.?requestForm.complianceOptions,
          // currentBrief: this.clientRequest.brief,

        }
      },
      async currentClientRequest() {
        const { id } = this.$route.params
        const { requests } = (await this.$axios.get('/portal/client-requests/' + id + '?token=' + this.token)).data
        this.clientRequest = JSON.parse(window.atob(requests))
      },
		},
		computed: {
			...mapGetters({
        // clientRequests: "getClientRequests",
        token: "getToken"
			}),
      files() {
        const sourceFiles = this.clientRequest.requestForm.sourceFiles
        const refFiles = this.clientRequest.requestForm.refFiles
        return [
          ...Array.from(sourceFiles).map(item => ({ type: 'Source', name: item.filename, path: item.path })),
          ...Array.from(refFiles).map(item => ({ type: 'Reference', name: item.filename, path: item.path  }))
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
		created() {
			this.currentClientRequest()
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
