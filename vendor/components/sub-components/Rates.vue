<template lang="pug">
  .rates
    .rates__filter
      //Filters(
      //  :sourceSelect="sourceSelect"
      //  :targetSelect="targetSelect"
      //  :stepSelect="stepSelect"
      //  :unitSelect="unitSelect"
      //  :industrySelect="industrySelect"
      //
      //  :AllSources="AllSources",
      //  :AllTargets="AllTargets",
      //  :AllSteps="AllSteps",
      //  :AllUnits="AllUnits",
      //  :AllIndustries="AllIndustries"
      //
      //  @setSourceFilter="setSourceFilter"
      //  @setTargetFilter="setTargetFilter"
      //  @setStepFilter="setStepFilter"
      //  @setUnitFilter="setUnitFilter"
      //  @setIndustryFilter="setIndustryFilter"
      //)
    .rates__table(v)
      DataTable(
        :fields="fields"
        :tableData="filteredData"
        :rowClass="'cursor-default'"
        bodyRowClass="rates-matrix-row"
        :bodyClass="[rates.length < 10 ? 'table_no-body-bottom-margin tbody_visible-overflow' : 'table_no-body-bottom-margin', 'tbody_height-300']"
        :tableHeadRowClass="rates.length < 10 ? 'tbody_visible-overflow' : ''"
      )
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .rates__head-title {{ field.label }}

        template(slot="source", slot-scope="{ row, index }")
          .rates__data {{ row.sourceLanguage.lang }}
        template(slot="target", slot-scope="{ row, index }")
          .rates__data {{ row.targetLanguage.lang }}
        template(slot="step", slot-scope="{ row, index }")
          .rates__data {{ row.step.title }}
        template(slot="unit", slot-scope="{ row, index }")
          .rates__data {{ row.unit.type }}
        template(slot="industry", slot-scope="{ row, index }")
          .rates__data {{ row.industry.name }}
        template(slot="price", slot-scope="{ row, index }")
          .rates__data {{ row.price }}
            span(v-html="returnIconCurrencyByStringCode('EUR')")
    .rates__table_msg(v-if="!filteredData.length") No data

</template>

<script>
	import { mapGetters } from 'vuex'
	// import DataTable from "../overall/DataTable"
	// import { getToken } from "../../../store/getters"
	import currencyIconDetected from "../../mixins/currencyIconDetected"
	// import Filters from "./RatesFilters"

	export default {
		mixins: [currencyIconDetected],
		data() {
			return {
				sourceSelect: "",
				targetSelect: "",
				stepSelect: "",
				unitSelect: "",
				industrySelect: "",

				AllSources: ['All'],
				AllTargets: ['All'],
				AllSteps: ['All'],
				AllUnits: ['All'],
				AllIndustries: ['All'],

				rates: [],
				fields: [
					{ label: "Source Language", headerKey: "headerA", key: "source", width: "18%", padding: 0 },
					{ label: "Target Language", headerKey: "headerB", key: "target", width: "18%", padding: 0 },
					{ label: "Step", headerKey: "headerC", key: "step", width: "18%", padding: 0 },
					{ label: "Unit", headerKey: "headerD", key: "unit", width: "18%", padding: 0 },
					{ label: "Industry", headerKey: "headerE", key: "industry", width: "18%", padding: 0 },
					{ label: "Price", headerKey: "headerF", key: "price", width: "10%", padding: 0 }
				]
			}
		},
		methods: {
			setSourceFilter({ option }) {
				this.sourceSelect = option
			},
			setTargetFilter({ option }) {
				this.targetSelect = option
			},
			setStepFilter({ option }) {
				this.stepSelect = option
			},
			setUnitFilter({ option }) {
				this.unitSelect = option
			},
			setIndustryFilter({ option }) {
				this.industrySelect = option
			},
			setOptionsInFilter() {
				const { AllSources, AllTargets, AllSteps, AllUnits, AllIndustries } = this.rates.reduce((acc, curr) => {
					const { sourceLanguage, targetLanguage, step, unit, industry } = curr
					!acc.AllSources.includes(sourceLanguage.lang) && acc.AllSources.push(sourceLanguage.lang)
					!acc.AllTargets.includes(targetLanguage.lang) && acc.AllTargets.push(targetLanguage.lang)
					!acc.AllSteps.includes(step.title) && acc.AllSteps.push(step.title)
					!acc.AllUnits.includes(unit.type) && acc.AllUnits.push(unit.type)
					!acc.AllIndustries.includes(industry.name) && acc.AllIndustries.push(industry.name)
					return acc
				}, {
					AllSources: [],
					AllTargets: [],
					AllSteps: [],
					AllUnits: [],
					AllIndustries: []
				})
				this.AllSources.push(...AllSources)
				this.AllTargets.push(...AllTargets)
				this.AllSteps.push(...AllSteps)
				this.AllUnits.push(...AllUnits)
				this.AllIndustries.push(...AllIndustries)
			},
			async getVendorRates() {
				try {
					const result = await this.$axios.get(`/vendor/vendor-rates?token=${ this.getToken }`)
					this.rates = result.data
				} catch (err) {
				} finally {
					this.setOptionsInFilter()
				}
			}
		},
		computed: {
			...mapGetters({
				getToken: "getToken"
			}),
			filteredData() {
				let rates = this.rates
				rates = checkup(this.sourceSelect) ? rates.filter(({ sourceLanguage: { lang } }) => lang === this.sourceSelect) : rates
				rates = checkup(this.targetSelect) ? rates.filter(({ targetLanguage: { lang } }) => lang === this.targetSelect) : rates
				rates = checkup(this.stepSelect) ? rates.filter(({ step: { title } }) => title === this.stepSelect) : rates
				rates = checkup(this.unitSelect) ? rates.filter(({ unit: { type } }) => type === this.unitSelect) : rates
				rates = checkup(this.industrySelect) ? rates.filter(({ industry: { name } }) => name === this.industrySelect) : rates

				return rates

				function checkup(filed) {
					return filed !== '' && filed !== 'All'
				}
			}
		},
		created() {
			this.getVendorRates()
		},
		components: {
      // DataTable
    }

	}

</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors";

  .rates {
    width: 1040px;
    height: auto;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    box-sizing: border-box;
    padding: 20px 20px 20px 20px;
    position: relative;
    margin-bottom: 50px;


    &__table_msg {
      margin-top: 5px;
    }

    &__data {
      padding: 6px 5px;
    }
  }

</style>
