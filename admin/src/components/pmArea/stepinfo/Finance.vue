<template lang="pug">
.step-finance
    StepInfoTitle(title="Finance" :isIconReversed="isInfoShown" @titleClick="showInfo")
    .step-finance__info(:class="{'step-finance_block': isInfoShown}")
        .step-finance__table
            DataTable(
                :fields="fields"
                :tableData="financeData"
            )
                template(slot="Title" slot-scope="{ field }")
                template(slot="Receivables" slot-scope="{ field }")
                    span.step-finance__label {{ field.label }}
                template(slot="Payables" slot-scope="{ field }")
                    span.step-finance__label {{ field.label }}
                template(slot="Margin" slot-scope="{ field }")
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
                    span.step-finance__money {{ totalSum.margin }} &euro;
    .step-finance__add-row(v-if="isInfoShown")
        Add(@add="addRow")
</template>

<script>
import DataTable from "../../DataTable";
import Add from "../../Add";
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
                {label: "Title", key: "title", width: "25%"},
                {label: "Receivables", key: "receivables", width: "25%"},
                {label: "Payables", key: "payables", width: "25%"},
                {label: "Margin", key: "margin", width: "25%"},
            ],
            isInfoShown: false
        }
    },
    methods: {
        showInfo() {
            this.isInfoShown = !this.isInfoShown;
        },
        addRow() {
            this.$emit("addRow");
        },
        showMoney(row, key) {
            return (row.title === "Price" || row.title === "Discount 10%") && row[key]
        }
    },
    computed: {
        totalSum() {
            const neededElement = this.financeData.find(item => {
                return item.title === "Price"
            })
            return {total: neededElement.receivables, margin: neededElement.payables};
        }
    },
    components: {
        DataTable,
        Add,
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
    &_block {
       display: block
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
