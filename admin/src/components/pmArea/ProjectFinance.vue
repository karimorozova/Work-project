<template lang="pug">
.project-finance
    .project-finance__title(@click="toggleFinance") Finance
        img.project-finance__icon(src="../../assets/images/open-close-arrow-brown.png" :class="{'project-finance_reverse': isFinanceShow}")
    .project-finance__table(v-if="isFinanceShow")
        DataTable(
            :fields="fields"
            :tableData="financeData"
            bodyRowClass="steps-table-row"
            bodyClass="tbody_visible-overflow"
            tableheadRowClass="tbody_visible-overflow"
        )
            template(slot="headerTitle" slot-scope="{ field }")
            template(slot="headerReceivables" slot-scope="{ field }")
                span.project-finance__label {{ field.label }}
            template(slot="headerPayables" slot-scope="{ field }")
                span.project-finance__label {{ field.label }}
            template(slot="headerMargin" slot-scope="{ field }")
                span.project-finance__label {{ field.label }}
            template(slot="title" slot-scope="{ row }")
                .project-finance__data-title(v-if="row.title !== 'Select'")
                    span.project-finance__data {{ row.title }}
                .project-finance__drop-menu(v-if="row.title === 'Select'")
                    SelectSingle(
                        placeholder="Select"
                        :selectedOption="selectedAdditionalOption"
                        :options="discountOptions"
                        @chooseOption="setDiscount"
                    )
            template(slot="receivables" slot-scope="{ row }")
                template(v-if="+row.receivables")
                    span.project-finance__euro-sign(v-if="showEuroSign(row)") &euro;
                    span.project-finance__data {{ row.receivables }}
                template(v-if="row.title === 'Select'")
                    input.project-finance__percent-value(type="number" min="0" max="100" v-model="additionalValue")
                    span.project-finance__percent %
            template(slot="payables" slot-scope="{ row }")
                span(v-if="+row.payables && showEuroSign(row)") &euro;
                span.project-finance__data(v-if="+row.payables") {{ row.payables }}
            template(slot="margin" slot-scope="{ row }")
                span(v-if="+row.margin && showEuroSign(row)") &euro;
                span.project-finance__data(v-if="+row.margin") {{ row.margin }}
        .project-finance__add-row
            Add(@add="addRow")
</template>

<script>
import DataTable from "../DataTable";
import Add from "../Add";
import { mapGetters, mapActions } from "vuex";
import SelectSingle from "../SelectSingle";

export default {
    props: {
    },
    data() {
        return {
            isFinanceShow: false,
            fields: [
                {label: "Title", headerKey: "headerTitle", key: "title", width: "25%", cellClass: "project-finance_no-padding"},
                {label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "25%"},
                {label: "Payables", headerKey: "headerPayables", key: "payables", width: "25%"},
                {label: "Margin", headerKey: "headerMargin", key: "margin", width: "25%"},
            ],
            discountOptions: ["Discount-1", "Discount-2", "Discount-3"],
            selectedAdditionalOption: "",
            additionalValue: 5
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            addFinanceProperty: "addFinanceProperty"
        }),
        addRow() {
            this.addFinanceProperty({receivables: "", payables: ""});
        },
        toggleFinance() {
            this.isFinanceShow = !this.isFinanceShow;
        },
        setDiscount({option}) {
            this.selectedAdditionalOption = option;
        },
        showEuroSign(data) {
            return data.title !== 'Wordcount';
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
                    margin: margin
                    }
            })
            return result;
        }
    },
    components: {
        DataTable,
        SelectSingle,
        Add
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.project-finance {
    box-sizing: border-box;
    min-width: 1000px;
    box-shadow: 0 0 10px #67573e9d;
    margin: 40px;

    &__title {
        padding: 20px;
        font-size: 22px;
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
    &__drop-menu {
        position: relative;
        height: 26px;
        top: 0;
    }
    &__percent-value {
        outline: 1px solid $blue-outline;
        border: none;
        padding-left: 5px;
        width: 24px;
        margin-right: 3px;
        color: $main-color;
        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button{
            -webkit-appearance: none;
            margin: 0;
        }
    }
    &__data-title {
        padding: 7px 6px;
    }
}
</style>
