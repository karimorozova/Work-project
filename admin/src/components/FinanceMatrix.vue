<template lang="pug">
.finance-matrix
    .finance-matrix__table
        DataTable(
            :fields="fields"
            :tableData="tableData"
            bodyRowClass="rates-matrix-row"
            :bodyClass="['rates-matrix-body', 'tbody_visible-overflow']"
            tableheadRowClass="tbody_visible-overflow"
            bodyCellClass="matrix-table"
        )
            template(slot="headerText" slot-scope="{ field }")
                span.finance-matrix__text {{ field.label }}
            template(slot="headerRate" slot-scope="{ field }")
                span.finance-matrix__text {{ field.label }}
            template(slot="text" slot-scope="{ row }")
                span.finance-matrix__text {{ row.text }}
            template(slot="rate" slot-scope="{ row }")
                input.finance-matrix__rate(
                    type="number" min="0" max ="100" 
                    :value="row.rate | maxRateCount"
                    @change="(e) => setMatrixData(e, row.key)"
                )
                span.finance-matrix__percent %
</template>

<script>
import DataTable from "./DataTable";

export default {
    props: {
        entity: {
            type: Object
        }
    },
    data() {
        return {
            fields: [
                {label: "Translation match", headerKey: "headerText", key: "text", width: "50%"},
                {label: "Value %", headerKey: "headerRate", key: "rate", width: "50%"}
            ],
        }
    },
    methods: {
        setMatrixData(e, key) {
            this.$emit("setMatrixData", {value: e.target.value, key});
        }
    },
    components: {
        DataTable
    },
    computed: {
        tableData() {
            return Object.keys(this.entity.matrix).map(key => {
                return {...this.entity.matrix[key], key}
            });
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";
.finance-matrix {
    margin-top: 5px;
    &__rate {
    color: #67573e;
    border: none;
    width: 94%;
    background: inherit;
    outline: none;
        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
    }
    &__percent {
        margin-left: 3px;
    }
}
</style>
