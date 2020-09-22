<template lang="pug">
  .step-finance__results
    .step-finance__summary
      .step-finance__summary-value
        span Profit:
        span.step-finance__money(v-if="step.vendor") {{ isNaNCalculationValue(+profitAndMargin.profit) }} &euro;
        span.step-finance__money(v-else)
    .step-finance__summary
      .step-finance__summary-value
        span Margin:
        span.step-finance__money(v-if="step.vendor") {{ isNaNCalculationValue(+profitAndMargin.margin) }}  %
        span.step-finance__money(v-else)
    .step-finance__summary
      .step-finance__summary-value
        span ROI:
        span.step-finance__money(v-if="step.vendor") {{ isNaNCalculationValue(+profitAndMargin.roi) }}  %
        span.step-finance__money(v-else)
</template>

<script>
	export default {
		props: {
			step: {
				type: Object,
			},
			profitAndMargin:{
				type: Object,
      }
		},
		methods: {
			isNaNCalculationValue(value) {
				return isNaN(value) ? '0' : value
			}
		},
	};
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors";

  .step-finance {
    &__results {
      width: 128px;
      font-size: 14px;
      padding: 20px;
      background: #f4f0ee;
      border: 2px solid #938676;
      margin-top: 62px;
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
