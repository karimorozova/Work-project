<template lang="pug">
  .container
    .pendingCompetencies
      .pendingCompetencies__body
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
            :bodyClass="['vendors-table__body',{'tbody_visible-overflow': preCompetencies.length < 6}]"
            :tableheadRowClass="preCompetencies.length < 6 ? 'tbody_visible-overflow' : ''"
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
            template(slot="modal" slot-scope="{ row }")
              .pendingCompetencies__icon
                i.fa.fa-id-card-o
            template(slot="link" slot-scope="{ row }")
              .pendingCompetencies__icon
                a(:href="'/vendors/details/' + row.link" target="_blank")
                  i.fa.fa-external-link

</template>

<script>
	import DataTable from "../../DataTable"
	import { mapGetters, mapActions } from "vuex"
	import PendingCompetenciesFilter from "./PendingCompetenciesFilter"


	export default {
		data() {
			return {
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
					{ label: "Vendor Name", headerKey: "headerVendorName", key: "vendorName", width: "17%", padding: "0" },
					{ label: "Source Language", headerKey: "headerSourceLanguage", key: "source", width: "17%", padding: "0" },
					{ label: "Target Language", headerKey: "headerTargetLanguage", key: "target", width: "17%", padding: "0" },
					{ label: "Step", headerKey: "headerStep", key: "step", width: "17%", padding: "0" },
					{ label: "Industry", headerKey: "headerIndustry", key: "industry", width: "17%", padding: "0" },
					{ label: "Priority", headerKey: "headerPriority", key: "priority", width: "5%", padding: "0" },
					{ label: "", headerKey: "headerModal", key: "modal", width: "5%", padding: "0" },
					{ label: "", headerKey: "headerLink", key: "link", width: "5%", padding: "0" }
				]
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			async setFilter({ option }, prop) {
				this.filters[prop] = option
				await this.getVendorsPendingCompetencies(this.filters)
			},
			onRowClicked() {
				alert('DA')
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
		components: { PendingCompetenciesFilter, DataTable }
	}

</script>

<style lang="scss" scoped>
  .pendingCompetencies {
    position: relative;
    width: 100%;

    &__body {
      margin: 40px 40px 40px 20px;
      width: 1100px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      padding: 20px;
    }

    &__data {
      height: 30px;
      overflow-x: hidden;
      padding: 0 5px;
      align-items: center;
      display: flex;
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
    }
  }

  a {
    color: #67573e;
  }

</style>