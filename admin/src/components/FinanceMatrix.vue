<template lang="pug">
.finance-matrix
    .finance-matrix__table
        DataTable(
            :fields="fields"
            :tableData="tableData"
            bodyRowClass="rates-matrix-row"
            bodyClass="rates-matrix-body"
        )
            template(slot="Translation match" slot-scope="{ field }")
                span.finance-matrix__text {{ field.label }}
            template(slot="Value" slot-scope="{ field }")
                span.finance-matrix__text {{ field.label }}
                span.finance-matrix__percent %
            template(slot="text" slot-scope="{ row }")
                span.finance-matrix__text {{ row.text }}
            template(slot="rate" slot-scope="{ row }")
                input.finance-matrix__rate(type="number" min="0" max ="100" :value="row.rate*100")
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
                {label: "Translation match", key: "text", width: "50%"},
                {label: "Value", key: "rate", width: "50%"}
            ],
        }
    },
    methods: {

    },
    components: {
        DataTable
    },
    computed: {
        tableData() {
            return Object.keys(this.entity.matrix).map(key => {
                return this.entity.matrix[key]
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.finance-matrix {
    margin-top: 5px;
    &__rate {
        width: 22px;
        padding-left: 2px;
        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button, {
            -webkit-appearance: none;
            margin: 0;
        }
    }
    &__percent {
        margin-left: 3px;
    }
}
</style>
