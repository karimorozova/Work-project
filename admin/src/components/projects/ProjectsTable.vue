<template lang="pug">
.projects-table
    DataTable(
        :fields="fields"
        :tableData="allProjects"
        @onRowClicked="onRowClicked"
    )
        template(slot="Request On" slot-scope="{ field }") 
            span.projects-table__label {{ field.label }}
                img.projects-table__icon(src="../../assets/images/white-arrow.png") 
        template(slot="Project ID" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Project Name" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Status" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Deadline" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Total Cost" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="createdAt" slot-scope="{ row }") 
            span {{ row.createdAt.split('T')[0].split('-').reverse().join('-') }}
        template(slot="projectId" slot-scope="{ row }")
            span {{ row.projectId }}
        template(slot="projectName" slot-scope="{ row }")
            span {{ row.projectName }}
        template(slot="status" slot-scope="{ row }")
            span {{ row.status }}
        template(slot="date" slot-scope="{ row }")
            span {{ row.date.split('T')[0].split('-').reverse().join('-') }}              
        template(slot="totalCost" slot-scope="{ row }")
            span {{ row.totalCost }}              
        template(slot="download" slot-scope="{ row }")
            span sign
</template>

<script>
import DataTable from "../DataTable"

export default {
    props: {
        allProjects: {
            type: Array
        }
    },
    data() {
        return {
            fields: [
                {label: "Request On", key: "createdAt", width: "13%"},
                {label: "Project ID", key: "projectId", width: "15%"},
                {label: "Project Name", key: "projectName", width: "26%"},
                {label: "Status", key: "status", width: "13%"},
                {label: "Deadline", key: "date", width: "13%"},
                {label: "Total Cost", key: "totalCost", width: "10%"},
                {label: "", key: "download", width: "10%"},
            ],
        }
    },
    methods: {
         onRowClicked({index}) {
            this.$emit("selectProject", {project: this.allProjects[index]})
        },
    },
    components: {
        DataTable
    }
}
</script>

<style lang="scss" scoped>
.projects-table {
    &__label {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
</style>
