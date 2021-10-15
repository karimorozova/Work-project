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
        :tableData="finalData",
        :isFilterShow="true"
        :isFilterAbsolute="true"

        @addSortKey="addSortKey"
        @changeSortKey="changeSortKey"
        @removeSortKey="removeSortKey"
        @setFilter="setFilter"
        @removeFilter="removeFilter"
        @clearAllFilters="clearAllFilters"
      )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header(v-if="field.headerKey === 'headerCheck' && isEdit")
            CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
          .table__header(v-else) {{ field.label }}

        template(slot="check" slot-scope="{ row, index }")
          .table__data(v-if="isEdit")
            CheckBox(:isChecked="row.isCheck" @check="toggleCheck(row, true)" @uncheck="toggleCheck(row, false)")

        template(slot="sourceLanguage" slot-scope="{ row, index }")
          .table__data {{ row.sourceLanguage.lang }}

        template(slot="targetLanguage" slot-scope="{ row, index }")
          .table__data {{ row.targetLanguage.lang }}

        template(slot="step" slot-scope="{ row, index }")
          .table__data {{ row.step.title }}

        template(slot="unit" slot-scope="{ row, index }")
          .table__data {{ row.unit.type }}

        template(slot="industry" slot-scope="{ row, index }")
          .table__data {{ row.industry.name }}

        template(slot="price" slot-scope="{ row, index }")
          .table__data(v-if="!isEdit")
            span(id="currencyType") {{row.price}}
            label(for="currencyType" v-if="currentClient.currency === 'EUR'" ) &euro;
            label(for="currencyType" v-if="currentClient.currency === 'USD'" ) &#36;
            label(for="currencyType" v-if="currentClient.currency === 'GBP'" ) &pound;

          .table__data(v-else)
            input(type="number" @change="setRowValue(row)" v-model="row.price")

        template(slot="icons" slot-scope="{ row, index }")
          .table__icons
            .altered(v-if="row.altered")
              .tooltip
                span#myTooltip.tooltiptext {{ row.notification }}
                .table__icons-info
                  i.fas.fa-info-circle

            .link(v-if="isEdit")
              span(v-if="row.altered && isEdit")
                .table__icons-link(@click="getRowPrice(index, row)")
                  i.fa.fa-link(aria-hidden='true')
              span(v-else)
                .table__icons-link-opacity
                  i.fa.fa-link(aria-hidden='true')

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
			clientId: {
				type: String
			},
			isRefreshResultTable: {
				type: Boolean
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
						headerKey: "headerLanguageSource",
						key: "sourceLanguage",
						dataKey: "lang",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { width: "16.5%" }
					},
					{
						label: "Target",
						headerKey: "headerLanguageTarget",
						key: "targetLanguage",
						dataKey: "lang",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { width: "16.5%" }
					},
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						dataKey: "title",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { width: "13%" }
					},
					{
						label: "Unit",
						headerKey: "headerUnit",
						key: "unit",
						dataKey: "type",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { width: "13%" }
					},
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						dataKey: "name",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { width: "13%" }
					},
					{
						label: "Price",
						headerKey: "headerPrice",
						key: "price",
						style: { width: "13%" }
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						style: { width: "11%" }
					}
				],

				isDataRemain: true,
				currentServices: null,
				isUpdateModal: false,
				i: 0,
				length: 0
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				updateClientRatesProp: "updateClientRatesProp"
			}),
			async setPrice(price) {
				this.length = this.finalData.filter(i => !!i.isCheck).length
				for await (let [ index, row ] of this.finalData.filter(i => !!i.isCheck).entries()) {
					this.i = index + 1
					row.price = price
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
				this.$emit('toggleCheck', { row, val, prop: 'pricelistTable' })
			},
			toggleAll(val) {
				this.$emit('toggleAll', { val, prop: 'pricelistTable' })
			},
			async getRowPrice(index, row) {
				try {
					await this.$http.post("/clientsapi/rates/sync-cost/" + this.clientId, {
						tableKey: "Pricelist Table",
						row
					})
					this.updateClientRatesProp({ key: "pricelistTable" })
				} catch (err) {
					this.alertToggle({ message: "Impossible update price", isShow: true, type: "error" })
				}
			},
			async setRowValue(row) {
				await this.checkErrors(row)
			},
			async checkErrors(row) {
				if (!this.isEdit) return
				if (row.price === "") row.price = 1
				await this.manageSaveClick(row)
			},
			async manageSavePrice({ _id, price }) {
				try {
					await this.$http.post("/clientsapi/rates/change-pricelist/" + this.clientId, {
						_id,
						price: parseFloat(price).toFixed(4),
						altered: true,
						notification: "Price disconnected from function"
					})
					this.updateClientRatesProp({ key: "pricelistTable" })
				} catch (err) {
					this.alertToggle({ message: "Error on saving Result pricelist", isShow: true, type: "error" })
				}
			},
			async manageSaveClick(row) {
				const { _id, price } = row
				try {
					await this.$http.post("/clientsapi/rates/change-pricelist/" + this.clientId, {
						_id,
						price: parseFloat(price).toFixed(4),
						altered: true,
						notification: "Price disconnected from function"
					})
					this.updateClientRatesProp({ key: "pricelistTable" })
				} catch (err) {
					this.alertToggle({ message: "Error on saving Result pricelist", isShow: true, type: "error" })
				}
			},
			async getClientServices() {
				this.currentServices = this.currentClient.services
			}
		},
		created() {
			this.getClientServices()
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient"
			}),
			isAllSelected() {
				return (this.finalData && this.finalData.length) && this.finalData.every(i => i.isCheck)
			},
			rawData() {
				return this.dataArray.filter(i => !!i.isActive)
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
    left: 590px;
    margin-top: -78px;
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
      border-radius: 4px;
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
