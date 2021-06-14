<template lang="pug">
  .price
    DataTable(
      :fields="fields"
      :tableData="dataArray"
      :bodyClass="['client-pricelist-table-body', {'tbody_visible-overflow': dataArray.length < 6}]"
      :tableheadRowClass="['client-pricelist-table-head', {'tbody_visible-overflow': dataArray.length < 6}]"
      bodyRowClass="client-pricelist-table-row"
      bodyCellClass="client-pricelist-table-cell"
    )

      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .price-title {{ field.label }}

      template(slot="industry" slot-scope="{ row, index }")
        .price__data {{ row.industry.name }}

      template(slot="multiplier" slot-scope="{ row, index }")
        .price__data(v-if="!isEdit")
          span(id="multiplier") {{row.multiplier}}
          label(for="multiplier") &#37;
        .price__editing-data(v-else)
          input.price__data-input(type="number" @change="setRowValue(index)" v-model="dataArray[index].multiplier")

      template(slot="icons" slot-scope="{ row, index }")
        .price__icons
          .altered(v-if="row.altered")
            .tooltip
              span(v-if="index <= 1")
                span#myTooltip.tooltiptext-bottom {{ row.notification }}
              span(v-else)
                span#myTooltip.tooltiptext {{ row.notification }}
              img.price__icons-info(:style="{ cursor: 'help' }", src="../../../assets/images/red-info-icon.png")
          span(v-if="row.altered")
            .price__icons-link(@click="getRowPrice(index)")
              i.fa.fa-link(aria-hidden='true')
          span(v-else)
            .price__icons-link-opacity
              i.fa.fa-link(aria-hidden='true')

    .price__empty(v-if="!dataArray.length") Nothing found...

</template>
<script>
	import DataTable from "../../DataTable"
	import { mapGetters, mapActions } from "vuex"

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
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						width: "80%",
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
				]
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				setUpClientRatesProp: "setUpClientRatesProp"
			}),
			async getRowPrice(index) {
				try {
					await this.$http.post("/clientsapi/rates/sync-cost/" + this.clientId, {
						tableKey: "Industry Multipliers Table",
						row: this.dataArray[index]
					})
					const result = await this.$http.post(`/clientsapi/client-rate-by-key`, { id: this.clientId, key: 'industryMultipliersTable' })
					this.setUpClientRatesProp({ id: this.$route.params.id, key: 'industryMultipliersTable', value: result.data })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Impossible update price", isShow: true, type: "error" })
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
				this.$emit("refreshResultTable")
			},
			async manageSaveClick(index) {
				try {
					const { _id, industry, multiplier } = this.dataArray[index]
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
			})
		},
		components: {
			DataTable
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

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

    &__main-icon {
      width: 22px;
      height: 22px;
    }

    &__icons {
      padding-top: 2px;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      &-info {
        margin-top: 1px;
        margin-right: 3px;
      }

      &-link {
        cursor: pointer;
        font-size: 16px;
        margin-top: 5px;
        margin-right: 4px;
      }

      &-link-opacity {
        cursor: default;
        font-size: 16px;
        margin-top: 4px;
        opacity: 0.5;
        margin-right: 4px;
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

    .tooltiptext-bottom {
      font-size: 14px;
      visibility: hidden;
      width: 140px;
      background-color: #67573e;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      bottom: -55px;
      left: 50%;
      margin-left: -75px;
      opacity: 0;
      transition: opacity 0.3s;

      &::after {
        content: "";
        position: absolute;
        top: -10px;
        left: 50%;
        margin-left: -5px;
        transform: rotate(180deg);
        border-width: 5px;
        border-style: solid;
        border-color: #67573e transparent transparent;
      }
    }

    .tooltiptext-left {
      font-size: 14px;
      visibility: hidden;
      width: 140px;
      background-color: #67573e;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      left: 40px;
      opacity: 0;
      top: -2px;
      transition: opacity .3s;

      &::after {
        content: "";
        position: absolute;
        top: 8px;
        left: 0;
        margin-left: -10px;
        transform: rotate(90deg);
        border-width: 5px;
        border-style: solid;
        border-color: #67573e transparent transparent;
      }
    }

    .tooltiptext {
      font-size: 14px;
      visibility: hidden;
      width: 140px;
      background-color: #67573e;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      bottom: 30px;
      left: 50%;
      margin-left: -75px;
      opacity: 0;
      transition: opacity 0.3s;

      &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #67573e transparent transparent transparent;
      }
    }

    &:hover {
      .tooltiptext {
        visibility: visible;
        opacity: 1;
      }
    }

    &:hover {
      .tooltiptext-left {
        visibility: visible;
        opacity: 1;
      }
    }

    &:hover {
      .tooltiptext-bottom {
        visibility: visible;
        opacity: 1;
      }
    }
  }
</style>
