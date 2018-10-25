<template lang="pug">
.project-finance
    .project-finance__title(@click="toggleFinance") Finance
        img.project-finance__icon(src="../../assets/images/open-close-arrow-brown.png" :class="{'project-finance_reverse': isFinanceShow}")
    .project-finance__table(v-if="isFinanceShow")
        DataTable(
            :fields="fields"
            :tableData="financeData"
            bodyRowClass="steps-table-row"
        )
            template(slot="headerTitle" slot-scope="{ field }")
            template(slot="headerReceivables" slot-scope="{ field }")
                span.project-finance__label {{ field.label }}
            template(slot="headerPayables" slot-scope="{ field }")
                span.project-finance__label {{ field.label }}
            template(slot="headerMargin" slot-scope="{ field }")
                span.project-finance__label {{ field.label }}
            template(slot="title" slot-scope="{ row }")
                span.project-finance__data {{ row.title }}
            template(slot="receivables" slot-scope="{ row }")
                span.project-finance__data {{ row.receivables }}
            template(slot="payables" slot-scope="{ row }")
                span.project-finance__data {{ row.payables }}
            template(slot="margin" slot-scope="{ row }")
                span.project-finance__data {{ row.margin }}
        .project-finance__add-row
            Add(@add="addRow")
</template>

<script>
import DataTable from "../DataTable";
import Add from "../Add";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
    },
    data() {
        return {
            isFinanceShow: false,
            fields: [
                {label: "Title", headerKey: "headerTitle", key: "title", width: "25%"},
                {label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "25%"},
                {label: "Payables", headerKey: "headerPayables", key: "payables", width: "25%"},
                {label: "Margin", headerKey: "headerMargin", key: "margin", width: "25%"},
            ],
            discountOptions: ["Discount-1", "Discount-2", "Discount-3"]
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle"
        }),
        addRow() {
            this.financeData.push({title: "", receivables: ""});
        },
        toggleFinance() {
            this.isFinanceShow = !this.isFinanceShow;
        }
    },
    computed: {
        ...mapGetters({
            currentProject: "getCurrentProject"
        }),
        financeData() {
            const finance = {...this.currentProject.finance};
            let result = Object.keys(finance).map(key => {
                let margin = (finance[key].receivables - finance[key].payables).toFixed(2);
                return {
                    title: key, 
                    receivables: finance[key].receivables,
                    payables: finance[key].payables,
                    margin: margin}
            })
            return result;
        }
    },
    components: {
        DataTable,
        Add
    }
}
</script>

<style lang="scss" scoped>
.project-finance {
    box-sizing: border-box;
    width: 60%;
    margin: 20px;
    box-shadow: 0 3px 20px rgba(104, 87, 62, 0.5);
    &__title {
        padding: 20px;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
    }
    &__icon {
        transition: all 0.2s;
    }
    &_reverse {
        transform: rotate(180deg);
    }
    &__table {
        padding: 0 20px 20px 20px;
    }
}
</style>
