<template lang="pug">
.steps
    .steps__table
        DataTable(
            :fields="fields"
            :tableData="allSteps"
            @onRowClicked="onRowClicked"
        )
            template(slot="check" slot-scope="{ field }")
                input.steps__check(type="checkbox")
            template(slot="Step" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Language" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Vendor name" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Start" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Deadline" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Progress" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Status" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Receivables" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Payable" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Margin" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="check" slot-scope="{ row }")
                input.steps__step-data(type="checkbox") 
            template(slot="name" slot-scope="{ row }")
                span.steps__step-data {{ row.name }}
            template(slot="language" slot-scope="{ row }")
                span.steps__step-data {{ row.source }} >> {{ row.target }}
            template(slot="vendor" slot-scope="{ row }")
                Vendorselect(
                    :vendors="vendors"
                    :selectedVendors="selectedVendors"
                    :filteredVendors="vendorsIds"
                    @changeVend="setVendor"
                )
            template(slot="start" slot-scope="{ row }")
                span.steps__step-data {{ row.start }}
            template(slot="deadline" slot-scope="{ row }")
                span.steps__step-data {{ row.deadline }}
            template(slot="progress" slot-scope="{ row }")
                span.steps__step-data {{ progress(row.progress) }}
            template(slot="status" slot-scope="{ row }")
                span.steps__step-data {{ row.status }}
            template(slot="receivables" slot-scope="{ row }")
                span.steps__step-data {{ row.receivables }}
            template(slot="payable" slot-scope="{ row }")
                span.steps__step-data {{ row.payable }}
            template(slot="margin" slot-scope="{ row }")
                span.steps__step-data {{ row.margin }}
</template>

<script>
import DataTable from "../DataTable";
import Vendorselect from "./Vendorselect";

export default {
    props: {
        allSteps: {
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
                {label: "Step", key: "name", width: "9%"},
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
            this.$emit("onRowClicked", {index: index})
        },
        setVendor({vendor}) {
            const position = this.vendorsIds.indexOf(vendor._id);
            if(position != -1) {

            }
        },
        progress(prog) {
            return (prog.wordsDone/prog.wordsTotal)*100;
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
