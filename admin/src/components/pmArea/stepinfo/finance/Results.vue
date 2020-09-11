<template lang="pug">
  .step-finance__results
    .step-finance__summary
      .step-finance__summary-value
        span Profit:
        span.step-finance__money {{ isNaNCalculationValue(+profitAndMargin.profit) }} &euro;
    .step-finance__summary
      .step-finance__summary-value
        span Margin:
        span.step-finance__money {{ isNaNCalculationValue(+profitAndMargin.margin) }}  %
    .step-finance__summary
      .step-finance__summary-value
        span ROI:
        span.step-finance__money {{ isNaNCalculationValue(+profitAndMargin.roi) }}  %
</template>

<script>
	export default {
		props: {
			step: {
				type: Object,
			},
		},
		methods: {
			isNaNCalculationValue(value) {
				return isNaN(value) ? '0' : value
			}
		},
		computed: {
			profitAndMargin() {
				const {finance} = this.step;
				const {Price} = finance;

				let result = {profit: 0, margin: 0, roi: 0};
				result.profit = (Price.receivables - Price.payables).toFixed(2);
				result.margin = (Price.payables / (Price.receivables - Price.payables)).toFixed(2);
				result.roi = ((Price.receivables - Price.payables) / Price.payables).toFixed(2);

				return result;
			},
		},
	};
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors";

  .step-finance {
    &__results {
      width: 128px;
      height: 90px;
      font-size: 14px;
      padding: 20px;
      background: #f4f0ee;
      border: 2px solid #938676;
    }

    &__summary-value {
      display: flex;
      justify-content: space-between;

      span {
        width: 50%;
      }
    }

    &__summary:not(:last-child) {
      margin-bottom: 20px;
    }
  }
</style>
