<template lang="pug">
    .finance-matrix
        .finance-matrix__table
            DataTable(
                :fields="fields"
                :tableData="tableData"
                bodyRowClass="rates-matrix-row"
                bodyClass="rates-matrix-body tbody_visible-overflow"
                tableHeadRowClass="tbody_visible-overflow"
            )
                template(slot="headerText" slot-scope="{ field }")
                    span.finance-matrix__text {{ field.label }}
                template(slot="headerRate" slot-scope="{ field }")
                    span.finance-matrix__text {{ field.label }}
                template(slot="text" slot-scope="{ row }")
                    span.finance-matrix__text {{ row.text }}
                template(slot="rate" slot-scope="{ row }")
                    span.finance-matrix__rate {{ row.rate*100 }}
                    span.finance-matrix__percent %
</template>

<script>
import DataTable from "@/components/Tables/DataTable";
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            fields: [
                {label: "Translation match", headerKey: "headerText", key: "text", width: "50%"},
                {label: "Value %", headerKey: "headerRate", key: "rate", width: "50%"}
            ],
        }
    },
    components: {
        DataTable
    },
    computed: {
        ...mapGetters({
            accountInfo: "getAccountInfo"
        }),
        tableData() {
            return Object.keys(this.accountInfo.matrix).map(key => {
                return {...this.accountInfo.matrix[key], key}
            });
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.finance-matrix {
    margin-top: 5px;
    &__rate {
        width: 22px;
        padding-left: 2px;
        color: $main-color;
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
