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

    .price__filter
      LangFilter(
        :source="sourceFilter"
        :target="targetFilter"
        :form="typeFilter"
        :sources="languages"
        :targets="languages"
        @setFilter="setFilter"
      )

    GeneralTable(
      :fields="fields"
      :tableData="dataArray"
      :isFilterShow="false"
      :bodyClass="['setting-table-body', {'tbody_visible-overflow': dataArray.length < 3}]"
      :tableheadRowClass="dataArray.length < 3 ? 'tbody_visible-overflow' : ''"
      bodyRowClass="settings-table-row"
      bodyCellClass="settings-table-cell"
      @bottomScrolled="bottomScrolled"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .price-title(v-if="field.headerKey === 'headerCheck' && isEdit && dataArray.length")
          CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        .price-title(v-else) {{ field.label }}

      template(slot="check" slot-scope="{ row, index }")
        .price__data(v-if="isEdit && row.hasOwnProperty('isCheck')")
          CheckBox(:isChecked="!!row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

      template(slot="sourceLang" slot-scope="{ row, index }")
        .price__data {{ row.sourceLanguage.lang }}

      template(slot="targetLang" slot-scope="{ row, index }")
        .price__data {{ row.targetLanguage.lang }}

      template(slot="eur" slot-scope="{ row, index }")
        .price__data(v-if="!isEdit")
          span(id="eur") {{row.euroBasicPrice}}
          label(for="eur") &euro;
        .price__editing-data(v-else)
          input.price__data-input(type="number" @change="setRowValue(index)" v-model="dataArray[index].euroBasicPrice")

      template(slot="usd" slot-scope="{ row, index }")
        .price__data
          span(id="usd") {{row.usdBasicPrice}}
          label(for="usd") &#36;
        //.price__data(v-else)
          input.price__data-input(type="number" :value="dataArray[index].usdBasicPrice" disabled)

      template(slot="gbp" slot-scope="{ row, index }")
        .price__data
          span(id="gbp") {{row.gbpBasicPrice}}
          label(for="gbp") &pound;
        //.price__data(v-else)
          input.price__data-input(type="number" :value="dataArray[index].gbpBasicPrice" disabled)

    .price__empty(v-if="!dataArray.length") Nothing found...
</template>
<script>
	import LangFilter from "./LangFilter"
	import { mapActions } from "vuex"
	import CheckBox from "../../CheckBox"
	import Button from "../../Button"
	import SetPriceModal from "./SetPriceModal"
	import GeneralTable from "../../GeneralTable"

	export default {
		props: {
			priceId: {
				type: String
			},
			languages: {
				type: Array
			},
			isRefresh: {
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
						style: { "width": "4%" },
						filterInfo: { isFilter: false, isFilterSet: false },
						sortInfo: { isSort: false, isArray: false, order: 'default' }
					},
					{
						label: "Source Lang",
						headerKey: "headerSourceLang",
						key: "sourceLang",
						style: { "width": "27%" },
						filterInfo: { isFilter: false, isFilterSet: false },
						sortInfo: { isSort: false, isArray: false, order: 'default' }
					},
					{
						label: "Target Lang",
						headerKey: "headerTargetLang",
						key: "targetLang",
						style: { "width": "27%" },
						filterInfo: { isFilter: false, isFilterSet: false },
						sortInfo: { isSort: false, isArray: false, order: 'default' }
					},
					{
						label: "EUR",
						headerKey: "headerBasicPriceEUR",
						key: "eur",
						style: { "width": "14%" },
						filterInfo: { isFilter: false, isFilterSet: false },
						sortInfo: { isSort: false, isArray: false, order: 'default' }
					},
					{
						label: "USD",
						headerKey: "headerBasicPriceUSD",
						key: "usd",
						style: { "width": "14%" },
						filterInfo: { isFilter: false, isFilterSet: false },
						sortInfo: { isSort: false, isArray: false, order: 'default' }
					},
					{
						label: "GBP",
						headerKey: "headerBasicPriceGBP",
						key: "gbp",
						style: { "width": "14%" },
						filterInfo: { isFilter: false, isFilterSet: false },
						sortInfo: { isSort: false, isArray: false, order: 'default' }
					}
				],
				dataArray: [],
				currency: {},
				typeFilter: "",
				sourceFilter: "",
				targetFilter: "",
				isDataRemain: true,
				isUpdateModal: false,
				i: 0,
				length: 0
			}
		},
		created() {
			this.getCurrency()
			this.getLangs(this.allFilters)
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			async setPrice(price) {
				this.length = this.dataArray.filter(i => !!i.isCheck).length
				for await (let [ index, row ] of this.dataArray.filter(i => !!i.isCheck).entries()) {
					this.i = index + 1
					row.euroBasicPrice = price
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
			toggleCheck(index, val) {
				this.dataArray[index].isCheck = val
			},
			toggleAll(val) {
				this.dataArray = this.dataArray.reduce((acc, cur) => {
					acc.push({ ...cur, isCheck: val })
					return acc
				}, [])
			},
			async setRowValue(index) {
				await this.checkErrors(index)
			},
			async checkErrors(index) {
				if (!this.isEdit) return
				if (this.dataArray[index].euroBasicPrice === "") this.dataArray[index].euroBasicPrice = 0.1
				await this.manageSaveClick(index)
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post("/pricelists/basic-prices/" + this.priceId, {
						...this.allFilters,
						countFilter: this.dataArray.length
					})
					this.dataArray.push(...result.data.map(i => ({ ...i, isCheck: false })))
					this.isDataRemain = result.data.length === 25
				}
			},
			async getLangs(filters, count = 0) {
				try {
					const result = await this.$http.post("/pricelists/basic-prices/" + this.priceId, {
						...filters,
						countFilter: count
					})
					this.dataArray = result.data.map(i => ({ ...i, isCheck: false }))
				} catch (err) {
					this.alertToggle({ message: "Error on getting Languages", isShow: true, type: "error" })
				}
			},
			refreshResultTable() {
				this.$emit('refreshResultTable')
			},
			async manageSavePrice({ _id, type, sourceLanguage, targetLanguage, euroBasicPrice }) {
				try {
					const result = await this.$http.post("/pricelists/basic-prices-update/" + this.priceId, {
						basicPrice: {
							_id,
							type,
							sourceLanguage,
							targetLanguage,
							usdBasicPrice: euroBasicPrice * this.currency.USD,
							euroBasicPrice,
							gbpBasicPrice: euroBasicPrice * this.currency.GBP
						}
					})
					this.dataArray.splice(idx(this.dataArray, _id), 1, { ...result.data, isCheck: false })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on saving Steps", isShow: true, type: "error" })
				}

				function idx(arr, id) {
					return arr.findIndex(({ _id }) => `${ _id }` === `${ id }`)
				}
			},
			async manageSaveClick(index) {
				const { _id, type, sourceLanguage, targetLanguage, euroBasicPrice } = this.dataArray[index]
				try {
					const result = await this.$http.post("/pricelists/basic-prices-update/" + this.priceId, {
						basicPrice: {
							_id,
							type,
							sourceLanguage,
							targetLanguage,
							usdBasicPrice: euroBasicPrice * this.currency.USD,
							euroBasicPrice,
							gbpBasicPrice: euroBasicPrice * this.currency.GBP
						}
					})
					this.dataArray.splice(index, 1, { ...result.data, isCheck: false })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on saving Steps", isShow: true, type: "error" })
				}
			},
			async setFilter({ option, prop }) {
				this[prop] = option
				await this.getLangs(this.allFilters)
			},
			async getCurrency() {
				try {
					const result = await this.$http.get("/currency/currency-ratio")
					this.currency = result.data
				} catch (err) {
					this.alertToggle({ message: "Error on getting currency", isShow: true, type: "error" })
				}
			}
		},
		watch: {
			async isRefresh() {
				if (this.isRefresh) {
					await this.getCurrency()
					this.getLangs(this.allFilters)
				}
			}
		},
		computed: {
			isAllSelected() {
				return (this.dataArray && this.dataArray.length) && this.dataArray.every(i => !!i.isCheck)
			},
			allFilters() {
				let result = {
					typeFilter: this.typeFilter,
					sourceFilter: this.sourceFilter,
					targetFilter: this.targetFilter
				}
				if (this.typeFilter === "All") result.typeFilter = ""
				if (this.sourceFilter === "All") result.sourceFilter = ""
				if (this.targetFilter === "All") result.targetFilter = ""

				return result
			}
		},
		components: {
			GeneralTable,
			SetPriceModal,
			Button,
			CheckBox,
			LangFilter
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/generalTable";
  @import "../../../assets/scss/colors.scss";

  .button {
    position: absolute;
    right: 20px;
    top: 110px;
  }

  .price {
    background-color: #fff;
    box-shadow: none;

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type=number] {
      -moz-appearance: textfield;
    }

    label {
      margin-left: 3px;
    }

    &__data-input {
      @extend %editing-input;
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