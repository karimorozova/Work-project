<template lang="pug">
.tasks
    .tasks__table
        DataTable(
            :fields="fields"
            :tableData="allTasks"
            @onRowClicked="onRowClicked"
        )
            template(slot="headerCheck" slot-scope="{ field }")
                input.tasks__check(type="checkbox")
            template(slot="headerStep" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerLanguage" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerVendor" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerStart" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerDeadline" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerProgress" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerStatus" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerReceivables" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerPayable" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerMargin" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="check" slot-scope="{ row }")
                input.tasks__task-data(type="checkbox") 
            template(slot="step" slot-scope="{ row }")
                span.tasks__task-data {{ step }}
            template(slot="language" slot-scope="{ row }")
                span.tasks__task-data {{ row.sourceLanguage }} >> {{ row.targetLanguage }}
            template(slot="vendor" slot-scope="{ row }")
            template(slot="start" slot-scope="{ row }")
            template(slot="deadline" slot-scope="{ row }")
                span.tasks__task-data {{ row.wordcount }}
            template(slot="progress" slot-scope="{ row }")
                span.tasks__task-data {{ row.cost }}
            template(slot="status" slot-scope="{ row }")
                span.tasks__task-data {{ row.status }}
            template(slot="receivables" slot-scope="{ row }")
                span.tasks__task-data {{ row.wordcount }}
            template(slot="payable" slot-scope="{ row }")
                span.tasks__task-data {{ row.cost }}
            template(slot="margin" slot-scope="{ row }")
                span.tasks__task-data {{ row.cost }}
</template>

<script>
import DataTable from "../DataTable";
import VendorSelect from "./VendorSelect";

export default {
    props: {
        allTasks: {
            type: Array
        }
    },
    data() {
        return {
            fields: [
                {label: "check", headerKey: "headerCheck", key: "check", width: "4%"},
                {label: "Step", headerKey: "headerStep", key: "step", width: "9%"},
                {label: "Language", headerKey: "headerLanguage", key: "language", width: "11%"},
                {label: "Vendor name", headerKey: "headerVendor", key: "vendor", width: "11%"},
                {label: "Start", headerKey: "headerStart", key: "start", width: "9%"},
                {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "9%"},
                {label: "Progress", headerKey: "headerProgress", key: "progress", width: "9%"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "9%"},
                {label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "11%"},
                {label: "Payable", headerKey: "headerPayables", key: "payable", width: "9%"},
                {label: "Margin", headerKey: "headerMargin", key: "margin", width: "9%"},
            ]
        }
    },
    methods: {
        onRowClicked({index}) {
            this.$emit("onRowClicked", {index: index})
        }
    },
    components: {
        DataTable,
    }    
}
</script>

<style lang="scss" scoped>

</style>
