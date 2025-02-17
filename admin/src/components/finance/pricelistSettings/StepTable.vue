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
      StepFilter(
        :step="stepFilter"
        :unit="unitFilter"
        :size="sizeFilter"
        :steps="steps"
        :units="units"
        :sizes="sizes"
        @setFilter="setFilter"
      )

    GeneralTable(
      :fields="fields"
      :tableData="dataArray"
      @bottomScrolled="bottomScrolled"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .price__header(v-if="field.headerKey === 'headerCheck' && isEdit && dataArray.length")
          CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        .price__header(v-else) {{ field.label }}

      template(slot="check" slot-scope="{ row, index }")
        .price__data(v-if="isEdit")
          CheckBox(:isChecked="!!row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

      template(slot="step" slot-scope="{ row, index }")
        .price__data {{ row.step.title }}

      template(slot="unit" slot-scope="{ row, index }")
        .price__data {{ row.unit.type }}

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
        .price__data
          span(v-if="!row.usdMinPrice")
            span n/a
          span(v-else)
            span(id="usd") {{row.usdMinPrice}}
            label(for="usd") &#36;
        //.price__data(v-else)
          input.price__data-input(type="number" :value="dataArray[index].usdMinPrice" disabled)

      template(slot="gbp" slot-scope="{ row, index }")
        .price__data
          span(v-if="!row.gbpMinPrice")
            span n/a
          span(v-else)
            span(id="gbp") {{row.gbpMinPrice}}
            label(for="gbp") &pound;
        //.price__data(v-else)
          input.price__data-input(type="number" :value="dataArray[index].gbpMinPrice" disabled)

    .price__empty(v-if="!dataArray.length") Nothing found...
</template>
<script>
	import StepFilter from "./StepFilter"
	import { mapActions } from "vuex"
	import CheckBox from "../../CheckBox"
	import Button from "../../Button"
	import SetPriceModal from "./SetPriceModal"
	import GeneralTable from "../../GeneralTable"

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
						style: { "width": "4%" }
					},
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						style: { "width": "23%" }
					},
					{
						label: "Unit",
						headerKey: "headerUnit",
						key: "unit",
						style: { "width": "23%" }
					},
					{
						label: "Multiplier %",
						headerKey: "headerMultiplier",
						key: "multiplier",
						style: { "width": "12.5%" }
					},
					{
						label: "Fix EUR",
						headerKey: "headerMinPriceEUR",
						key: "eur",
						style: { "width": "12.5%" }
					},
					{
						label: "Fix USD",
						headerKey: "headerMinPriceUSD",
						key: "usd",
						style: { "width": "12.5%" }
					},
					{
						label: "Fix GBP",
						headerKey: "headerMinPriceGBP",
						key: "gbp",
						style: { "width": "12.5%" }
					}
				],
				dataArray: [],

				currency: {},

				stepFilter: "",
				unitFilter: "",
				sizeFilter: "",
				isDataRemain: true,
				i: 0,
				length: 0,
				isUpdateModal: false
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
					row.euroMinPrice = price
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
					this.isDataRemain = result.data.length === 25
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
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on saving Steps", isShow: true, type: "error" })
				}

				function idx(arr, id) {
					return arr.findIndex(({ _id }) => `${ _id }` === `${ id }`)
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
			GeneralTable,
			SetPriceModal,
			Button,
			CheckBox,
			StepFilter
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

    &__data {
      padding: 0 7px;
    }

    &__header {
      padding: 0 7px;
    }

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
