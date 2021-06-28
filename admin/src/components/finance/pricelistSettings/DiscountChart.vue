<template lang="pug">
  .pricelistDiscountChart
    .pricelistDiscountChart__table
      GeneralTable(
        :fields="fields",
        :tableData="tableData",
        :isFilterShow="false",
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
	import { mapActions } from "vuex"
	import GeneralTable from "../../GeneralTable"

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
					{
						label: "Translation match",
						headerKey: "headerText",
						key: "text",
						style: { "width": "85%" }
					},
					{
						label: "Value %",
						headerKey: "headerRate",
						key: "rate",
						style: { "width": "15%" }
					}
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
			GeneralTable
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
  @import "../../../assets/scss/generalTable";

  .pricelistDiscountChart {
    &__rate {
      @extend %editing-input;
    }

    &__percent {
      margin-left: 3px;
    }
  }

</style>
