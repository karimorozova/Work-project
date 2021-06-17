<template lang="pug">
  .price
    .modal(v-if="isUpdateModal")
      SetPriceModal(
        @close="closeUpdateModal"
        @setPrice="setPrice"
        :i="i"
        :length="length"
        :isPercent="true"
      )
    .button(v-if="dataArray.some(it => !!it.isCheck)")
      Button(value="Update Selected" @clicked="openUpdateModal")

    DataTable(
      :fields="fields"
      :tableData="dataArray"
      :bodyClass="['setting-table-body', {'tbody_visible-overflow': dataArray.length < 3}]"
      :tableheadRowClass="dataArray.length < 3 ? 'tbody_visible-overflow' : ''"
      bodyRowClass="settings-table-row"
      bodyCellClass="settings-table-cell"
    )

      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .price-title(v-if="field.headerKey === 'headerCheck' && isEdit && dataArray.length")
          CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        .price-title(v-else) {{ field.label }}

      template(slot="check" slot-scope="{ row, index }")
        .price__data(v-if="isEdit")
          CheckBox(:isChecked="row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

      template(slot="industry" slot-scope="{ row, index }")
        .price__data {{ row.industry.name }}

      template(slot="multiplier" slot-scope="{ row, index }")
        .price__data(v-if="!isEdit")
          span(id="multiplier") {{ row.multiplier }}
          label(for="multiplier") &#37;
        .price__editing-data(v-else)
          input.price__data-input(type="number" @change="setRowValue(index)" v-model="dataArray[index].multiplier")

</template>
<script>
	import DataTable from "../../DataTable"
	import { mapActions } from "vuex"
	import CheckBox from "../../CheckBox"
	import Button from "../../Button"
	import SetPriceModal from "./SetPriceModal"

	export default {
		props: {
			priceId: {
				type: String
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
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						width: "81%",
						padding: "0"
					},
					{
						label: "Multiplier %",
						headerKey: "headerMultiplier",
						key: "multiplier",
						width: "15%",
						padding: "0"
					}
				],
				dataArray: [],

				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1,
				currentActive: -1,
				i: 0,
				length: 0,
				isUpdateModal: false
			}
		},
		created() {
			this.getIndustries()
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			async setPrice(price) {
				this.length = this.dataArray.filter(i => !!i.isCheck).length
				for await (let [ index, row ] of this.dataArray.filter(i => !!i.isCheck).entries()) {
					this.i = index + 1
					row.multiplier = price
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
			async getIndustries() {
				try {
					const result = await this.$http.get("/pricelists/industry-multipliers/" + this.priceId)
					this.dataArray = result.data.map(i => ({ ...i, isCheck: false }))
				} catch (err) {
					this.alertToggle({ message: "Error on getting Industries", isShow: true, type: "error" })
				}
			},

			async setRowValue(index) {
				await this.checkErrors(index)
			},
			async checkErrors(index) {
				if (!this.isEdit) return
				if (this.dataArray[index].multiplier === "") this.dataArray[index].multiplier = 100
				await this.manageSaveClick(index)
			},
			refreshResultTable() {
				this.$emit('refreshResultTable')
			},
			async manageSavePrice({ _id, industry, multiplier }) {
				try {
					const result = await this.$http.post("/pricelists/industry-multipliers/" + this.priceId, {
						industryMultiplier: {
							_id,
							industry,
							multiplier: parseFloat(multiplier).toFixed(0)
						}
					})
					this.dataArray.splice(idx(this.dataArray, _id), 1, { ...result.data, isCheck: false })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on getting Industry", isShow: true, type: "error" })
				}

				function idx(arr, id) {
					return arr.findIndex(({ _id }) => `${ _id }` === `${ id }`)
				}
			},
			async manageSaveClick(index) {
				const { _id, industry, multiplier } = this.dataArray[index]
				try {
					const result = await this.$http.post("/pricelists/industry-multipliers/" + this.priceId, {
						industryMultiplier: {
							_id,
							industry,
							multiplier: parseFloat(multiplier).toFixed(0)
						}
					})
					this.dataArray.splice(index, 1, { ...result.data, isCheck: false })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on getting Industry", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			isAllSelected() {
				return (this.dataArray && this.dataArray.length) && this.dataArray.every(i => i.isCheck)
			}
		},
		components: {
			SetPriceModal,
			Button,
			CheckBox,
			DataTable
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

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