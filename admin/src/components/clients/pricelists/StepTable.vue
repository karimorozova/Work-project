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
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .table__header(v-if="field.headerKey === 'headerCheck' && isEdit")
            CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
          .table__header(v-else) {{ field.label }}

        template(slot="check" slot-scope="{ row, index }")
          .table__data(v-if="isEdit && row.isActive")
            CheckBox(:isChecked="row.isCheck" @check="toggleCheck(row, true)" @uncheck="toggleCheck(row, false)")

        template(slot="step", slot-scope="{ row, index }")
          .table__data(:class="{'opacity-05': !row.isActive}") {{ row.step.title }}

        template(slot="unit", slot-scope="{ row, index }")
          .table__data(:class="{'opacity-05': !row.isActive}") {{ row.unit.type }}

        template(slot="multiplier", slot-scope="{ row, index }")
          .table__data(v-if="isEdit && row.isActive")
            input(type="number" @change="setRowValue(row)" v-model="finalData[index].multiplier")

          .table__data(v-if="isEdit && !row.isActive")
            span(:class="{'opacity-05': !row.isActive}") {{ row.multiplier }}

          .table__data(v-if="!isEdit")
            span#multiplier {{ row.multiplier }}
            label(for="multiplier") &#37;

        template(slot="icons", slot-scope="{ row, index }")
          .table__icons
            .altered(v-if="row.altered && row.isActive")
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
            .toggle(v-if="isEdit")
              Toggler(
                :isDisabled="false"
                :isActive="row.isActive"
                @toggle="toggleActive(row)"
              )

      .table__empty(v-if="!finalData.length") Nothing found...
</template>
<script>
	import DataTable from "../../DataTable"
	import { mapGetters, mapActions } from "vuex"
	import CheckBox from "../../CheckBox"
	import SetPriceModal from "../../finance/pricelistSettings/SetPriceModal"
	import Button from "../../Button"
	import Toggler from "../../Toggler"
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
				fields: [
					{
						label: "",
						headerKey: "headerCheck",
						key: "check",
						style: { width: "4%" }
					},
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						dataKey: "title",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { width: "36%" }
					},
					{
						label: "Unit",
						headerKey: "headerUnit",
						key: "unit",
						dataKey: "type",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { width: "36%" }
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
				],
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
			async toggleActive(row) {
				row.isActive = !row.isActive
				try {
					const rates = await this.$http.post('/pricelists/hide-and-show-vendor-clients-rates', {
						entityId: this.$route.params.id,
						entityType: 'Client',
						tableName: 'stepMultipliersTable',
						tableRow: row
					})
					this.setUpClientRatesProp({ id: this.$route.params.id, key: 'stepMultipliersTable', value: rates.data.stepMultipliersTable })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Impossible to hide", isShow: true, type: "error" })
				}
			},
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
				this.$emit('toggleCheck', { row, val, prop: 'stepMultipliersTable' })
			},
			toggleAll(val) {
				this.$emit('toggleAll', { val, prop: 'stepMultipliersTable' })
			},
			async getRowPrice(row) {
				try {
					await this.$http.post("/clientsapi/rates/sync-cost/" + this.clientId, {
						tableKey: "Step Multipliers Table",
						row: this.finalData[this.getIndex(row._id)]
					})
					const result = await this.$http.post(`/clientsapi/client-rate-by-key`, { id: this.clientId, key: 'stepMultipliersTable' })
					this.setUpClientRatesProp({ id: this.$route.params.id, key: 'stepMultipliersTable', value: result.data })
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
			async manageSavePrice({ _id, step, unit, size, multiplier }) {
				try {
					await this.$http.post("/clientsapi/rates/" + this.clientId, {
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
					const updatedData = await this.$http.get("/clientsapi/rates/" + this.clientId)
					this.setUpClientRatesProp({ id: this.$route.params.id, key: 'stepMultipliersTable', value: updatedData.data.stepMultipliersTable })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on saving Steps", isShow: true, type: "error" })
				}
			},
			async manageSaveClick(row) {
				const { _id, step, unit, size, multiplier } = this.finalData[this.getIndex(row._id)]
				try {
					await this.$http.post("/clientsapi/rates/" + this.clientId, {
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
					const updatedData = await this.$http.get("/clientsapi/rates/" + this.clientId)
					this.setUpClientRatesProp({ id: this.$route.params.id, key: 'stepMultipliersTable', value: updatedData.data.stepMultipliersTable })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on saving Steps", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient"
			}),
			isAllSelected() {
				return (this.finalData && this.finalData.length) && this.finalData.filter(i => !!i.isActive).every(i => i.isCheck)
			},
			rawData() {
				if (this.isEdit) return this.dataArray
				return this.dataArray.filter(i => !!i.isActive)
			}
		},
		components: {
			GeneralTable,
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
