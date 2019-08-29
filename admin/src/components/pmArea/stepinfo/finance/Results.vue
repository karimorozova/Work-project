<template lang="pug">
  .step-finance__results
    .step-finance__summary
      .step-finance__summary-value
        span Profit:
        span.step-finance__money {{ profitAndMargin.profit.toFixed(2) }} &euro;
    .step-finance__summary
      .step-finance__summary-value
        span Margin:
        span.step-finance__money {{ profitAndMargin.margin.toFixed(2) }} %
    .step-finance__summary
      .step-finance__summary-value
        span ROI:
        span.step-finance__money 0 %
</template>

<script>
    export default {
        props: {
            financeData: {
                type: Array
            },
        },
        computed: {
            profitAndMargin() {
                let result = {profit: 0, margin: 0};
                if(this.financeData.length) {
                    const price = this.financeData.find(item => item.title === 'Price');
                    result.profit = price.receivables - price.payables;
                    result.margin = result.profit/price.receivables;
                }
                return result;
            }
        }
    }
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors";
  .step-finance {
    &__results {
      width: 128px;
      height: 92px;
      font-size: 14px;
      padding: 20px 10px;
      box-shadow: 1px 1px 11px $cell-background;
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
