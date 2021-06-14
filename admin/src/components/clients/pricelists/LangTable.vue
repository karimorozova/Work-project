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
          input.price__data-input(type="number" @change="setRowValue(index)" v-model="dataArray[index].basicPrice")

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
						label: "Source",
						headerKey: "headerSourceLang",
						key: "sourceLang",
						width: "38%",
						padding: "0"
					},
					{
						label: "Target",
						headerKey: "headerTargetLang",
						key: "targetLang",
						width: "38%",
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
						width: "9%",
						padding: "0"
					}
				],
				currency: {},
				isDataRemain: true
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
						tableKey: "Basic Price Table",
						row: this.dataArray[index]
					})
					const result = await this.$http.post(`/clientsapi/client-rate-by-key`, { id: this.clientId, key: 'basicPricesTable' })
					this.setUpClientRatesProp({ id: this.$route.params.id, key: 'basicPricesTable', value: result.data })
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
				if (this.dataArray[index].basicPrice === "") this.dataArray[index].basicPrice = 0.1
				await this.manageSaveClick(index)
			},
			refreshResultTable() {
				this.$emit("refreshResultTable")
			},
			async manageSaveClick(index) {
				const { _id, type, sourceLanguage, targetLanguage, basicPrice } = this.dataArray[index]
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
							}
					)
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
      font-size: 16px;
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
      .tooltiptext-bottom {
        visibility: visible;
        opacity: 1;
      }
    }
  }
</style>
