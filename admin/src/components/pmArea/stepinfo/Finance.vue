<template lang="pug">
.step-finance
    StepInfoTitle(title="Finance" :isIconReversed="isInfoShown" @titleClick="toggleInfoShow")
    .step-finance__info(:class="{'step-finance_flex-display': isInfoShown}")
        .step-finance__table
            DataTable(
                :fields="fields"
                :tableData="financeData"
            )
                template(slot="headerTitle" slot-scope="{ field }")
                template(slot="headerReceivables" slot-scope="{ field }")
                    span.step-finance__label {{ field.label }}
                template(slot="headerPayables" slot-scope="{ field }")
                    span.step-finance__label {{ field.label }}
                template(slot="headerMargin" slot-scope="{ field }")
                    span.step-finance__label {{ field.label }}
                template(slot="title" slot-scope="{ row }")
                    span.step-finance__value {{ row.title }}
                template(slot="receivables" slot-scope="{ row }")
                    span.step-finance__value {{ row.receivables }} 
                    span.step-finance__money(v-if="showMoney(row, 'receivables')") &euro;
                template(slot="payables" slot-scope="{ row }")
                    span.step-finance__value {{ row.payables }}
                    span.step-finance__money(v-if="showMoney(row, 'payables')") &euro;
                template(slot="margin" slot-scope="{ row }")
                    span.step-finance__value {{ row.margin }}
                    span.step-finance__money(v-if="showMoney(row, 'receivables')") &euro;
        .step-finance__results
            .step-finance__summary
                .step-finance__summary-value Total: 
                    span.step-finance__money {{ totalSum.total }} &euro;
            .step-finance__summary
                .step-finance__summary-value Margin: 
                    span.step-finance__money {{ totalSum.margin.toFixed(2) }} &euro;
</template>

<script>
import DataTable from "../../DataTable";
import StepInfoTitle from "./StepInfoTitle";

export default {
    props: {
        financeData: {
            type: Array
        }
    },
    data() {
        return {
            fields: [
                {label: "Title", headerKey: "headerTitle", key: "title", width: "25%"},
                {label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "25%"},
                {label: "Payables", headerKey: "headerPayables", key: "payables", width: "25%"},
                {label: "Margin", headerKey: "headerMargin", key: "margin", width: "25%"},
            ],
            isInfoShown: false
        }
    },
    methods: {
        toggleInfoShow() {
            this.isInfoShown = !this.isInfoShown;
        },
        showMoney(row, key) {
            return row.title !== "Wordcount" && row[key]
        }
    },
    computed: {
        totalSum() {
            const price = this.financeData.find(item => {
                return item.title === "Price"
            })
            return {total: price.receivables, margin: price.receivables - price.payables};
        }
    },
    components: {
        DataTable,
        StepInfoTitle
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.step-finance {
    box-shadow: 0 0 5px $brown-shadow;
    padding: 10px;
    &__info {
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        display: none;
        transition: all 0.3s;
    }
    &_flex-display {
       display: flex;
    }
    &__table {
        width: 70%;
    }
    &__results {
        width: 25%;
        font-size: 18px;
    }
    &__summary-value {
        display: flex;
        width: 70%;
        justify-content: space-between;
    }
}
</style>
