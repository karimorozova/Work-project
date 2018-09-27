<template lang="pug">
.jobs
    .jobs__table
        DataTable(
            :fields="fields"
            :tableData="allJobs"
            @onRowClicked="onRowClicked"
        )
            template(slot="Language Pair" slot-scope="{ field }" )
                span.jobs__label {{ field.label }}
            template(slot="Status" slot-scope="{ field }" )
                span.jobs__label {{ field.label }}
            template(slot="Wordcount" slot-scope="{ field }" )
                span.jobs__label {{ field.label }}
            template(slot="Cost" slot-scope="{ field }" )
                span.jobs__label {{ field.label }}
            template(slot="pair" slot-scope="{ row }")
                span.jobs__job-data {{ row.sourceLanguage }} >> {{ row.targetLanguage }}
            template(slot="status" slot-scope="{ row }")
                span.jobs__job-data {{ row.status }}
            template(slot="wordcount" slot-scope="{ row }")
                span.jobs__job-data {{ row.wordcount }}
            template(slot="cost" slot-scope="{ row }")
                span.jobs__job-data {{ row.cost }}
</template>

<script>
import DataTable from "../DataTable"

export default {
    props: {
        allJobs: {
            type: Array
        }
    },
    data() {
        return {
            fields: [
                {label: "Language Pair", key: "pair", width: "40%"},
                {label: "Status", key: "status", width: "15%"},
                {label: "Wordcount", key: "wordcount", width: "15%"},
                {label: "Cost", key: "cost", width: "15%"},
                {label: "", key: "download", width: "15%"},
            ]
        }
    },
    methods: {
        onRowClicked({index}) {
            this.$emit("getMetrics")
        }
    },
    components: {
        DataTable
    }    
}
</script>

<style lang="scss" scoped>

</style>
