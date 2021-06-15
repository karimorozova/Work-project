<template lang="pug">
  .price
    .prices-filter
      ResultFilter(
        :source="sourceFilter"
        :target="targetFilter"
        :step="stepFilter"
        :unit="unitFilter"
        :industry="industryFilter"
        :targets="dataForTargetFilter"
        :sources="dataForSourceFilter"
        :steps="dataForStepFilter"
        :units="dataForUnitFilter"
        :industries="dataForIndustryFilter"
        @setFilter="setFilter"
      )

    DataTable(
      :fields="fields"
      :tableData="currentClientPriceListFiltered"
      :bodyClass="['client-pricelist-table-body', {'tbody_visible-overflow': currentClientPriceListFiltered.length < 6}]"
      :tableheadRowClass="currentClientPriceListFiltered.length < 6 ? 'tbody_visible-overflow' : ''"
      bodyRowClass="client-pricelist-table-row"
      bodyCellClass="client-pricelist-table-cell"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .price-title(v-if="field.headerKey === 'headerCheck' && isEdit")
          CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        .price-title(v-else) {{ field.label }}

      template(slot="check" slot-scope="{ row, index }")
        .price__data(v-if="isEdit")
          CheckBox(:isChecked="row.isCheck" @check="toggleCheck(row, true)" @uncheck="toggleCheck(row, false)")

      template(slot="sourceLang" slot-scope="{ row, index }")
        .price__data {{ row.sourceLanguage.lang }}

      template(slot="targetLang" slot-scope="{ row, index }")
        .price__data {{ row.targetLanguage.lang }}

      template(slot="step" slot-scope="{ row, index }")
        .price__data {{ row.step.title }}

      template(slot="unit" slot-scope="{ row, index }")
        .price__data {{ row.unit.type }} / {{row.size}}

      template(slot="industry" slot-scope="{ row, index }")
        .price__data {{ row.industry.name }}

      template(slot="price" slot-scope="{ row, index }")
        .price__data(v-if="!isEdit")
          span(id="currencyType") {{row.price}}
          label(for="currencyType" v-if="currentClient.currency === 'EUR'" ) &euro;
          label(for="currencyType" v-if="currentClient.currency === 'USD'" ) &#36;
          label(for="currencyType" v-if="currentClient.currency === 'GBP'" ) &pound;

        .price__editing-data(v-else)
          input.price__data-input(type="number" @change="setRowValue(row)" v-model="row.price")

      template(slot="icons" slot-scope="{ row, index }")
        .price__icons
          .altered(v-if="row.altered")
            .tooltip
              span(v-if="index <= 1")
                span#myTooltip.tooltiptext-bottom {{ row.notification }}
              span(v-else)
                span#myTooltip.tooltiptext {{ row.notification }}
              img.price__icons-info(:style="{ cursor: 'help' }", src="../../../assets/images/red-info-icon.png")
          span(v-if="row.altered")
            .price__icons-link(@click="getRowPrice(index, row)")
              i.fa.fa-link(aria-hidden='true')
          span(v-else)
            .price__icons-link-opacity
              i.fa.fa-link(aria-hidden='true')

    .price__empty(v-if="!currentClientPriceListFiltered.length") Nothing found...
</template>
<script>
	import DataTable from "../../DataTable"
	import ResultFilter from "./ResultFilter"
	import { mapGetters, mapActions } from "vuex"
	import CheckBox from "../../CheckBox"

	export default {
		props: {
			rates: {
				type: Array
			},
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
			clientId: {
				type: String
			},
			isRefreshResultTable: {
				type: Boolean
			},
			refresh: {
				type: Boolean
			},
			isEdit: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				fields: [
					{
						label: "",
						headerKey: "headerCheck",
						key: "check",
						width: "4%",
						padding: 0
					},
					{
						label: "Source Language",
						headerKey: "headerLanguageSource",
						key: "sourceLang",
						width: "14%",
						padding: "0"
					},
					{
						label: "Target Language",
						headerKey: "headerLanguageTarget",
						key: "targetLang",
						width: "14%",
						padding: "0"
					},
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						width: "14%",
						padding: "0"
					},
					{
						label: "Unit",
						headerKey: "headerUnit",
						key: "unit",
						width: "14%",
						padding: "0"
					},
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						width: "14%",
						padding: "0"
					},
					{
						label: "Price",
						headerKey: "headerPrice",
						key: "price",
						width: "13%",
						padding: "0"
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						width: "13%",
						padding: "0"
					}
				],

				sourceFilter: "",
				targetFilter: "",
				stepFilter: "",
				unitFilter: "",
				industryFilter: "",
				isDataRemain: true,
				currentServices: null,
				dataArray: JSON.parse(JSON.stringify(this.rates))
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				updateClientRatesProp: "updateClientRatesProp"
			}),
			toggleCheck({ _id }, val) {
				const index = idx(this.dataArray, _id)
				this.dataArray[index].isCheck = val

				function idx(arr, id) {
					return arr.findIndex(({ _id }) => `${ _id }` === `${ id }`)
				}
			},
			toggleAll(val) {
				this.dataArray = this.dataArray.reduce((acc, cur) => {
					acc.push({ ...cur, isCheck: val })
					return acc
				}, [])
			},
			async getRowPrice(index, row) {
				try {
					await this.$http.post("/clientsapi/rates/sync-cost/" + this.clientId, {
						tableKey: "Pricelist Table",
						row
					})
					this.updateClientRatesProp({ key: "pricelistTable" })
				} catch (err) {
					this.alertToggle({ message: "Impossible update price", isShow: true, type: "error" })
				}
			},
			async setRowValue(row) {
				await this.checkErrors(row)
			},
			async checkErrors(row) {
				if (!this.isEdit) return
				if (row.price === "") row.price = 1
				await this.manageSaveClick(row)
			},
			async manageSaveClick(row) {
				const { _id, price } = row
				try {
					await this.$http.post("/clientsapi/rates/change-pricelist/" + this.clientId, {
						_id,
						price: parseFloat(price).toFixed(4),
						altered: true,
						notification: "Price disconnected from function"
					})
					this.updateClientRatesProp({ key: "pricelistTable" })
				} catch (err) {
					this.alertToggle({ message: "Error on saving Result pricelist", isShow: true, type: "error" })
				}
			},
			setFilter({ option, prop }) {
				this.isDataRemain = true
				this[prop] = option
			},
			async getClientServices() {
				this.currentServices = this.currentClient.services
			},
			getUniqueValues(arr, key) {
				return [ ...new Set(arr.map((item) => item[key])) ]
			},
			getStepsFromServices() {
				return [
					...new Set(
							this.currentServices
									.map((service) => service.services.map((step) => step.steps).flat())
									.flat()
									.map((step) => step.step)
					)
				]
			}

		},
		created() {
			this.getClientServices()
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient"
			}),
			isAllSelected() {
				return this.dataArray && this.dataArray.length && this.dataArray.every(i => i.isCheck)
			},
			dataForSourceFilter() {
				if (this.currentServices) {
					return [ "All" ].concat(
							this.getUniqueValues(
									this.currentServices.map((source) => source.sourceLanguage),
									"lang"
							)
					)
				}
			},
			dataForTargetFilter() {
				if (this.currentServices) {
					return [ "All" ].concat(
							this.getUniqueValues(
									this.currentServices.map((target) => target.targetLanguages).flat(),
									"lang"
							)
					)
				}
			},
			dataForStepFilter() {
				if (this.currentServices) {
					return [ "All" ].concat([
						...new Set(
								this.steps
										.filter((step) => this.getStepsFromServices().some((stepId) => step._id.toString() === stepId))
										.map((step) => step.title)
						)
					])
				}
			},
			dataForUnitFilter() {
				if (this.currentServices) {
					return [ "All" ].concat([
						...new Set(
								this.units.filter((unit) =>
										this.getStepsFromServices().some((stepId) => unit.steps.some((step) => step._id.toString() === stepId))
								).map((unit) => unit.type)
						)
					])
				}
			},
			dataForIndustryFilter() {
				if (this.currentServices) {
					return [ "All" ].concat(
							this.getUniqueValues(
									this.currentServices.map((industry) => industry.industries).flat(),
									"name"
							)
					)
				}
			},
			currentClientPriceListFiltered() {
				let result = this.dataArray

				let fields = [
					{ filter: this.sourceFilter, query: 'item.sourceLanguage.lang === this.sourceFilter' },
					{ filter: this.targetFilter, query: 'item.targetLanguage.lang === this.targetFilter' },
					{ filter: this.stepFilter, query: 'item.step.title === this.stepFilter' },
					{ filter: this.unitFilter, query: 'item.unit.type === this.unitFilter' },
					{ filter: this.industryFilter, query: 'item.industry.name === this.industryFilter' }
				]

				let neededFields = fields.filter(({ filter }) => !!filter && filter !== 'All')
				if (neededFields.length) {
					let lastField = neededFields[neededFields.length - 1]
					let query = neededFields.reduce((acc, curr) => {
						curr.query !== lastField.query ? (acc = acc + curr.query + ' && ') : (acc = acc + curr.query)
						return acc
					}, 'item => ')

					return result.filter(eval(query))
				}

				return result
			}
		},
		components: {
			CheckBox,
			DataTable,
			ResultFilter
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .price {
    background-color: #fff;
    padding: 0;
    box-shadow: none;

    input[disabled] {
      box-shadow: none;
    }

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

    &__data,
    &__editing-data {
      height: 31px;
      padding: 0 5px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
    }

    &__editing-data {
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__empty {
      font-size: 14px;
      margin-bottom: 15px;
    }

    &__data-input {
      width: 100%;
      border: none;
      outline: none;
      color: $main-color;
      padding: 0 2px;
      background-color: transparent;
    }

    &__icons {
      padding-top: 2px;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      &-info {
        margin-top: 1px;
        margin-right: 3px;
      }

      &-link {
        cursor: pointer;
        font-size: 16px;
        margin-top: 5px;
        margin-right: 4px;
      }

      &-link-opacity {
        cursor: default;
        font-size: 16px;
        margin-top: 4px;
        opacity: 0.5;
        margin-right: 4px;
      }
    }

    &__icon {
      cursor: pointer;
      opacity: 0.5;
      margin-right: 2px;
    }

    &_opacity {
      opacity: 1;
    }
  }

  .tooltip {
    position: relative;
    display: flex;

    .tooltiptext-bottom {
      font-size: 14px;
      visibility: hidden;
      width: 140px;
      background-color: #66563d;
      color: #fff;
      text-align: center;
      border-radius: 4px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      bottom: -55px;
      left: 50%;
      margin-left: -75px;
      opacity: 0;
      transition: opacity 0.3s;

      &::after {
        content: "";
        position: absolute;
        top: -10px;
        left: 50%;
        margin-left: -5px;
        transform: rotate(180deg);
        border-width: 5px;
        border-style: solid;
        border-color: #66563d transparent transparent;
      }
    }

    .tooltiptext {
      font-size: 14px;
      visibility: hidden;
      width: 140px;
      background-color: #66563d;
      color: #fff;
      text-align: center;
      border-radius: 4px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      bottom: 30px;
      left: 50%;
      margin-left: -75px;
      opacity: 0;
      transition: opacity 0.3s;

      &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #66563d transparent transparent transparent;
      }
    }

    &:hover {
      .tooltiptext {
        visibility: visible;
        opacity: 1;
      }
    }

    &:hover {
      .tooltiptext-bottom {
        visibility: visible;
        opacity: 1;
      }
    }
  }
</style>
