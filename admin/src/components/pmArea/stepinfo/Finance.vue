<template lang="pug">
.step-finance
    .step-finance__title(@click="showInfo") Finance
        img.step-finance__icon(src="../../../assets/images/open-close-arrow-brown.png" :class="{'step-finance_reverse': isInfoShown}")
    .step-finance__info(:class="{'step-finance_static-pos': isInfoShown}")
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
        Add
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.step-finance {
    box-shadow: 0 0 5px $brown-shadow;
    padding: 10px;
    &__title {
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
    }
    &__info {
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        opacity: 0;
        position: absolute;
        z-index: -100;
        transform: translateY(-50px);
        transition: all 0.3s;
    }
    &_static-pos {
        opacity: 1;
        z-index: 0;
        position: static;
        transform: translateY(0);
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
    &__icon {
        transition: all 0.2s;
    }
    &_reverse {
        transform: rotate(180deg);
    }
}
</style>
