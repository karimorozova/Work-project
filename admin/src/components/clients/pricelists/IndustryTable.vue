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

        template(slot="industry" slot-scope="{ row, index }")
          .table__data {{ row.industry.name }}

        template(slot="multiplier" slot-scope="{ row, index }")
          .table__data(v-if="!isEdit")
            span(id="multiplier") {{row.multiplier}}
            label(for="multiplier") &#37;
          .table__data(v-else)
            input(type="number" @change="setRowValue(row)" v-model="finalData[index].multiplier")

        template(slot="icons" slot-scope="{ row, index }")
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
	import DataTable from "../../DataTable"
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
				isUpdateModal: false,
				i: 0,
				length: 0,
				fields: [
					{
						label: "",
						headerKey: "headerCheck",
						key: "check",
						style: { width: "4%" }
					},
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						dataKey: "name",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { width: "72%" }
					},
					{
						label: "%",
						headerKey: "headerMultiplier",
						key: "multiplier",
						style: { width: "12%" }
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						style: { width: "12%" }
					}
				]
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				setUpClientRatesProp: "setUpClientRatesProp"
			}),
			getIndex(id) {
				return this.finalData.findIndex(({ _id }) => `${ _id }` === `${ id }`)
			},
			async setPrice(price) {
				this.length = this.finalData.filter(i => !!i.isCheck).length
				for await (let [ index, row ] of this.finalData.filter(i => !!i.isCheck).entries()) {
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
				this.$emit('toggleCheck', { row, val, prop: 'industryMultipliersTable' })
			},
			toggleAll(val) {
				this.$emit('toggleAll', { val, prop: 'industryMultipliersTable' })
			},
			async getRowPrice(row) {
				try {
					await this.$http.post("/clientsapi/rates/sync-cost/" + this.clientId, {
						tableKey: "Industry Multipliers Table",
						row: this.finalData[this.getIndex(row._id)]
					})
					const result = await this.$http.post(`/clientsapi/client-rate-by-key`, { id: this.clientId, key: 'industryMultipliersTable' })
					this.setUpClientRatesProp({ id: this.$route.params.id, key: 'industryMultipliersTable', value: result.data })
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
				if (this.finalData[this.getIndex(row._id)].multiplier === "") this.finalData[this.getIndex(row._id)].multiplier = 100
				await this.manageSaveClick(row)
			},
			refreshResultTable() {
				this.$emit("refreshResultTable")
			},
			async manageSavePrice({ _id, industry, multiplier }) {
				try {
					await this.$http.post("/clientsapi/rates/" + this.clientId, {
						itemIdentifier: "Industry Multipliers Table",
						updatedItem: {
							_id,
							industry,
							multiplier: parseFloat(multiplier).toFixed(0),
							altered: true
						}
					})
					const updatedData = await this.$http.get("/clientsapi/rates/" + this.clientId)
					this.setUpClientRatesProp({ id: this.$route.params.id, key: 'industryMultipliersTable', value: updatedData.data.industryMultipliersTable })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on getting Industry", isShow: true, type: "error" })
				}
			},
			async manageSaveClick(row) {
				try {
					const { _id, industry, multiplier } = this.finalData[this.getIndex(row._id)]
					await this.$http.post("/clientsapi/rates/" + this.clientId, {
						itemIdentifier: "Industry Multipliers Table",
						updatedItem: {
							_id,
							industry,
							multiplier: parseFloat(multiplier).toFixed(0),
							altered: true
						}
					})
					const updatedData = await this.$http.get("/clientsapi/rates/" + this.clientId)
					this.setUpClientRatesProp({ id: this.$route.params.id, key: 'industryMultipliersTable', value: updatedData.data.industryMultipliersTable })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on getting Industry", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient"
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
			CheckBox,
			DataTable
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
