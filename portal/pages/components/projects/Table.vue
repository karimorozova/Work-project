<template lang="pug">
    .data-table
        DataTable(
            :fields="tableFields"
            :tableData="projects"
            @onRowClicked="getDetails"
        )
            .data-table__header(slot="headerRequestDate" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerProjectId" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerProjectName" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerDeadline" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerTotalCost" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerIcons" slot-scope="{ field }") {{ field.label }}
            .data-table__data(slot="requestDate" slot-scope="{ row, index }") {{ getFormattedDate(row.createdAt) }}
            .data-table__data(slot="projectId" slot-scope="{ row, index }") {{ row.projectId }}
            .data-table__data(slot="projectName" slot-scope="{ row, index }") {{ row.projectName }}
            .data-table__data(slot="deadline" slot-scope="{ row, index }") {{ getFormattedDate(row.deadline) }}
            .data-table__data(slot="status" slot-scope="{ row, index }") {{ row.status }}
            .data-table__data(slot="totalCost" slot-scope="{ row, index }") {{ row.finance.Price.receivables }}
                .data-table__currency(v-if="row.finance.Price.receivables") &euro;
            .data-table__data.data-table_centered(slot="icons" slot-scope="{ row, index }")
                img.data-table__icon(v-if="row.status === 'Quote sent'" v-for="(icon, key) in icons" :src="icon.src" @click.stop="makeAction(index, key)")
            .data-table__data.data-table__progress(slot="progress" slot-scope="{ row, index }")
                ProgressLine(:progress="progress(row.steps)")
</template>

<script>
import DataTable from "~/components/Tables/DataTable";
import ProgressLine from "~/components/ProgressLine";
import moment from "moment";

export default {
    props: {
        projects: {
            type: Array,
            default: () => []
        },
        isOpenProjects: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            fields: [
                {label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: "14%", padding: "0"},
                {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "20%", padding: "0"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "16%", padding: "0"},
                {label: "Request On", headerKey: "headerRequestDate", key: "requestDate", width: "12%", padding: "0"},
                {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "12%", padding: "0"},
                {label: "Total Cost", headerKey: "headerTotalCost", key: "totalCost", width: "12%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "14%", padding: "0"}
            ],
            icons: {
                approve: {src: require("../../../assets/images/Approve-icon.png")},
                reject: {src: require("../../../assets/images/Reject-icon.png")}
            }
        }
    },
    methods: {
        getFormattedDate(date) {
            return moment(date).format("DD-MM-YYYY");
        },
        makeAction(index, key) {
            this.$emit("iconClicked", { index, key })
        },
        getDetails({index}) {
            this.$emit("getDetails", { index });
        },
        progress(steps) {
            let total = 0;
            for(let step of steps) {
                total+= +(step.progress.wordsDone/step.progress.wordsTotal*100).toFixed(2);
            }
            return total/steps.length;
        }
    },
    computed: {
        tableFields() {
            let result = [...this.fields];
            if(this.isOpenProjects) {
                let progressElement = {...result[result.length-1], label: 'Progress', key: 'progress'};
                result.pop();
                result.splice(3, 0, progressElement);
            }
            return result;
        }
    },
    components: {
        DataTable,
        ProgressLine
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.data-table {
    &__data {
        height: 30px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        padding: 0 5px;
    }
    &__currency {
        margin-left: 3px;
    }
    &__icon {
        margin: 0 5px;
        transition: all 0.2s;
        &:hover {
            transform: scale(1.1);
        }
    }
    &__progress {
        position: relative;
    }
    &_centered {
        justify-content: center;
    }
}

</style>
