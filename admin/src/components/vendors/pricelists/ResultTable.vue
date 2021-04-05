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
      :tableData="currentVendorPriceList",
      @bottomScrolled="bottomScrolled",
      :bodyClass="['client-pricelist-table-body', { 'tbody_visible-overflow': currentVendorPriceList.length < 6 }]",
      :tableheadRowClass="currentVendorPriceList.length < 6 ? 'tbody_visible-overflow' : ''",
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
            @click="makeAction(index, key)",
            :class="{ price_opacity: isActive(key, index) }"
          )
          span(v-if="row.altered")
            .price__icons-link(@click="getRowPrice(index)")
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
			async getRowPrice(index) {
				try {
					await this.$http.post("/vendorsapi/rates/sync-cost/" + this.$route.params.id, {
						tableKey: "Pricelist Table",
						row: this.currentVendorPriceList[index]
					})

          this.updateVendorRatesByKey({key: 'pricelistTable'})

        } catch (err) {
					this.alertToggle({ message: "Impossible update price", isShow: true, type: "error" })
				}
			},
			async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				switch (key) {
					case "edit":
						this.setEditingData(index)
						break
					case "cancel":
						this.manageCancelEdition()
						break
					case "delete":
						alert("delete")
						break
					default:
						await this.checkErrors(index)
				}
			},
			setEditingData(index) {
				this.currentActive = index
				this.currentSourceLanguage = this.currentVendorPriceList[index].sourceLanguage.lang
				this.currentTargetLanguage = this.currentVendorPriceList[index].targetLanguage.lang
				this.currentStep = this.currentVendorPriceList[index].step.title
				this.currentUnit = this.currentVendorPriceList[index].unit.type
				this.currentIndustry = this.currentVendorPriceList[index].industry.name
				this.currentPrice = this.currentVendorPriceList[index].price
			},
			async checkErrors(index) {
				if (this.currentActive === -1) return
				if (this.currentPrice === "") return
				await this.manageSaveClick(index)
			},

			async manageSaveClick(index) {
				if (this.currentActive === -1) return
				const id = this.currentVendorPriceList[index]._id

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
				this.getPricelist(this.allFilters)
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post("/vendorsapi/rates/rate-combinations/" + this.$route.params.id, {
						...this.allFilters,
						countFilter: this.currentVendorPriceList.length
					})
					this.currentVendorPriceList.push(...result.data)
					this.isDataRemain = result.body.length === 25
				}
			},
			// async getPricelist(filters, count = 0) {
			// 	try {
			// 		const result = await this.$http.post("/vendorsapi/rates/rate-combinations/" + this.$route.params.id, {
			// 					...filters,
			// 					countFilter: count
			// 				}
			// 		)
			// 		console.log(result.data)
			// 		this.currentVendorPriceList = result.data
			// 	} catch (err) {
			// 		this.alertToggle({
			// 			message: "Error on getting Pricelist",
			// 			isShow: true,
			// 			type: "error"
			// 		})
			// 	}
			// },
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
		// watch: {
		// 	async isRefreshResultTable() {
		// 		if (this.isRefreshResultTable) {
		// 			await this.getPricelist(this.allFilters)
		// 		}
		// 	},
		// 	async refresh() {
		// 		if (this.refresh) {
		// 			await this.getPricelist(this.allFilters)
		// 		}
		// 	}
		// },
		created() {
			// this.getPricelist(this.allFilters)
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
