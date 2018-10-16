<template lang="pug">
.tasks
    .tasks__table
        DataTable(
            :fields="fields"
            :tableData="allTasks"
            @onRowClicked="onRowClicked"
        )
            template(slot="check" slot-scope="{ field }")
                input.tasks__check(type="checkbox")
            template(slot="Step" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="Language" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="Vendor name" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="Start" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="Deadline" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="Progress" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="Status" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="Receivables" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="Payable" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="Margin" slot-scope="{ field }")
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
                {label: "check", key: "check", width: "4%"},
                {label: "Step", key: "step", width: "9%"},
                {label: "Language", key: "language", width: "11%"},
                {label: "Vendor name", key: "vendor", width: "11%"},
                {label: "Start", key: "start", width: "9%"},
                {label: "Deadline", key: "deadline", width: "9%"},
                {label: "Progress", key: "progress", width: "9%"},
                {label: "Status", key: "status", width: "9%"},
                {label: "Receivables", key: "receivables", width: "11%"},
                {label: "Payable", key: "payable", width: "9%"},
                {label: "Margin", key: "margin", width: "9%"},
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
