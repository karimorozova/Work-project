<template lang="pug">
  .container
    .pendingCompetencies
      .pendingCompetencies__body
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
        PendingCompetenciesFilter(
          :allSources="languagesList"
          :allTargets="languagesList"
          :allSteps="stepsList"
          :allIndustries="industriesList"
          :allUrgency="['All','1','2','3']"
          :allVendorStatus="['All','Active','Potential','Inactive']"

          :sourceFilter="filters.sourceFilter"
          :targetFilter="filters.targetFilter"
          :vendorStatusFilter="filters.vendorStatusFilter"
          :industryFilter="filters.industryFilter"
          :stepFilter="filters.stepFilter"
          :urgencyFilter="filters.urgencyFilter"

          @setSourceFilter="(e) => setFilter(e, 'sourceFilter')"
          @setTargetFilter="(e) => setFilter(e, 'targetFilter')"
          @setVendorStatusFilter="(e) => setFilter(e, 'vendorStatusFilter')"
          @setIndustryFilter="(e) => setFilter(e, 'industryFilter')"
          @setStepFilter="(e) => setFilter(e, 'stepFilter')"
          @setUrgencyFilter="(e) => setFilter(e, 'urgencyFilter')"
        )
        .pendingCompetencies__table
          DataTable(
            :fields="fields"
            :tableData="preCompetencies"
            bodyRowClass="cursor-default"
            :bodyCellClass="'vendor-table-cell'"
            :bodyClass="['vendors-table__body',{'tbody_visible-overflow': preCompetencies.length < 18}]"
            :tableheadRowClass="preCompetencies.length < 18 ? 'tbody_visible-overflow' : ''"
          )
            template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
              span.pendingCompetencies__header-label {{ field.label }}

            template(slot="vendorName" slot-scope="{ row }")
              .pendingCompetencies__data {{ row.vendorName }}

            template(slot="source" slot-scope="{ row }")
              .pendingCompetencies__data {{ row.sourceLanguage.lang }}

            template(slot="target" slot-scope="{ row }")
              .pendingCompetencies__data {{ row.targetLanguage.lang }}

            template(slot="step" slot-scope="{ row }")
              .pendingCompetencies__data {{ row.step.title }}

            template(slot="industry" slot-scope="{ row }")
              .pendingCompetencies__data {{ row.industry.name }}

            template(slot="priority" slot-scope="{ row }")
              .pendingCompetencies__data 1

            template(slot="alert" slot-scope="{ row }")
              .pendingCompetencies__data
                .pendingCompetencies__iconAlert-red(v-if="row.rate > row.systemRate")
                  i.fa.fa-exclamation-circle
                .pendingCompetencies__iconAlert-default(v-else)
                  i.fa.fa-exclamation-circle

            template(slot="modal" slot-scope="{ row }")
              .pendingCompetencies__icon(@click="openForm(), setCandidateData(row)")
                i.far.fa-address-card

            template(slot="link" slot-scope="{ row }")
              .pendingCompetencies__icon
                a(:href="'/vendors/details/' + row.link" target="_blank")
                  i.fas.fa-external-link-alt

</template>

