<template lang="pug">
  .price
    ResultFilter(
      :source="sourceFilter",
      :target="targetFilter",
      :step="stepFilter",
      :unit="unitFilter",
      :industry="industryFilter",
      :targets="dataForTargetFilter"
      :sources="dataForSourceFilter"
      :steps="dataForStepFilter"
      :units="dataForUnitFilter"
      :industries="dataForIndustryFilter"
      @setFilter="setFilter"
    )
    DataTable(
      :fields="fields",
      :tableData="currentVendorPriceListFiltered",
      :bodyClass="['client-pricelist-table-body', { 'tbody_visible-overflow': currentVendorPriceListFiltered.length < 6 }]",
      :tableheadRowClass="currentVendorPriceListFiltered.length < 6 ? 'tbody_visible-overflow' : ''",
      bodyRowClass="client-pricelist-table-row",
      bodyCellClass="client-pricelist-table-cell"
    )
      template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
        .price-title {{ field.label }}

      template(slot="sourceLang", slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.sourceLanguage.lang }}
        .price__data(v-else)
          input.price__data-input(type="text", v-model="currentSourceLanguage", disabled)

      template(slot="targetLang", slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.targetLanguage.lang }}
        .price__data(v-else)
          input.price__data-input(type="text", v-model="currentTargetLanguage", disabled)

      template(slot="step", slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.step.title }}
        .price__data(v-else)
          input.price__data-input(type="text", v-model="currentStep", disabled)

      template(slot="unit", slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.unit.type }} / {{ row.size }}
        .price__data(v-else)
          input.price__data-input(type="text", v-model="currentUnit", disabled)

      template(slot="industry", slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.industry.name }}
        .price__data(v-else)
          input.price__data-input(type="text", v-model="currentIndustry", disabled)

      template(slot="price", slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index")
          span#currencyType {{ row.price }}
          label(for="currencyType", v-if="currentVendor.currency === 'EUR'") &euro;
          label(for="currencyType", v-if="currentVendor.currency === 'USD'") &#36;
          label(for="currencyType", v-if="currentVendor.currency === 'GBP'") &pound;

        .price__editing-data(v-else)
          input.price__data-input(type="number", v-model="currentPrice")

      template(slot="icons", slot-scope="{ row, index }")
        .price__icons
          .altered(v-if="row.altered")
            .tooltip
              span(v-if="index <= 1")
                span#myTooltip.tooltiptext-bottom {{ row.notification }}
              span(v-else)
                span#myTooltip.tooltiptext {{ row.notification }}
              img.price__icons-info(:style="{ cursor: 'help' }", src="../../../assets/images/red-info-icon.png")
          img.price__icon(
            v-for="(icon, key) in manageIcons",
            :src="icon.icon",
            @click="makeAction(index, key, row)",
            :class="{ price_opacity: isActive(key, index) }"
          )
          span(v-if="row.altered")
            .price__icons-link(@click="getRowPrice(index, row)")
              i.fa.fa-link(aria-hidden="true")
          span(v-else)
            .price__icons-link-opacity
              i.fa.fa-link(aria-hidden="true")

    .price__empty(v-if="!currentVendorPriceList.length") Nothing found...
</template>
<script>
	import DataTable from "../../DataTable"
	import ResultFilter from "./ResultFilter"
	import crudIcons from "@/mixins/crudIcons"
	import { mapActions, mapGetters } from "vuex"

	export default {
		mixins: [ crudIcons ],
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
			vendorId: {
				type: String
			},
			isRefreshResultTable: {
				type: Boolean
			},
			refresh: {
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
						width: "15%",
						padding: "0"
					},
					{
						label: "Target Language",
						headerKey: "headerLanguageTarget",
						key: "targetLang",
						width: "15%",
						padding: "0"
					},
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						width: "15%",
						padding: "0"
					},
					{
						label: "Unit",
						headerKey: "headerUnit",
						key: "unit",
						width: "15%",
						padding: "0"
					},
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						width: "15%",
						padding: "0"
					},
					{
						label: "Price",
						headerKey: "headerPrice",
						key: "price",
						width: "12%",
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

				currentSourceLanguage: "",
				currentTargetLanguage: "",
				currentStep: "",
				currentUnit: "",
				currentIndustry: "",
				currentPrice: "",

				sourceFilter: "",
				targetFilter: "",
				stepFilter: "",
				unitFilter: "",
				industryFilter: "",
				isDataRemain: true,
				currentActive: -1
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
        updateVendorRatesByKey: 'updateVendorRatesFromServer'
			}),
			async getRowPrice(index, row) {
				try {
					await this.$http.post("/vendorsapi/rates/sync-cost/" + this.$route.params.id, {
						tableKey: "Pricelist Table",
						row
					})

          this.updateVendorRatesByKey({key: 'pricelistTable'})

        } catch (err) {
					this.alertToggle({ message: "Impossible update price", isShow: true, type: "error" })
				}
			},
			async makeAction(index, key, row) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				switch (key) {
					case "edit":
						this.setEditingData(index, row)
						break
					case "cancel":
						this.manageCancelEdition()
						break
					case "delete":
						alert("delete")
						break
					default:
						await this.checkErrors(index, row)
				}
			},
			setEditingData(index, row) {
				this.currentActive = index
				this.currentSourceLanguage = row.sourceLanguage.lang
				this.currentTargetLanguage = row.targetLanguage.lang
				this.currentStep = row.step.title
				this.currentUnit = row.unit.type
				this.currentIndustry = row.industry.name
				this.currentPrice = row.price
			},
			async checkErrors(index, row) {
				if (this.currentActive === -1) return
				if (this.currentPrice === "") return
				await this.manageSaveClick(index, row)
			},

			async manageSaveClick(index, row) {
				if (this.currentActive === -1) return
				const id = row._id

				try {
					await this.$http.post("/vendorsapi/rates/change-pricelist/" + this.$route.params.id, {
						_id: id,
						price: parseFloat(this.currentPrice).toFixed(4),
						altered: true,
						notification: "Price disconnected from function"
					})
					this.alertToggle({
						message: "Saved successfully",
						isShow: true,
						type: "success"
					})
					this.updateVendorRatesByKey({key: 'pricelistTable'})

					this.setDefaults()
				} catch (err) {
					this.alertToggle({
						message: "Error on saving Result pricelist",
						isShow: true,
						type: "error"
					})
				}
			},
			manageCancelEdition() {
				this.setDefaults()
			},
			setDefaults() {
				this.currentActive = -1
			},
			setFilter({ option, prop }) {
			  this.isDataRemain = true
				this[prop] = option
				// this.getPricelist(this.allFilters)
			},
			getAllConcatUniqueValues(key, mapKey) {
				return [ "All" ].concat(
						this.getUniqueValues(
								this.currentVendor.rates.pricelistTable.map((item) => item[key]),
								mapKey
						)
				)
			},
			getUniqueValues(arr, key) {
				return [ ...new Set(arr.map((item) => item[key])) ]
			}
		},
		computed: {
			...mapGetters({
				currentVendor: "getCurrentVendor",
        currentVendorPriceList: "getVendorPriceList",
			}),
			dataForSourceFilter() {
				if (this.currentVendor.rates.pricelistTable.length) {
					return this.getAllConcatUniqueValues('sourceLanguage', "lang")
				}
			},
			dataForTargetFilter() {
				if (this.currentVendor.rates.pricelistTable.length) {
					return this.getAllConcatUniqueValues('targetLanguage', "lang")
				}
			},
			dataForStepFilter() {
				if (this.currentVendor.rates.pricelistTable.length) {
					return this.getAllConcatUniqueValues('step', "title")
				}
			},
			dataForUnitFilter() {
				if (this.currentVendor.rates.pricelistTable.length) {
					return this.getAllConcatUniqueValues('unit', "type")
				}
			},
			dataForIndustryFilter() {
				if (this.currentVendor.rates.pricelistTable.length) {
					return this.getAllConcatUniqueValues('industry', "name")
				}
			},
			currentVendorPriceListFiltered() {
				let result = this.currentVendorPriceList

				let fields = [
					{ filter: this.sourceFilter, query: 'item.sourceLanguage.lang === this.sourceFilter' },
					{ filter: this.targetFilter, query: 'item.targetLanguage.lang === this.targetFilter' },
					{ filter: this.stepFilter, query: 'item.step.title === this.stepFilter' },
					{ filter: this.unitFilter, query: 'item.unit.type === this.unitFilter' },
					{ filter: this.industryFilter, query: 'item.industry.name === this.industryFilter' },
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
			},
			manageIcons() {
				const { delete: del, ...result } = this.icons
				return result
			}
		},
		components: {
			DataTable,
			ResultFilter
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";
  @import "../../../assets/styles/settingsTable";

  .price {
    @extend %setting-table;
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

    &__empty {
      font-size: 14px;
      margin-bottom: 15px;
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
        font-size: 18px;
        margin-top: 5px;
        margin-right: 4px;
      }

      &-link-opacity {
        cursor: default;
        font-size: 18px;
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
      background-color: #67573e;
      color: #fff;
      text-align: center;
      border-radius: 6px;
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
        border-color: #67573e transparent transparent;
      }
    }

    .tooltiptext {
      font-size: 14px;
      visibility: hidden;
      width: 140px;
      background-color: #67573e;
      color: #fff;
      text-align: center;
      border-radius: 6px;
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
        border-color: #67573e transparent transparent transparent;
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
