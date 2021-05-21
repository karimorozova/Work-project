<template lang="pug">
.requests-table
    DataTable(
        :fields="fields"
        :tableData="allProjects"
        :bodyClass="['all-projects', {'tbody_visible-overflow': allProjects.length < 17}]"
        :tableheadRowClass="allProjects.length < 17 ? 'tbody_visible-overflow' : ''"
        @onRowClicked="onRowClicked"
        @bottomScrolled="bottomScrolled"
    )
        //template(slot="headerProjectId" slot-scope="{ field }")
        //    span.requests-table__label {{ field.label }}
        //template(slot="headerClientName" slot-scope="{ field }")
        //    span.requests-table__label {{ field.label }}
        template(slot="headerProjectName" slot-scope="{ field }")
            span.requests-table__label {{ field.label }}
        //template(slot="headerLanguages" slot-scope="{ field }")
        //    span.requests-table__label {{ field.label }}
        //template(slot="headerStatus" slot-scope="{ field }")
        //    span.requests-table__label {{ field.label }}
        //template(slot="headerStartDate" slot-scope="{ field }")
        //    span.requests-table__label {{ field.label }}
        //template(slot="headerDeadline" slot-scope="{ field }")
        //    span.requests-table__label {{ field.label }}
        //template(slot="headerProjectManager" slot-scope="{ field }")
        //    span.requests-table__label {{ field.label }}
        //template(slot="headerEdit" slot-scope="{ field }")
        //    span.requests-table__label

        template(slot="projectId" slot-scope="{ row }")
            span {{ getId(row) }}
        template(slot="clientName" slot-scope="{ row }")
            span {{ clientName(row.customer) }}
        template(slot="projectName" slot-scope="{ row }")
            span {{ row.projectName }}
        template(slot="languages" slot-scope="{ row }")
            span {{ getRequestLangs(row) }}
        template(slot="status" slot-scope="{ row }")
            span {{ row.status }}
        template(slot="startDate" slot-scope="{ row }") 
            span {{ row.startDate.split('T')[0].split('-').reverse().join('-') }}
        template(slot="deadline" slot-scope="{ row }")
            span {{ row.deadline.split('T')[0].split('-').reverse().join('-') }}              
        template(slot="projectManager" slot-scope="{ row }")
            span {{ row.projectManager.firstName }} {{ row.projectManager.lastName }}              
        template(slot="edit" slot-scope="{ row }" style="{'z-index': 100}")
            span.requests-table__icon(@click.stop="edit")
                img.requests-table__edit(src="../../assets/images/edit-icon-qa.png")
</template>

<script>
import DataTable from "../DataTable";

export default {
    props: {
        allProjects: {
            type: Array
        }
    },
    data() {
        return {
            fields: [
              {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "100%"},


              // {label: "ID", headerKey: "headerProjectId", key: "projectId", width: "9%"},
                // {label: "Client Name", headerKey: "headerClientName", key: "clientName", width: "10%"},
                // {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "12%"},
                // {label: "Languages", headerKey: "headerLanguages", key: "languages", width: "20%"},
                // {label: "Status", headerKey: "headerStatus", key: "status", width: "8%"},
                // {label: "Start date", headerKey: "headerStartDate", key: "startDate", width: "9%"},
                // {label: "Suggested Deadline", headerKey: "headerDeadline", key: "deadline", width: "13%"},
                // {label: "Assigned To", headerKey: "headerProjectManager", key: "projectManager", width: "14%"},
                // {label: "Edit", headerKey: "headerEdit", key: "edit", width: "5%"},
            ],
        }
    },
    methods: {
        async onRowClicked({index}) {
            this.$emit("selectProject", {project: this.allProjects[index]})
        },
        getId(row) {
            return row.projectId || row.requestId;
        },
        clientName(elem) {
            return elem.name;
        },
        getRequestLangs(row) {
            return row.targetLanguages.reduce((prev, cur) => {
                if(row.sourceLanguage) {
                    return prev + `${row.sourceLanguage.symbol} >> ${cur.symbol}; `;
                }
                return prev + `${cur.symbol} / ${row.packageSize.size}; `;
            }, "")
        },
        edit() {
            console.log("edit");
        },
        bottomScrolled() {
            this.$emit("bottomScrolled");
        }
    },
    components: {
        DataTable
    }
}
</script>

<style lang="scss" scoped>
.requests-table {
    &__label {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &__icon {
        height: 100%;
        width: 100%;
        z-index: 100;
    }
    &__edit {
        cursor: pointer;
    }
}
</style>
