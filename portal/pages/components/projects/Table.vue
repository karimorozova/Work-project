<template lang="pug">
    .data-table
        DataTable(
            :fields="fields"
            :tableData="projects"
        )
            .data-table__header(slot="headerRequestDate" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerProjectId" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerProjectName" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerDeadline" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerTotalCost" slot-scope="{ field }") {{ field.label }}
            .data-table__header(slot="headerDownload" slot-scope="{ field }") {{ field.label }}
            .data-table__data(slot="requestDate" slot-scope="{ row, index }") {{ getFormattedDate(row.createdAt) }}
            .data-table__data(slot="projectId" slot-scope="{ row, index }") {{ row.projectId }}
            .data-table__data(slot="projectName" slot-scope="{ row, index }") {{ row.projectName }}
            .data-table__data(slot="deadline" slot-scope="{ row, index }") {{ getFormattedDate(row.deadline) }}
            .data-table__data(slot="status" slot-scope="{ row, index }") {{ row.status }}
            .data-table__data(slot="totalCost" slot-scope="{ row, index }") {{ row.finance.Price.receivables }}
                .data-table__currency(v-if="row.finance.Price.receivables") &euro;
            .data-table__data.data-table_centered(slot="download" slot-scope="{ row, index }")
</template>

<script>
import DataTable from "~/components/Tables/DataTable";
import moment from "moment";

export default {
    props: {
        projects: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            fields: [
                {label: "Request On", headerKey: "headerRequestDate", key: "requestDate", width: "12%", padding: "0"},
                {label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: "14%", padding: "0"},
                {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "20%", padding: "0"},
                {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "12%", padding: "0"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "16%", padding: "0"},
                {label: "Total Cost", headerKey: "headerTotalCost", key: "totalCost", width: "12%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "14%", padding: "0"}
            ]
        }
    },
    methods: {
        getFormattedDate(date) {
            return moment(date).format("DD-MM-YYYY");
        },
    },
    components: {
        DataTable
    }
}
</script>

<style lang="scss" scoped>

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
}

</style>
