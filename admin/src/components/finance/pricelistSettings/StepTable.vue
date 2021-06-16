<template lang="pug">
  .price
    .modal(v-if="isUpdateModal")
      SetPriceModal(
        @close="closeUpdateModal"
        @setPrice="setPrice"
        :i="i"
        :length="length"
      )
    .button(v-if="dataArray.some(i => !!i.isCheck)")
      Button(value="Update Selected" @clicked="openUpdateModal")

    StepFilter(
      :step="stepFilter"
      :unit="unitFilter"
      :size="sizeFilter"
      :steps="steps"
      :units="units"
      :sizes="sizes"
      @setFilter="setFilter"
    )
    DataTable(
      :fields="fields"
      :tableData="dataArray"
      :bodyClass="['setting-table-body', {'tbody_visible-overflow': dataArray.length < 3}]"
      :tableheadRowClass="dataArray.length < 3 ? 'tbody_visible-overflow' : ''"
      bodyRowClass="settings-table-row"
      bodyCellClass="settings-table-cell"
      @bottomScrolled="bottomScrolled"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .price-title(v-if="field.headerKey === 'headerCheck' && isEdit")
          CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        .price-title(v-else) {{ field.label }}

      template(slot="check" slot-scope="{ row, index }")
        .price__data(v-if="isEdit")
          | {{row.isCheck}}
          CheckBox(:isChecked="!!row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

      template(slot="step" slot-scope="{ row, index }")
        .price__data {{ row.step.title }}

      template(slot="unit" slot-scope="{ row, index }")
        .price__data {{ row.unit.type }}

      template(slot="size" slot-scope="{ row, index }")
        .price__data {{ row.size }}

      template(slot="multiplier" slot-scope="{ row, index }")
        .price__data(v-if="!isEdit")
          span(id="multiplier") {{row.multiplier}}
          label(for="multiplier") &#37;
        .price__editing-data(v-else)
          input.price__data-input(type="number"  @change="setRowValue(index)" v-model="dataArray[index].multiplier")

      template(slot="eur" slot-scope="{ row, index }")
        .price__data(v-if="!isEdit")
          span(v-if="!row.euroMinPrice")
            span n/a
          span(v-else)
            span(id="eur") {{row.euroMinPrice}}
            label(for="eur") &euro;
        .price__editing-data(v-else)
          input.price__data-input(type="number"  @change="setRowValue(index)"  v-model="dataArray[index].euroMinPrice")

      template(slot="usd" slot-scope="{ row, index }")
        .price__data(v-if="!isEdit")
          span(v-if="!row.usdMinPrice")
            span n/a
          span(v-else)
            span(id="usd") {{row.usdMinPrice}}
            label(for="usd") &#36;
        .price__data(v-else)
          input.price__data-input(type="number" :value="dataArray[index].usdMinPrice" disabled)

      template(slot="gbp" slot-scope="{ row, index }")
        .price__data(v-if="!isEdit")
          span(v-if="!row.gbpMinPrice")
            span n/a
          span(v-else)
            span(id="gbp") {{row.gbpMinPrice}}
            label(for="gbp") &pound;
        .price__data(v-else)
          input.price__data-input(type="number" :value="dataArray[index].gbpMinPrice" disabled)

    .price__empty(v-if="!dataArray.length") Nothing found...
</template>
<script>
	import DataTable from "../../DataTable"
	import StepFilter from "./StepFilter"
	import { mapActions } from "vuex"
	import CheckBox from "../../CheckBox"
	import Button from "../../Button"
	import SetPriceModal from "./SetPriceModal"

	export default {
		props: {
			steps: {
				type: Array
			},
			units: {
				type: Array
			},
			sizes: {
				type: Array
			},
			priceId: {
				type: String
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
						width: "4%",
						padding: 0
					},
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						width: "23%",
						padding: "0"
					},
					{
						label: "Unit",
						headerKey: "headerUnit",
						key: "unit",
						width: "23%",
						padding: "0"
					},
					{
						label: "Size",
						headerKey: "headerSize",
						key: "size",
						width: "10%",
						padding: "0"
					},
					{
						label: "Multiplier %",
						headerKey: "headerMultiplier",
						key: "multiplier",
						width: "10%",
						padding: "0"
					},
					{
						label: "Fix EUR",
						headerKey: "headerMinPriceEUR",
						key: "eur",
						width: "10%",
						padding: "0"
					},
					{
						label: "Fix USD",
						headerKey: "headerMinPriceUSD",
						key: "usd",
						width: "10%",
						padding: "0"
					},
					{
						label: "Fix GBP",
						headerKey: "headerMinPriceGBP",
						key: "gbp",
						width: "10%",
						padding: "0"
					}
				],
				dataArray: [],

				currency: {},

				stepFilter: "",
				unitFilter: "",
				sizeFilter: "",
				isDataRemain: true,
				i: 0,
				length: 0
			}
		},
		created() {
			this.getCurrency()
			this.getSteps(this.allFilters)
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
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post("/pricelists/step-multipliers/" + this.priceId, {
						...this.allFilters,
						countFilter: this.dataArray.length
					})
					this.dataArray.push(...result.data.map(i => ({ ...i, isCheck: false })))
					this.isDataRemain = result.body.length === 25
				}
			},
			async setRowValue(index) {
				await this.checkErrors(index)
			},
			async checkErrors(index) {
				if (!this.isEdit) return
				if (this.dataArray[index].multiplier === "") this.dataArray[index].multiplier = 100
				if (this.dataArray[index].euroMinPrice === "") this.dataArray[index].euroMinPrice = 0
				await this.manageSaveClick(index)
			},
			async getSteps(filters, count = 0) {
				try {
					const result = await this.$http.post("/pricelists/step-multipliers/" + this.priceId, {
						...filters,
						countFilter: count
					})
					this.dataArray = result.data.map(i => ({ ...i, isCheck: false }))
				} catch (err) {
					this.alertToggle({
						message: "Error on getting Steps",
						isShow: true,
						type: "error"
					})
				}
			},
			refreshResultTable() {
				this.$emit('refreshResultTable')
			},
			async manageSavePrice({ _id, step, unit, size, multiplier, euroMinPrice }) {
				try {
					const result = await this.$http.post("/pricelists/step-multipliers-update/" + this.priceId, {
						stepMultiplier: {
							_id,
							step,
							unit,
							size,
							multiplier: parseFloat(multiplier).toFixed(0),
							usdMinPrice: euroMinPrice * this.currency.USD,
							euroMinPrice,
							gbpMinPrice: euroMinPrice * this.currency.GBP
						}
					})
					this.dataArray.splice(idx(this.dataArray, _id), 1, { ...result.data, isCheck: false })

					function idx(arr, id) {
						return arr.findIndex(({ _id }) => `${ _id }` === `${ id }`)
					}

					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on saving Steps", isShow: true, type: "error" })
				}
			},
			async manageSaveClick(index) {
				const { _id, step, unit, size, multiplier, euroMinPrice } = this.dataArray[index]
				try {
					const result = await this.$http.post("/pricelists/step-multipliers-update/" + this.priceId, {
						stepMultiplier: {
							_id,
							step,
							unit,
							size,
							multiplier: parseFloat(multiplier).toFixed(0),
							usdMinPrice: euroMinPrice * this.currency.USD,
							euroMinPrice,
							gbpMinPrice: euroMinPrice * this.currency.GBP
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
				await this.getSteps(this.allFilters)
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
					this.getSteps(this.allFilters)
				}
			}
		},
		computed: {
			isAllSelected() {
				return this.dataArray && this.dataArray.length && this.dataArray.every(i => !!i.isCheck)
			},
			allFilters() {
				let result = {
					stepFilter: this.stepFilter,
					unitFilter: this.unitFilter,
					sizeFilter: this.sizeFilter
				}
				if (this.stepFilter === "All") result.stepFilter = ""
				if (this.unitFilter === "All") result.unitFilter = ""
				if (this.sizeFilter === "All") result.sizeFilter = ""

				return result
			}
		},
		components: {
			SetPriceModal,
			Button,
			CheckBox,
			DataTable,
			StepFilter
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .price {
    background-color: #fff;

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

    &__data,
    &__editing-data {
      height: 31px;
      padding: 0 5px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      overflow-y: auto;
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
