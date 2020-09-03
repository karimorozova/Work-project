<template lang="pug">
.step-matrix
    StepInfoTitle(title="Matrix" :isIconReversed="isMatrixShown" @titleClick="toggleMatrixShow")
    .step-matrix__toggler(v-if="isMatrixShown")
        .step-matrix__toggle-option(@click="refreshMatrix('receivables')" :class="{'step-matrix_active-option': matrixOption === 'receivables'}") Receivables
        .step-matrix__toggle-option(@click="refreshMatrix('payables')" :class="{'step-matrix_active-option': matrixOption === 'payables'}") Payables
        transition(name="fade")
            span.step-matrix__tooltip(v-if="isTooltipShow") A Vendor is not assigned
    .step-matrix__table(:class="{'step-matrix_block': isMatrixShown}")
        DataTable(
            :fields="fields"
            :tableData="matrixData"
            :bodyClass="['matrix-table', 'tbody_visible-overflow']"
            tableheadRowClass='tbody_visible-overflow'
        )
            template(slot="headerTitle" slot-scope="{ field }")
                span.step-matrix__label {{ field.label }}
            template(slot="headerValue" slot-scope="{ field }")
                span.step-matrix__label {{ field.label }}
            template(slot="headerWordcount" slot-scope="{ field }")
                span.step-matrix__label {{ field.label }}
            template(slot="headerRate" slot-scope="{ field }")
                span.step-matrix__label {{ field.label }}
            template(slot="headerTotal" slot-scope="{ field }")
                span.step-matrix__label {{ field.label }}
            template(slot="title" slot-scope="{ row }")
                span.step-matrix__value {{ row.title }}
            template(slot="value" slot-scope="{ row, index }")
                span.step-matrix__value
                    input.step-matrix__number-input(type="number" min="0" max="100" v-model="row.value" @focus="toggleRowActive(index)" @blur="updateMatrixValue(index)" @keyup.enter="(e)=>updateMatrixValue(index, e)")
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
import StepInfoTitle from "./finance/StepInfoTitle";
import DataTable from "../../DataTable";

export default {
    props: {
        matrixData: {
            type: Array
        },
        step: {
            type: Object
        }
    },
    data() {
        return {
            isMatrixShown: false,
            fields: [
                {label: "Translation match", headerKey: "headerTitle", key: "title", width: "24%"},
                {label: "Value %", headerKey: "headerValue", key: "value", width: "19%"},
                {label: "Wordcount", headerKey: "headerWordcount", key: "wordcount", width: "19%"},
                {label: "Rate", headerKey: "headerRate", key: "rate", width: "19%"},
                {label: "Total", headerKey: "headerTotal", key: "total", width: "19%"},
            ],
            matrixOption: "receivables",
            isTooltipShow: false
        }
    },
    methods: {
        toggleMatrixShow() {
            this.isMatrixShown = !this.isMatrixShown;
        },
        toggleRowActive(index) {
            this.$emit("toggleMatrixRowActive", {index: index});
        },
        updateMatrixValue(index, e) {
            this.$emit("updateMatrixValue", {index: index, prop: this.matrixOption});
            if(e) {
                e.target.blur();
            }
        },
        refreshMatrix(value) {
            if(this.matrixOption === value) {
                return
            }
            if(value === 'payables' && !this.step.vendor) {
                return this.noVendorToolTip()
            }
            this.matrixOption = value;
            this.$emit("refreshMatrix", {costs: value});
        },
        noVendorToolTip() {
            this.isTooltipShow = true;
            setTimeout(() => {
                this.isTooltipShow = false;
            }, 3000)
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
        position: relative;
    }
    &__tooltip {
        position: absolute;
        box-shadow: 0 0 5px $brown-shadow;
        border-radius: 8px;
        color: $orange;
        padding: 1px 5px;
        top: -85%;
        left: 23%;
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
        &::-webkit-outer-spin-button{
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

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
