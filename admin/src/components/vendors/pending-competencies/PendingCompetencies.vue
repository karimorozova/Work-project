<template lang="pug">
  .competencies
    .competencies__preview(v-if="isWYSIWYG")
      WYSIWYG(@closePreview="closeWYSIWYG", :message="message", @send="sendMessage")

    CandidateForm(
      v-if="isForm"
      :candidateFormData="candidateFormData"
      @closeModal="closeForm"
      @approve="approvePC"
      @reject="startReject"
      @deletePC="deletePC"
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
              i.far.fa-address-card

</template>

<script>
	import { mapActions } from "vuex"
	import SettingsTable from "../../Table/SettingsTable"
	import CandidateForm from "./CandidateForm"
	import WYSIWYG from "../WYSIWYG"

	export default {
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
				candidateFormData: {},
				message: '',
				isWYSIWYG: false,
				pendingCompetenceForReject: {}
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				storeCurrentVendor: "storeCurrentVendor"
			}),
			async deletePC(pendingCompetence) {
				try {
					const result = await this.$http.post('/vendorsapi/delete-pending-competence', {
						vendorId: this.$route.params.id,
						pendingCompetence
					})
					await this.storeCurrentVendor(result.data)
				} catch (e) {
					this.alertToggle({ message: "Error on deleting pending competence", isShow: true, type: "error" })
				} finally {
					this.closeForm()
				}
			},
			async getRejectMessage() {
				try {
					const result = await this.$http.post('/vendorsapi/get-reject-pc-message', {
						pendingCompetence: this.pendingCompetenceForReject,
						vendorId: this.$route.params.id
					})
					this.message = result.data
				} catch (err) {
					this.alertToggle({ message: "Error on reject message", isShow: true, type: "error" })
				}
			},
			async startReject(pendingCompetence) {
				this.pendingCompetenceForReject = pendingCompetence
				await this.getRejectMessage()
				this.openWYSIWYG()
			},
			openWYSIWYG() {
				this.isWYSIWYG = true
			},
			closeWYSIWYG() {
				this.isWYSIWYG = false
				this.pendingCompetenceForReject = {}
				this.message = ''
			},
			sendMessage(template) {
				this.rejectPC(template)
			},
			async rejectPC(template) {
				try {
					const result = await this.$http.post('/vendorsapi/reject-pending-competence', {
						vendorId: this.$route.params.id,
						pendingCompetence: this.pendingCompetenceForReject,
						template
					})
					await this.storeCurrentVendor(result.data)
					this.alertToggle({ message: "Pending Competence Rejected", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Pending Competence Not Rejected", isShow: true, type: "error" })
				} finally {
					this.closeForm()
					this.closeWYSIWYG()
				}
			},
			async approvePC(pendingCompetence) {
				try {
					const result = await this.$http.post('/vendorsapi/approve-pending-competence', {
						vendorId: this.$route.params.id,
						pendingCompetence
					})
					await this.storeCurrentVendor(result.data)
					this.$emit("updateRates", true)
					this.alertToggle({ message: "Pending Competence Approved", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Pending Competence Not Approved", isShow: true, type: "error" })
				} finally {
					this.closeForm()
					this.closeWYSIWYG()
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
		},
		components: {
			WYSIWYG,
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
      height: 31px;
      justify-content: center;
    }

    &__icon {
      color: #66563d;
      display: flex;
      height: 31px;
      align-items: center;
      height: 31px;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      width: 100%;
    }

    &__iconAlert {
      &-red {
        color: #d66f58;
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
