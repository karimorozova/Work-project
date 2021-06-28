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
    DataTable(
      :fields="fields"
      :tableData="dataArray"
      :bodyClass="['client-pricelist-table-body', {'tbody_visible-overflow': dataArray.length < 6}]"
      :tableheadRowClass="['client-pricelist-table-head', {'tbody_visible-overflow': dataArray.length < 6}]"
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

      template(slot="price" slot-scope="{ row, index }")
        .price__data(v-if="!isEdit")
          span(id="currencyType") {{row.basicPrice}}
          label(for="currencyType" v-if="currentClient.currency === 'EUR'" ) &euro;
          label(for="currencyType" v-if="currentClient.currency === 'USD'" ) &#36;
          label(for="currencyType" v-if="currentClient.currency === 'GBP'" ) &pound;

        .price__editing-data(v-else)
          input.price__data-input(type="number" @change="setRowValue(row)" v-model="dataArray[index].basicPrice")

      template(slot="icons" slot-scope="{ row, index }")
        .price__icons
          .altered(v-if="row.altered")
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

    .price__empty(v-if="!dataArray.length") Nothing found...
</template>
<script>
	import DataTable from "../../DataTable"
	import { mapGetters, mapActions } from "vuex"
	import CheckBox from "../../CheckBox"
	import Button from "../../Button"
	import SetPriceModal from "../../finance/pricelistSettings/SetPriceModal"

	export default {
		props: {
			dataArray: {
				type: Array
			},
			clientId: {
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
						label: "Source",
						headerKey: "headerSourceLang",
						key: "sourceLang",
						width: "35%",
						padding: "0"
					},
					{
						label: "Target",
						headerKey: "headerTargetLang",
						key: "targetLang",
						width: "35%",
						padding: "0"
					},
					{
						label: "B.Price",
						headerKey: "headerBasicPriceEUR",
						key: "price",
						width: "15%",
						padding: "0"
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						width: "11%",
						padding: "0"
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
				setUpClientRatesProp: "setUpClientRatesProp"
			}),
			getIndex(id) {
				return this.dataArray.findIndex(({ _id }) => `${ _id }` === `${ id }`)
			},
			async setPrice(price) {
				this.length = this.dataArray.filter(i => !!i.isCheck).length
				for await (let [ index, row ] of this.dataArray.filter(i => !!i.isCheck).entries()) {
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
					await this.$http.post("/clientsapi/rates/sync-cost/" + this.clientId, {
						tableKey: "Basic Price Table",
						row: this.dataArray[this.getIndex(row._id)]
					})
					const result = await this.$http.post(`/clientsapi/client-rate-by-key`, { id: this.clientId, key: 'basicPricesTable' })
					this.setUpClientRatesProp({ id: this.$route.params.id, key: 'basicPricesTable', value: result.data })
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
				if (this.dataArray[this.getIndex(row._id)].basicPrice === "") this.dataArray[this.getIndex(row._id)].basicPrice = 0.1
				await this.manageSaveClick(row)
			},
			refreshResultTable() {
				this.$emit("refreshResultTable")
			},
			async manageSavePrice({ _id, type, sourceLanguage, targetLanguage, basicPrice }) {
				try {
					await this.$http.post("/clientsapi/rates/" + this.clientId, {
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
					const updatedData = await this.$http.get("/clientsapi/rates/" + this.clientId)
					this.setUpClientRatesProp({ id: this.$route.params.id, key: 'basicPricesTable', value: updatedData.data.basicPricesTable })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on saving Languages pricelist", isShow: true, type: "error" })
				}
			},
			async manageSaveClick(row) {
				const { _id, type, sourceLanguage, targetLanguage, basicPrice } = this.dataArray[this.getIndex(row._id)]
				try {
					await this.$http.post("/clientsapi/rates/" + this.clientId, {
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
					const updatedData = await this.$http.get("/clientsapi/rates/" + this.clientId)
					this.setUpClientRatesProp({ id: this.$route.params.id, key: 'basicPricesTable', value: updatedData.data.basicPricesTable })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on saving Languages pricelist", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient"
			}),

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

  .button {
    position: absolute;
    right: 20px;
    margin-top: -40px;
  }

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
      height: 30px;

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
