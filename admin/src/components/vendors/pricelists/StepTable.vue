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
      :fields="fields",
      :tableData="tableData",
      :bodyClass="['client-pricelist-table-body', { 'tbody_visible-overflow': dataArray.length < 6 }]",
      :tableheadRowClass="['client-pricelist-table-head', { 'tbody_visible-overflow': dataArray.length < 6 }]",
      bodyRowClass="client-pricelist-table-row",
      bodyCellClass="client-pricelist-table-cell"
    )
      template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
        .price-title(v-if="field.headerKey === 'headerCheck' && isEdit")
          CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        .price-title(v-else) {{ field.label }}

      template(slot="check" slot-scope="{ row, index }")
        .price__data(v-if="isEdit && row.isActive")
          CheckBox(:isChecked="row.isCheck" @check="toggleCheck(row, true)" @uncheck="toggleCheck(row, false)")

      template(slot="step", slot-scope="{ row, index }")
        .price__data(:class="{'opacity-05': !row.isActive}") {{ row.step.title }}

      template(slot="unit", slot-scope="{ row, index }")
        .price__data(:class="{'opacity-05': !row.isActive}") {{ row.unit.type }}

      template(slot="size", slot-scope="{ row, index }")
        .price__data(:class="{'opacity-05': !row.isActive}") {{ row.size }}

      template(slot="multiplier", slot-scope="{ row, index }")
        .price__editing-data(v-if="isEdit && row.isActive")
          input.price__data-input(type="number" @change="setRowValue(row)" v-model="dataArray[index].multiplier")
        .price__data(v-if="isEdit && !row.isActive")
          span(:class="{'opacity-05': !row.isActive}") {{ row.multiplier }}
        .price__data(v-if="!isEdit")
          span#multiplier {{ row.multiplier }}
          label(for="multiplier") &#37;

      template(slot="icons", slot-scope="{ row, index }")
        .price__icons
          .altered(v-if="row.altered && row.isActive")
            .tooltip
              span#myTooltip.tooltiptext {{ row.notification }}
              .price__icons-info
                i.fas.fa-info-circle
          .link(v-if="isEdit && row.isActive")
            span(v-if="row.altered && isEdit")
              .price__icons-link(@click="getRowPrice(row)")
                i.fa.fa-link(aria-hidden="true")
            span(v-else)
              .price__icons-link-opacity
                i.fa.fa-link(aria-hidden="true")
          .toggle(v-if="isEdit")
            Toggler(
              :isDisabled="false"
              :isActive="row.isActive"
              @toggle="toggleActive(row)"
            )

    .price__empty(v-if="!dataArray.length") Nothing found...
</template>
<script>
	import DataTable from "../../DataTable"
	import { mapActions } from "vuex"
	import CheckBox from "../../CheckBox"
	import SetPriceModal from "../../finance/pricelistSettings/SetPriceModal"
	import Button from "../../Button"
	import Toggler from "../../Toggler"

	export default {
		props: {
			dataArray: {
				type: Array
			},
			vendorId: {
				type: String
			},
			vendor: {
				type: Object
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
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						width: "30%",
						padding: "0"
					},
					{
						label: "Unit",
						headerKey: "headerUnit",
						key: "unit",
						width: "30%",
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
						label: "%",
						headerKey: "headerMultiplier",
						key: "multiplier",
						width: "10%",
						padding: "0"
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						width: "10%",
						padding: "0"
					}
				],
				isUpdateModal: false,
				i: 0,
				length: 0,
				isDataRemain: true
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				storeCurrentVendor: "storeCurrentVendor"
			}),
			async toggleActive(row) {
				row.isActive = !row.isActive
				try {
					const rates = await this.$http.post('/pricelists/hide-and-show-vendor-clients-rates', {
						entityId: this.$route.params.id,
						entityType: 'Vendor',
						tableName: 'stepMultipliersTable',
						tableRow: row
					})
					this.vendor.rates = rates.data
					await this.storeCurrentVendor(this.vendor)
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Impossible to hide", isShow: true, type: "error" })
				}
			},
			getIndex(id) {
				return this.dataArray.findIndex(({ _id }) => `${ _id }` === `${ id }`)
			},
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
			toggleCheck(row, val) {
				this.$emit('toggleCheck', { row, val, prop: 'stepMultipliersTable' })
			},
			toggleAll(val) {
				this.$emit('toggleAll', { val, prop: 'stepMultipliersTable' })
			},
			async getRowPrice(row) {
				try {
					await this.$http.post("/vendorsapi/rates/sync-cost/" + this.vendorId, {
						tableKey: "Step Multipliers Table",
						row: this.dataArray[this.getIndex(row._id)]
					})
					const result = await this.$http.post(`/vendorsapi/vendor-rate-by-key`, { id: this.vendorId, key: 'stepMultipliersTable' })
					this.vendor.rates.stepMultipliersTable = result.data
					await this.storeCurrentVendor(this.vendor)
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Impossible update price", isShow: true, type: "error" })
				}
			},
			async setRowValue(row) {
				await this.checkErrors(row)
			},

			async checkErrors(row) {
				if (!this.isEdit) return
				if (this.dataArray[this.getIndex(row._id)].multiplier === "") this.dataArray[this.getIndex(row._id)].multiplier = 100
				await this.manageSaveClick(row)
			},
			refreshResultTable() {
				this.$emit("refreshResultTable")
			},
			async manageSavePrice({ _id, step, unit, size, multiplier }) {
				try {
					await this.$http.post("/vendorsapi/rates/" + this.vendorId, {
						itemIdentifier: "Step Multipliers Table",
						updatedItem: {
							_id,
							step,
							unit,
							size,
							multiplier: parseFloat(multiplier).toFixed(0),
							altered: true
						}
					})
					const updatedData = await this.$http.get("/vendorsapi/rates/" + this.vendorId)
					this.vendor.rates.stepMultipliersTable = updatedData.data.stepMultipliersTable
					await this.storeCurrentVendor(this.vendor)
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on saving Steps", isShow: true, type: "error" })
				}
			},
			async manageSaveClick(row) {
				const { _id, step, unit, size, multiplier } = this.dataArray[this.getIndex(row._id)]
				try {
					await this.$http.post("/vendorsapi/rates/" + this.vendorId, {
						itemIdentifier: "Step Multipliers Table",
						updatedItem: {
							_id,
							step,
							unit,
							size,
							multiplier: parseFloat(multiplier).toFixed(0),
							altered: true
						}
					})
					const updatedData = await this.$http.get("/vendorsapi/rates/" + this.vendorId)
					this.vendor.rates.stepMultipliersTable = updatedData.data.stepMultipliersTable
					await this.storeCurrentVendor(this.vendor)
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on saving Steps", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			tableData() {
				if (this.isEdit) return this.dataArray
				return this.dataArray.filter(i => !!i.isActive)
			},
			isAllSelected() {
				return (this.dataArray && this.dataArray.length) && this.dataArray.filter(i => !!i.isActive).every(i => i.isCheck)
			}
		},
		components: {
			Toggler,
			Button,
			SetPriceModal,
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

    &__empty {
      font-size: 14px;
      margin-bottom: 15px;
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

  .opacity-05 {
    opacity: 0.5;
  }
</style>
