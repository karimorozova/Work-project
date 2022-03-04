<template lang="pug">
  .price
    .modal(v-if="isUpdateModal")
      SetPriceModal(
        @close="closeUpdateModal"
        @setPrice="setPrice"
        :i="i"
        :length="length"
      )
    .button(v-if="finalData.some(it => !!it.isCheck)")
      Button(value="Update Selected" @clicked="openUpdateModal")

    .table
      GeneralTable(
        :fields="fields",
        :tableData="finalData"
        :isFilterShow="true"
        :isFilterAbsolute="true"

        @addSortKey="addSortKey"
        @changeSortKey="changeSortKey"
        @removeSortKey="removeSortKey"
        @setFilter="setFilter"
        @removeFilter="removeFilter"
        @clearAllFilters="clearAllFilters"
      )
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .table__header(v-if="field.headerKey === 'headerCheck' && isEdit")
            CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
          .table__header(v-else) {{ field.label }}

        template(slot="check" slot-scope="{ row, index }")
          .table__data(v-if="isEdit")
            CheckBox(:isChecked="row.isCheck" @check="toggleCheck(row, true)" @uncheck="toggleCheck(row, false)")

        template(slot="sourceLanguage", slot-scope="{ row, index }")
          .table__data {{ row.sourceLanguage.lang }}

        template(slot="targetLanguage", slot-scope="{ row, index }")
          .table__data {{ row.targetLanguage.lang }}

        template(slot="basicPrice", slot-scope="{ row, index }")
          .table__data(v-if="!isEdit")
            span#currencyType {{ row.basicPrice }}
            label(for="currencyType" v-if="currentVendor.currency === 'EUR'" ) &euro;
            label(for="currencyType" v-if="currentVendor.currency === 'USD'" ) &#36;
            label(for="currencyType" v-if="currentVendor.currency === 'GBP'" ) &pound;

          .table__data(v-else)
            input(type="number" @change="setRowValue(row)" v-model="finalData[index].basicPrice")

        template(slot="icons", slot-scope="{ row, index }")
          .table__icons
            .altered(v-if="row.altered")
              .tooltip
                span#myTooltip.tooltiptext {{ row.notification }}
                .table__icons-info
                  i.fas.fa-info-circle
            .link(v-if="isEdit && row.isActive")
              span(v-if="row.altered && isEdit")
                .table__icons-link(@click="getRowPrice(row)")
                  i.fa.fa-link(aria-hidden="true")
              span(v-else)
                .table__icons-link-opacity
                  i.fa.fa-link(aria-hidden="true")

      .table__empty(v-if="!finalData.length") Nothing found...
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import CheckBox from "../../CheckBox"
	import SetPriceModal from "../../finance/pricelistSettings/SetPriceModal"
	import Button from "../../Button"
	import GeneralTable from "../../GeneralTable"
	import tableSortAndFilter from "../../../mixins/tableSortAndFilter"

	export default {
		mixins: [ tableSortAndFilter ],
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
						style: { width: "4%" }
					},
					{
						label: "Source",
						headerKey: "headerSourceLang",
						key: "sourceLanguage",
						dataKey: "lang",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { width: "36%" }
					},
					{
						label: "Target",
						headerKey: "headerTargetLang",
						key: "targetLanguage",
						dataKey: "lang",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { width: "36%" }
					},
					{
						label: "Price",
						headerKey: "headerBasicPriceEUR",
						key: "basicPrice",
						style: { width: "12%" }
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						style: { width: "12%" }
					}
				],
				currency: {},
				isDataRemain: true,
				isUpdateModal: false,
				i: 0,
				length: 0
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				storeCurrentVendor: "storeCurrentVendor"
			}),
			getIndex(id) {
				return this.finalData.findIndex(({ _id }) => `${ _id }` === `${ id }`)
			},
			async setPrice(price) {
				this.length = this.finalData.filter(i => !!i.isCheck).length
				for await (let [ index, row ] of this.finalData.filter(i => !!i.isCheck).entries()) {
					this.i = index + 1
					row.basicPrice = price
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
				this.$emit('toggleCheck', { row, val, prop: 'basicPricesTable' })
			},
			toggleAll(val) {
				this.$emit('toggleAll', { val, prop: 'basicPricesTable' })
			},
			async getRowPrice(row) {
				try {
					await this.$http.post("/vendorsapi/rates/sync-cost/" + this.vendorId, {
						tableKey: "Basic Price Table",
						row: this.finalData[this.getIndex(row._id)]
					})
					const result = await this.$http.post(`/vendorsapi/vendor-rate-by-key`, { id: this.vendorId, key: 'basicPricesTable' })
					this.vendor.rates.basicPricesTable = result.data
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
				if (this.finalData[this.getIndex(row._id)].basicPrice === "") this.finalData[this.getIndex(row._id)].basicPrice = 0.1
				await this.manageSaveClick(row)
			},
			refreshResultTable() {
				this.$emit("refreshResultTable")
			},
			async manageSavePrice({ _id, type, sourceLanguage, targetLanguage, basicPrice }) {
				try {
					await this.$http.post("/vendorsapi/rates/" + this.vendorId, {
						itemIdentifier: "Basic Price Table",
						updatedItem: {
							_id,
							type,
							sourceLanguage,
							targetLanguage,
							basicPrice: parseFloat(basicPrice).toFixed(4),
							altered: true
						}
					})
					const updatedData = await this.$http.get("/vendorsapi/rates/" + this.vendorId)
					this.vendor.rates.basicPricesTable = updatedData.data.basicPricesTable
					await this.storeCurrentVendor(this.vendor)
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on saving Languages pricelist", isShow: true, type: "error" })
				}
			},
			async manageSaveClick(row) {
				const { _id, type, sourceLanguage, targetLanguage, basicPrice } = this.finalData[this.getIndex(row._id)]
				try {
					await this.$http.post("/vendorsapi/rates/" + this.vendorId, {
						itemIdentifier: "Basic Price Table",
						updatedItem: {
							_id,
							type,
							sourceLanguage,
							targetLanguage,
							basicPrice: parseFloat(basicPrice).toFixed(4),
							altered: true
						}
					})
					const updatedData = await this.$http.get("/vendorsapi/rates/" + this.vendorId)
					this.vendor.rates.basicPricesTable = updatedData.data.basicPricesTable
					await this.storeCurrentVendor(this.vendor)
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on saving Languages pricelist", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			...mapGetters({
				currentVendor: "getCurrentVendor"
			}),
			isAllSelected() {
				return (this.finalData && this.finalData.length) && this.finalData.every(i => i.isCheck)
			},
			rawData() {
				return this.dataArray
			}
		},
		components: {
			GeneralTable,
			Button,
			SetPriceModal,
			CheckBox
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .table {
    &__header,
    &__data {
      padding: 0 6px;
    }

    &__empty {
      opacity: 0.5;
      margin-top: 10px;
    }

    &__icons {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 7px;
      width: 100%;
      height: 40px;

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

  label {
    margin-left: 3px;
  }

  .button {
    position: absolute;
    left: 20px;
    margin-top: -75px;
  }

  .tooltip {
    position: relative;
    display: flex;

    .tooltiptext {
      visibility: hidden;
      font-size: 14px;
      width: max-content;
      background-color: white;
      color: $text;
      text-align: center;
      border-radius: 2px;
      right: 28px;
      bottom: -7px;
      padding: 7px 12px;
      position: absolute;
      z-index: 1;
      opacity: 0;
      transition: opacity .3s;
      border: 1px solid $border;

      &::after {
        content: "";
        position: absolute;
        top: 30%;
        right: -12px;
        transform: rotate(270deg);
        border-width: 6px;
        border-style: solid;
        border-color: $border transparent transparent;
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