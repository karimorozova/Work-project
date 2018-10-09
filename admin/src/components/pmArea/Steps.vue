<template lang="pug">
.steps
    .steps__table
        DataTable(
            :fields="fields"
            :tableData="allSteps"
            @onRowClicked="onRowClicked"
        )
            template(slot="Check" slot-scope="{ field }")
                input.steps__check(type="checkbox" v-model="isAllSelected" @change="selectAll")
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
                input.steps__step-data(type="checkbox" v-model="row.check") 
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
                span.steps__money(v-if="row.receivables") &euro;
                span.steps__step-data {{ row.receivables }}
            template(slot="payable" slot-scope="{ row }")
                span.steps__step-data {{ row.payables }}
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
                {label: "Check", key: "check", width: "4%"},
                {label: "Step", key: "name", width: "9%"},
                {label: "Language", key: "language", width: "11%"},
                {label: "Vendor name", key: "vendor", width: "15%"},
                {label: "Start", key: "start", width: "9%"},
                {label: "Deadline", key: "deadline", width: "9%"},
                {label: "Progress", key: "progress", width: "8%"},
                {label: "Status", key: "status", width: "9%"},
                {label: "Receivables", key: "receivables", width: "9%"},
                {label: "Payable", key: "payables", width: "9%"},
                {label: "Margin", key: "margin", width: "8%"},
            ],
            selectedVendors: [],
            isAllSelected: false
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
        },
        selectAll() {
            this.$emit("selectAll", {isAllSelected: this.isAllSelected});
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
