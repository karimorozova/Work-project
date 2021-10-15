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

    GeneralTable(
      :fields="fields"
      :tableData="dataArray"
    )

      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .price__header(v-if="field.headerKey === 'headerCheck' && isEdit && dataArray.length")
          CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        .price__header(v-else) {{ field.label }}

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
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						style: { "width": "81%" }
					},
					{
						label: "Multiplier %",
						headerKey: "headerMultiplier",
						key: "multiplier",
						style: { "width": "15%" }
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
			GeneralTable,
			SetPriceModal,
			Button,
			CheckBox
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