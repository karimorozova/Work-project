<template lang="pug">
  .price
    .price__filter
      ResultFilter(
        :source="sourceFilter"
        :target="targetFilter"
        :step="stepFilter"
        :unit="unitFilter"
        :industry="industryFilter"
        :targets="languages"
        :sources="languages"
        :steps="steps"
        :units="units"
        :industries="industries"
        @setFilter="setFilter"
      )

    GeneralTable(
      :fields="fields"
      :tableData="dataArray"
      :isFilterShow="false"
      :bodyClass="['setting-table-body', {'tbody_visible-overflow': dataArray.length < 10}]"
      :tableheadRowClass="dataArray.length < 10 ? 'tbody_visible-overflow' : ''"
      bodyRowClass="settings-table-row"
      bodyCellClass="settings-table-cell"
      @bottomScrolled="bottomScrolled"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .price-title {{ field.label }}

      template(slot="sourceLang" slot-scope="{ row, index }")
        .price__data {{ row.sourceLanguage.lang }}
      template(slot="targetLang" slot-scope="{ row, index }")
        .price__data {{ row.targetLanguage.lang }}
      template(slot="step" slot-scope="{ row, index }")
        .price__data {{ row.step.title }}
      template(slot="unit" slot-scope="{ row, index }")
        .price__data {{ row.unit.type }} / {{row.size}}
      template(slot="industry" slot-scope="{ row, index }")
        .price__data {{ row.industry }}

      template(slot="eur" slot-scope="{ row, index }")
        .price__data(v-if="!row.euroMinPrice")
          span(id="eur") {{row.eurPrice}}
          label(for="eur") &euro;
        .price__data(v-else)
          span(id="eur") (fix) {{row.euroMinPrice}}
          label(for="eur") &euro;


      template(slot="usd" slot-scope="{ row, index }")
        .price__data(v-if="!row.usdMinPrice")
          span(id="usd") {{row.usdPrice}}
          label(for="usd") &#36;
        .price__data(v-else)
          span(id="usd") (fix) {{row.usdMinPrice}}
          label(for="usd") &#36;


      template(slot="gbp" slot-scope="{ row, index }")
        .price__data(v-if="!row.gbpMinPrice")
          span(id="gbp") {{row.gbpPrice}}
          label(for="gbp") &pound;
        .price__data(v-else)
          span(id="gbp") (fix) {{row.gbpMinPrice}}
          label(for="gbp") &pound;

    .price__empty(v-if="!dataArray.length") Nothing found...
</template>
<script>
	import ResultFilter from "./ResultFilter"
	import { mapActions } from "vuex"
	import GeneralTable from "../../GeneralTable"

	export default {
		props: {
			languages: {
				type: Array
			},
			industries: {
				type: Array
			},
			units: {
				type: Array
			},
			steps: {
				type: Array
			},
			priceId: {
				type: String
			},
			isRefreshResultTable: {
				type: Boolean
			}
		},
		data() {
			return {
				fields: [
					{
						label: "Source Language",
						headerKey: "headerLanguageSource",
						key: "sourceLang",
						style: { "width": "15%" }
					},
					{
						label: "Target Language",
						headerKey: "headerLanguageTarget",
						key: "targetLang",
						style: { "width": "15%" }
					},
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						style: { "width": "15%" }
					},
					{
						label: "Unit",
						headerKey: "headerUnit",
						key: "unit",
						style: { "width": "15%" }
					},
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						style: { "width": "16%" }
					},
					{
						label: "EUR",
						headerKey: "headerPriceEUR",
						key: "eur",
						style: { "width": "8%" }
					},
					{
						label: "USD",
						headerKey: "headerPriceUSD",
						key: "usd",
						style: { "width": "8%" }
					},
					{
						label: "GBP",
						headerKey: "headerPriceGBP",
						key: "gbp",
						style: { "width": "8%" }
					}
				],

				dataArray: [],
				sourceFilter: "",
				targetFilter: "",
				stepFilter: "",
				unitFilter: "",
				industryFilter: "",
				isDataRemain: true
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			setFilter({ option, prop }) {
				this[prop] = option
				this.getPricelist(this.allFilters)
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post("/pricelists/pricelist/" + this.priceId, {
						...this.allFilters,
						countFilter: this.dataArray.length
					})
					this.dataArray.push(...result.data)
					this.isDataRemain = result.data.length === 25
				}
			},
			async getPricelist(filters, count = 0) {
				try {
					const result = await this.$http.post("/pricelists/pricelist/" + this.priceId, {
						...filters,
						countFilter: count
					})
					this.dataArray = result.data
				} catch (err) {
					this.alertToggle({ message: "Error on getting Pricelist", isShow: true, type: "error" })
				}
			}
		},
		watch: {
			async isRefreshResultTable() {
				if (this.isRefreshResultTable) {
					this.getPricelist(this.allFilters)
				}
			}
		},
		created() {
			this.getPricelist(this.allFilters)
		},
		computed: {
			allFilters() {
				let result = {
					sourceFilter: this.sourceFilter,
					targetFilter: this.targetFilter,
					stepFilter: this.stepFilter,
					unitFilter: this.unitFilter,
					industryFilter: this.industryFilter
				}
				if (this.sourceFilter === "All") result.sourceFilter = ""
				if (this.targetFilter === "All") result.targetFilter = ""
				if (this.stepFilter === "All") result.stepFilter = ""
				if (this.unitFilter === "All") result.unitFilter = ""
				if (this.industryFilter === "All") result.industryFilter = ""

				return result
			}
		},
		components: {
			GeneralTable,
			ResultFilter
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";
  @import "../../../assets/styles/settingsTable";

  .price {
    background-color: #fff;
    box-shadow: none;

    input {
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    label {
      margin-left: 3px;
    }

    &__icons {
      padding-top: 2px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    &__icon {
      cursor: pointer;
      opacity: 0.5;
      margin-right: 8px;
    }

    &_opacity {
      opacity: 1;
    }
  }
</style>