<script>
	import DataTable from "../../DataTable"
	import { mapGetters, mapActions } from "vuex"
	import PendingCompetenciesFilter from "./PendingCompetenciesFilter"
	import CandidateForm from "./CandidateForm"
	import WYSIWYG from "../WYSIWYG"


	export default {
		data() {
			return {
				candidateFormData: {},
				isForm: false,
				isWYSIWYG: false,
				pendingCompetenceForReject: {},
        message: '',
				filters: {
					sourceFilter: [ "All" ],
					targetFilter: [ "All" ],
					vendorStatusFilter: [ "All" ],
					industryFilter: [ "All" ],
					stepFilter: [ "All" ],
					urgencyFilter: [ "All" ]
				},
				preCompetencies: [],
				fields: [
					{ label: "Vendor Name", headerKey: "headerVendorName", key: "vendorName", width: "16%", padding: "0" },
					{ label: "Source Language", headerKey: "headerSourceLanguage", key: "source", width: "16%", padding: "0" },
					{ label: "Target Language", headerKey: "headerTargetLanguage", key: "target", width: "16%", padding: "0" },
					{ label: "Step", headerKey: "headerStep", key: "step", width: "16%", padding: "0" },
					{ label: "Industry", headerKey: "headerIndustry", key: "industry", width: "16%", padding: "0" },
					{ label: "Priority", headerKey: "headerPriority", key: "priority", width: "5%", padding: "0" },
					{ label: "", headerKey: "headerAlert", key: "alert", width: "5%", padding: "0" },
					{ label: "", headerKey: "headerModal", key: "modal", width: "5%", padding: "0" },
					{ label: "", headerKey: "headerLink", key: "link", width: "5%", padding: "0" }
				]
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				storeCurrentVendor: "storeCurrentVendor"
			}),
			async deletePC(pendingCompetence){
				try{
					const result = await this.$http.post('/vendorsapi/delete-pending-competence', {
						vendorId: pendingCompetence.link,
						pendingCompetence,
					})
					await this.storeCurrentVendor(result.data)
					this.getVendorsPendingCompetencies(this.filters)
        }catch (e) {
					this.alertToggle({ message: "Error on deleting pending competence", isShow: true, type: "error" })
				}finally {
					this.closeForm()
				}
      },
			async getRejectMessage() {
				try {
					const result = await this.$http.post('/vendorsapi/get-reject-pc-message', {
						pendingCompetence: this.pendingCompetenceForReject,
            vendorId: this.pendingCompetenceForReject.link
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
			closeWYSIWYG() {
				this.isWYSIWYG = false
				this.pendingCompetenceForReject = {}
				this.message = ''
			},
			openWYSIWYG() {
				this.isWYSIWYG = true
			},
			sendMessage(template) {
				this.rejectPC(template)
			},
			async rejectPC(template) {
				try {
					const result = await this.$http.post('/vendorsapi/reject-pending-competence', {
						vendorId: this.pendingCompetenceForReject.link,
						pendingCompetence: this.pendingCompetenceForReject,
						template,
					})
					await this.storeCurrentVendor(result.data)
					this.getVendorsPendingCompetencies(this.filters)
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
						vendorId: pendingCompetence.link,
						pendingCompetence,
					})
					await this.storeCurrentVendor(result.data)
					this.getVendorsPendingCompetencies(this.filters)
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
			async setFilter({ option }, prop) {
				this.filters[prop] = option
				await this.getVendorsPendingCompetencies(this.filters)
			},
			openForm() {
				this.isForm = true
			},
			closeForm() {
				this.isForm = false
			},
			async getVendorsPendingCompetencies(filters) {
				try {
					const { data } = await this.$http.post('/vendorsapi/filtered-pending-competencies', { filters })
					this.preCompetencies = data
				} catch (err) {
					this.alertToggle({ message: "Server error / Cannot get Vendor Competencies", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			...mapGetters({
				allLanguages: "getAllLanguages",
				allIndustries: "getAllIndustries",
				allSteps: "getAllSteps"
			}),
			languagesList() {
				return this.allLanguages && [ 'All' ].concat(this.allLanguages.map(item => item.lang))
			},
			stepsList() {
				return this.allSteps && [ 'All' ].concat(this.allSteps.map(item => item.title))
			},
			industriesList() {
				return this.allIndustries && [ 'All' ].concat(this.allIndustries.map(item => item.name))
			}

		},
		created() {
			this.getVendorsPendingCompetencies(this.filters)
		},
		components: { WYSIWYG, PendingCompetenciesFilter, DataTable, CandidateForm }
	}

</script>

<style lang="scss" scoped>
  .pendingCompetencies {
    position: relative;
    width: 100%;

    &__body {
      width: 1100px;
      box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
      padding: 20px;
      position: relative;
    }

    &__data {
      height: 31px;
      overflow-x: hidden;
      padding: 0 5px;
      align-items: center;
      display: flex;
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
  }


  a {
    color: #66563d;
  }

</style>
