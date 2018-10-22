<template lang="pug">
.step-matrix
    StepInfoTitle(title="Matrix" :isIconReversed="isMatrixShown" @titleClick="toggleMatrixShow")
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
            ]
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
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        display: none;
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
