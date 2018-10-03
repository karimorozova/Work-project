<template lang="pug">
.jobs
    .jobs__table
        DataTable(
            :fields="fields"
            :tableData="allTasks"
            @onRowClicked="onRowClicked"
        )
            template(slot="check" slot-scope="{ field }")
                input.jobs__check(type="checkbox")
            template(slot="Step" slot-scope="{ field }")
                span.jobs__label {{ field.label }}
            template(slot="Language" slot-scope="{ field }")
                span.jobs__label {{ field.label }}
            template(slot="Vendor name" slot-scope="{ field }")
                span.jobs__label {{ field.label }}
            template(slot="Start" slot-scope="{ field }")
                span.jobs__label {{ field.label }}
            template(slot="Deadline" slot-scope="{ field }")
                span.jobs__label {{ field.label }}
            template(slot="Progress" slot-scope="{ field }")
                span.jobs__label {{ field.label }}
            template(slot="Status" slot-scope="{ field }")
                span.jobs__label {{ field.label }}
            template(slot="Receivables" slot-scope="{ field }")
                span.jobs__label {{ field.label }}
            template(slot="Payable" slot-scope="{ field }")
                span.jobs__label {{ field.label }}
            template(slot="Margin" slot-scope="{ field }")
                span.jobs__label {{ field.label }}
            template(slot="check" slot-scope="{ row }")
                input.jobs__job-data(type="checkbox") 
            template(slot="step" slot-scope="{ row }")
                span.jobs__job-data {{ step }}
            template(slot="language" slot-scope="{ row }")
                span.jobs__job-data {{ row.sourceLanguage }} >> {{ row.targetLanguage }}
            template(slot="vendor" slot-scope="{ row }")
                Vendorselect(
                    :vendors="vendors"
                    :selectedVendors="selectedVendors"
                    :filteredVendors="vendorsIds"
                    @changeVend="setVendor"
                )
                //- span.jobs__job-data {{ row.vendor }}
            template(slot="start" slot-scope="{ row }")
                span.jobs__job-data {{ row.status }}
            template(slot="deadline" slot-scope="{ row }")
                span.jobs__job-data {{ row.wordcount }}
            template(slot="progress" slot-scope="{ row }")
                span.jobs__job-data {{ row.cost }}
            template(slot="status" slot-scope="{ row }")
                span.jobs__job-data {{ row.status }}
            template(slot="receivables" slot-scope="{ row }")
                span.jobs__job-data {{ row.wordcount }}
            template(slot="payable" slot-scope="{ row }")
                span.jobs__job-data {{ row.cost }}
            template(slot="margin" slot-scope="{ row }")
                span.jobs__job-data {{ row.cost }}
</template>

<script>
import DataTable from "../DataTable";
import Vendorselect from "./Vendorselect";

export default {
    props: {
        allTasks: {
            type: Array
        },
        vendors: {
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
            ],
            selectedVendors: []
        }
    },
    methods: {
        onRowClicked({index}) {
            this.$emit("getMetrics")
        },
        setVendor({vendor}) {
            const position = this.vendorsIds.indexOf(vendor._id);
            if(position != -1) {

            }
        }
    },
    computed: {
        vendorsIds() {
            return this.selectedVendors.map(item => {
                return item._id
            })
        }
    },
    components: {
        DataTable,
        Vendorselect
    }    
}
</script>

<style lang="scss" scoped>

</style>
