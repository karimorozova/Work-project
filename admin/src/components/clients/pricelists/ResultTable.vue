<template lang="pug">
  .price
    .modal(v-if="isUpdateModal")
      SetPriceModal(
        @close="closeUpdateModal"
        @setPrice="setPrice"
        :i="i"
        :length="length"
      )
    .button(v-if="dataArray.some(it => !!it.isCheck)")
      Button(value="Update Selected" @clicked="openUpdateModal")

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
              span#myTooltip.tooltiptext {{ row.notification }}
              .price__icons-info
                i.fas.fa-info-circle
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
	import SetPriceModal from "../../finance/pricelistSettings/SetPriceModal"
	import Button from "../../Button"

	export default {
		props: {
			dataArray: {
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
				isUpdateModal: false,
				i: 0,
				length: 0
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				updateClientRatesProp: "updateClientRatesProp"
			}),
			async setPrice(price) {
				this.length = this.dataArray.filter(i => !!i.isCheck).length
				for await (let [ index, row ] of this.dataArray.filter(i => !!i.isCheck).entries()) {
					this.i = index + 1
					row.price = price
					await this.manageSavePrice(row)
				}
				this.closeUpdateModal()
			},
			openUpdateModal() {
				this.isUpdateModal = true
			},
			closeUpdateModal() {
				this.isUpdateModal = false
				this.toggleAll(false)
				this.i = this.length = 0
			},

			toggleCheck(row, val) {
				this.$emit('toggleCheck', { row, val, prop: 'pricelistTable' })
			},
			toggleAll(val) {
				this.$emit('toggleAll', { val, prop: 'pricelistTable' })
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
			async manageSavePrice({ _id, price }) {
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
				return (this.dataArray && this.dataArray.length) && this.dataArray.every(i => i.isCheck)
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
			Button,
			SetPriceModal,
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
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 7px;

      &-info {
        cursor: help;
        color: $red;
        font-size: 16px;
      }

      &-link {
        cursor: pointer;
        font-size: 16px;
      }

      &-link-opacity {
        cursor: default;
        font-size: 16px;
        opacity: 0.5;
      }
    }
  }

  .tooltip {
    position: relative;
    display: flex;

    .tooltiptext {
      visibility: hidden;
      font-size: 14px;
      width: max-content;
      background-color: $red;
      color: #fff;
      text-align: center;
      border-radius: 4px;
      right: 30px;
      bottom: -3px;
      padding: 6px;
      position: absolute;
      z-index: 1;
      opacity: 0;
      transition: opacity .3s;

      &::after {
        content: "";
        position: absolute;
        top: 38%;
        right: -10px;
        transform: rotate(270deg);
        border-width: 5px;
        border-style: solid;
        border-color: $red transparent transparent;
      }
    }

    &:hover {
      .tooltiptext {
        visibility: visible;
        opacity: 1;
      }
    }
  }
</style>
