<template lang="pug">
  .competencies
    //| {{ pendingCompetenciesData }}
    CandidateForm(
      v-if="isForm"
      :candidateFormData="candidateFormData"
      @closeModal="closeForm"
      @approve="approvePC"
    )
    .competencies__table
      SettingsTable(
        :fields="fields"
        :tableData="pendingCompetenciesData"
        :tbodyStyle="{'max-height': '256px'}",
        :rowCount="10"
      )
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .competencies__head-title {{ field.label }}

        template(slot="source", slot-scope="{ row, index }")
          .competencies__data {{ row.sourceLanguage.lang }}

        template(slot="targets", slot-scope="{ row, index }")
          .competencies__data {{ row.targetLanguage.lang }}

        template(slot="industry", slot-scope="{ row, index }")
          .competencies__data {{ row.industry.name }}

        template(slot="step", slot-scope="{ row, index }")
          .competencies__data {{ row.step.title }}

        template(slot="alertIcon", slot-scope="{ row, index }")
          .competencies__data
            .competencies__iconAlert-red(v-if="row.rate > row.systemRate")
              i.fa.fa-exclamation-circle
            .competencies__iconAlert-default(v-else)
              i.fa.fa-exclamation-circle

        template(slot="modal", slot-scope="{ row, index }")
          .competencies__data
            .competencies__icon(@click="openForm(), setCandidateData(row)")
              i.fa.fa-id-card-o

</template>

<script>
	import { mapActions, mapGetters } from "vuex"
	// import crudIcons from "../../../mixins/crudIcons"
	import SettingsTable from "../../Table/SettingsTable"
	import CandidateForm from "./CandidateForm"

	export default {
		// mixins: [crudIcons],
		props: {
			pendingCompetenciesData: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				fields: [
					{
						label: "Source Language",
						headerKey: "headerSource",
						key: "source",
						width: "21%",
						padding: "0"
					},
					{
						label: "Target Language",
						headerKey: "headerTarget",
						key: "targets",
						width: "21%",
						padding: "0"
					},
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						width: "21%",
						padding: "0"
					},
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						width: "21%",
						padding: "0"
					},
					{
						label: "",
						headerKey: "headerAlertIcons",
						key: "alertIcon",
						width: "8%",
						padding: "0"
					},
					{
						label: "",
						headerKey: "headerModal",
						key: "modal",
						width: "8%",
						padding: "0"
					}
				],
				isForm: false,
				candidateFormData: {}

			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				storeCurrentVendor: "storeCurrentVendor"
			}),
			async approvePC(pendingCompetence) {
				try {
					const result = await this.$http.post('/vendorsapi/approve-pending-competence', {
						vendorId: this.$route.params.id,
						pendingCompetence,
					})
					await this.storeCurrentVendor(result.data)
					this.$emit("updateRates", true);
					this.alertToggle({ message: "Pending Competence Approved", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Pending Competence Not Approved", isShow: true, type: "error" })
				} finally {
					this.closeForm()
				}
			},
			setCandidateData(row) {
				this.candidateFormData = row
			},
			openForm() {
				this.isForm = true
			},
			closeForm() {
				this.isForm = false
			}


			// ...mapActions([
			// 	"setVendorProp"
			// ]),

			// makeActions(index, key) {
			// 	console.log(index)
			// 	switch (key) {
			// 		case "delete":
			// 			const pendingCompetencies = this.pendingCompetenciesData.filter((_, i) => i !== index)
			// 			this.sendRequest(pendingCompetencies)
			// 			this.setVendorProp({prop: "pendingCompetencies", value: pendingCompetencies})
			// 			break
			// 		default:
			// 			// await this.checkErrors(index)
			// 	}
			// },
			//
			// sendRequest(pendingCompetencies) {
			// 	this.$axios.post('/vendor/pending-competencies', {
			// 		token: this.token,
			// 		pendingCompetencies,
			// 	})
			// },
			//
			//
			// setDefaults() {
			// 	this.isDeleting = false
			// 	this.currentSource = ""
			// 	this.currentTargets = []
			// 	this.currentIndustries = []
			// 	this.currentSteps = []
			// },
			//
			// async manageDeleteClick(index) {
			// 	if (!this.competenciesData[index]._id) {
			// 		this.newRow = false
			// 		this.competenciesData.splice(index, 1)
			// 		this.setDefaults()
			// 		return
			// 	}
			// 	this.deleteIndex = index
			// 	this.isDeleting = true
			// },
			//
			// closeModal() {
			// 	return (this.isDeleting = false)
			// },
			//
			// async deleteCompetencies() {
			// 	try {
			// 		let currentData = this.competenciesData[this.deleteIndex]
			// 		const result = await this.$http.delete(`/vendorsapi/competencies/${ this.$route.params.id }/${ currentData._id }`)
			// 		this.competenciesData.splice(this.deleteIndex, 1)
			// 		this.$emit("updateRates", true)
			// 		this.closeModal()
			// 		this.alertToggle({
			// 			message: "Competencies are deleted",
			// 			isShow: true,
			// 			type: "success"
			// 		})
			// 	} catch (err) {
			// 		this.alertToggle({
			// 			message: "Error in save Competencies",
			// 			isShow: true,
			// 			type: "error"
			// 		})
			// 	}
			// },
			//
			// closeErrors() {
			// 	this.areErrors = false
			// },

		},

		computed: {
			// ...mapGetters({
			// 	token: "getToken"
			// }),
			// manageIcons() {
			// 	const {cancel, save ,...reuslt} = this.icons
			// 	return reuslt
			// }
		},
		components: {
			CandidateForm,
			SettingsTable
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";
  @import "../../../assets/styles/settingsTable";

  .competencies {

    &__data {
      @extend %table-data;
      overflow-x: hidden;
    }

    &__editing-data {
      @extend %table-data;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__data-input {
      @extend %table-text-input;
    }

    &__icons {
      @extend %table-icons;
      height: 30px;
      justify-content: center;
    }

    &__icon {
      color: #67573e;
      display: flex;
      height: 30px;
      align-items: center;
      height: 30px;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      width: 100%;
    }

    &__iconAlert {
      &-red {
        color: #d15f45;
        width: 100%;
        font-size: 16px;
        text-align: center;
      }

      &-default {
        color: #c4beb6;
        width: 100%;
        font-size: 16px;
        text-align: center;
      }
    }

    &__drop-menu {
      position: relative;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &_opacity {
      opacity: 1;
    }

    &__input {
      @extend %table-text-input;
    }
  }
</style>
