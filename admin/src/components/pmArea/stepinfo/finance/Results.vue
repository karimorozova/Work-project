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
                span.step-finance__money {{ profitAndMargin.roi.toFixed(2) }} %
</template>

<script>
    export default {
        props: {
            financeData: {
                type: Array,
            },
        },
        computed: {
            profitAndMargin() {
                console.log(this.financeData)
                
                let result = {profit: 0, margin: 0, roi: 0};
                if (this.financeData.length) {
                    const price = this.financeData.find((item) => item.title === "Price");
                    result.profit = price.receivables - price.payables;
                    result.margin = price.payables / (price.receivables - price.payables);
                    result.roi = (price.receivables - price.payables) / price.payables;
                }
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
