<template lang="pug">
  .pricelistDiscountChart
    .pricelistDiscountChart__table
      DataTable(
        :fields="fields",
        :tableData="tableData",
        bodyRowClass="rates-matrix-row",
        :bodyClass="['rates-matrix-body', 'tbody_visible-overflow']",
        tableheadRowClass="tbody_visible-overflow",
        bodyCellClass="matrix-table"
      )
        template(slot="headerText", slot-scope="{ field }")
          span.pricelistDiscountChart__text {{ field.label }}
        template(slot="headerRate", slot-scope="{ field }")
          span.pricelistDiscountChart__text {{ field.label }}
        template(slot="text", slot-scope="{ row }")
          span.pricelistDiscountChart__text {{ row.text }}
        template(slot="rate", slot-scope="{ row }")
          .table__data(v-if="!isEdit")
            span {{ row.rate }}
            span.pricelistDiscountChart__percent %
          .table__dataEdit(v-else)
            input.pricelistDiscountChart__rate(type="number", min="0", max="100", :value="row.rate | maxRateCount", @change="(e) => setMatrixData(e, row.key)")

</template>

<script>
	import DataTable from "../../DataTable"
	import { mapActions } from "vuex"

	export default {
		props: {
			discountChart: {
				type: Object
			},
			pricelistId: {
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
					{ label: "Translation match", headerKey: "headerText", key: "text", width: "85%" },
					{ label: "Value %", headerKey: "headerRate", key: "rate", width: "15%" }
				],
				currentDiscountChart: null
			}
		},
		methods: {
			...mapActions([ "alertToggle" ]),
			async setMatrixData({ target }, key) {
				const value = target.value < 0 ? 0 : target.value > 100 ? 100 : target.value
				try {
					const result = await this.$http.post(`/pm-manage/update-discount/${ this.pricelistId }`, {
						updatedRowObj: {
							key,
							value
						}
					})
					this.currentDiscountChart = result.data
				} catch (err) {
					this.alertToggle({ message: "Pricelist Discount chart is not updated", isShow: true, type: "error" })
				}
			}
		},
		components: {
			DataTable
		},
		computed: {
			tableData() {
				return Object.keys(this.currentDiscountChart).map((key) => {
					return { ...this.currentDiscountChart[key], key }
				})
			}
		},
		created() {
			this.currentDiscountChart = this.discountChart
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .pricelistDiscountChart {
    &__rate {
      color: #67573e;
      border: none;
      width: 80%;
      background: inherit;
      outline: none;

      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    &__percent {
      margin-left: 3px;
    }
  }
  .table{
    &__dataEdit{
      box-shadow: inset 0 0 7px $brown-shadow;
    }
  }
</style>
