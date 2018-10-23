<template lang="pug">
.step-matrix
    StepInfoTitle(title="Matrix" :isIconReversed="isMatrixShown" @titleClick="toggleMatrixShow")
    .step-matrix__toggler(v-if="isMatrixShown")
        .step-matrix__toggle-option(@click="refreshMatrix('receivables')" :class="{'step-matrix_active-option': matrixOption === 'receivables'}") Receivables
        .step-matrix__toggle-option(@click="refreshMatrix('payables')" :class="{'step-matrix_active-option': matrixOption === 'payables'}") Payables
    .step-matrix__table(:class="{'step-matrix_block': isMatrixShown}")
        DataTable(
            :fields="fields"
            :tableData="matrixData"
            bodyClass="matrix-table"
        )
            template(slot="Title" slot-scope="{ field }")
            template(slot="Value" slot-scope="{ field }")
                span.step-matrix__label % {{ field.label }}
            template(slot="Wordcount" slot-scope="{ field }")
                span.step-matrix__label {{ field.label }}
            template(slot="Rate" slot-scope="{ field }")
                span.step-matrix__label {{ field.label }}
            template(slot="Total" slot-scope="{ field }")
                span.step-matrix__label {{ field.label }}
            template(slot="title" slot-scope="{ row }")
                span.step-matrix__value {{ row.title }}
            template(slot="value" slot-scope="{ row, index }")
                span.step-matrix__value
                    input.step-matrix__number-input(type="number" min="0" max="100" v-model="row.value" @focus="toggleRowActive(index)" @blur="updateMatrixValue(index)")
                    span.step-matrix__percent(v-if="!row.active" :class="{'step-matrix_left-15': row.value < 100, 'step-matrix_left-8': row.value < 10}") %
            template(slot="wordcount" slot-scope="{ row }")
                span.step-matrix__value {{ row.wordcount }}
            template(slot="rate" slot-scope="{ row }")
                span.step-matrix__value {{ row.rate.toFixed(2) }}
                    span.step-matrix__euro(v-if="row.rate") &euro; 
            template(slot="total" slot-scope="{ row }")
                span.step-matrix__value {{ row.total.toFixed(2) }}
                    span.step-matrix__euro(v-if="row.total") &euro; 
</template>

<script>
import StepInfoTitle from "./StepInfoTitle";
import DataTable from "../../DataTable";

export default {
    props: {
        matrixData: {
            type: Array
        }
    },
    data() {
        return {
            isMatrixShown: false,
            fields: [
                {label: "Title", key: "title", width: "24%"},
                {label: "Value", key: "value", width: "19%"},
                {label: "Wordcount", key: "wordcount", width: "19%"},
                {label: "Rate", key: "rate", width: "19%"},
                {label: "Total", key: "total", width: "19%"},
            ],
            matrixOption: "receivables"
        }
    },
    methods: {
        toggleMatrixShow() {
            this.isMatrixShown = !this.isMatrixShown;
        },
        toggleRowActive(index) {
            this.$emit("toggleMatrixRowActive", {index: index});
        },
        updateMatrixValue(index) {
            this.$emit("updateMatrixValue", {index: index});
        },
        refreshMatrix(value) {
            if(this.matrixOption === value) {
                return
            }
            this.matrixOption = value;
            this.$emit("refreshMatrix", {costs: value});
        }
    },
    components: {
        StepInfoTitle,
        DataTable
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.step-matrix {
    box-shadow: 0 0 5px $brown-shadow;
    padding: 10px;
    &__table {
        display: flex;
        justify-content: space-between;
        display: none;
    }
    &__toggler {
        display: flex;
        margin-top: 10px;
    }
    &__toggle-option {
        padding: 5px;
        width: 10%;
        font-size: 14px;
        border: 1px solid $brown-border;
        border-bottom: none;
        border-top-right-radius: 10px;
        border-top-left-radius: 3px;
        background-color: $table-row-zebra-background;
        box-shadow: inset 0 0 3px $brown-shadow;
        cursor: pointer;
        opacity: 0.6;
        z-index: 0;
    }
    &_active-option {
        background-color: $white;
        opacity: 1;
    }
    &_block {
        display: block;
    }
    &__number-input {
        width: 22px;
        color: $main-color;
        border: none;
        background-color: transparent;
        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button, {
            -webkit-appearance: none;
            margin: 0;
        }
    }
    &__value {
        position: relative;
    }
    &__percent {
        position: absolute;
        top: 0;
    }
    &_left-15 {
        left: 15px;
    }
    &_left-8 {
        left: 8px;
    }
}
</style>
