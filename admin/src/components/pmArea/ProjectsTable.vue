<template lang="pug">
.projects-table
    DataTable(
        :fields="fields"
        :tableData="allProjects"
        :hasScroll="hasScroll"
        @onRowClicked="onRowClicked"
    )
        template(slot="headerProjectId" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerClientName" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerProjectName" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerLanguages" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerStatus" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerReceivables" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerPayables" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerRoi" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerCreatedAt" slot-scope="{ field }") 
            span.projects-table__label {{ field.label }}
        template(slot="headerDeadline" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerProjectManager" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="headerEdit" slot-scope="{ field }")
            span.projects-table__label
        template(slot="projectId" slot-scope="{ row }")
            span {{ row.projectId }}
        template(slot="clientName" slot-scope="{ row }")
            span {{ clientName(row.customer) }}
        template(slot="projectName" slot-scope="{ row }")
            span {{ row.projectName }}
        template(slot="languages" slot-scope="{ row }")
            span {{ projectLangs(row.tasks) }}
        template(slot="status" slot-scope="{ row }")
            span {{ row.status }}
        template(slot="receivables" slot-scope="{ row }")
            span(v-if="row.receivables") &euro;
            span {{ row.receivables }}
        template(slot="payables" slot-scope="{ row }")
            span(v-if="row.payables") &euro;
            span {{ row.payables }}
        template(slot="roi" slot-scope="{ row }")
            span {{ row.roi }}
        template(slot="createdAt" slot-scope="{ row }") 
            span {{ row.createdAt.split('T')[0].split('-').reverse().join('-') }}
        template(slot="deadline" slot-scope="{ row }")
            span {{ row.deadline.split('T')[0].split('-').reverse().join('-') }}              
        template(slot="projectManager" slot-scope="{ row }")
            span {{ row.projectManager.firstName }} {{ row.projectManager.lastName }}              
        template(slot="edit" slot-scope="{ row }" style="{'z-index': 100}")
            span.projects-table__icon(@click.stop="edit")
                img.projects-table__edit(src="../../assets/images/edit-icon-qa.png")
</template>

<script>
import DataTable from "../DataTable";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        allProjects: {
            type: Array
        }
    },
    data() {
        return {
            fields: [
                {label: "ID", headerKey: "headerProjectiId", key: "projectId", width: "10%"},
                {label: "Client Name", headerKey: "headerClientName", key: "clientName", width: "11%"},
                {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "12%"},
                {label: "Languages", headerKey: "headerLanguages", key: "languages", width: "12%"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "8%"},
                {label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "7%"},
                {label: "Payables", headerKey: "headerPayables", key: "payables", width: "6%"},
                {label: "ROI", headerKey: "headerRoi", key: "roi", width: "6%"},
                {label: "Start date", headerKey: "headerCreatedAt", key: "createdAt", width: "7%"},
                {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "7%"},
                {label: "Project Manager", headerKey: "headerProjectManager", key: "projectManager", width: "11%"},
                {label: "Edit", headerKey: "headerEdit", key: "edit", width: "3%"},
            ],
        }
    },
    methods: {
        async onRowClicked({index}) {
            this.$emit("selectProject", {project: this.allProjects[index]})
        },
        clientName(elem) {
            return elem.name;
        },
        projectLangs(arr) {
            return arr.reduce((init, cur) => {
                return init + cur.sourceLanguage + ' >> ' + cur.targetLanguage + '; '
            }, "")
        },
        edit() {
            console.log("edit");
        }
    },
    computed: {
        hasScroll() {
            return document.body.offsetWidth > 1024 && this.allProjects.length > 5;
        }
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
