<template lang="pug">
    .projects-table
        .projects-table__filters
        .projects-table__table
            DataTable(
                :fields="tableFields"
                :tableData="projects"
                :bodyClass="projects.length < 12 ? 'tbody_visible-overflow' : ''"
                :tableHeadRowClass="projects.length < 12 ? 'tbody_visible-overflow' : ''"
                @onRowClicked="getDetails"
            )
                .projects-table__header(slot="headerRequestDate" slot-scope="{ field }") {{ field.label }}
                .projects-table__header(slot="headerProjectId" slot-scope="{ field }") {{ field.label }}
                .projects-table__header(slot="headerProjectName" slot-scope="{ field }") {{ field.label }}
                .projects-table__header(slot="headerDeadline" slot-scope="{ field }") {{ field.label }}
                .projects-table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
                .projects-table__header(slot="headerTotalCost" slot-scope="{ field }") {{ field.label }}
                .projects-table__header(slot="headerDownload" slot-scope="{ field }") {{ field.label }}
                .projects-table__data(slot="requestDate" slot-scope="{ row, index }") {{ getFormattedDate(row.createdAt) }}
                .projects-table__data(slot="projectId" slot-scope="{ row, index }") {{ row.projectId }}
                .projects-table__data(slot="projectName" slot-scope="{ row, index }") {{ row.projectName }}
                .projects-table__data(slot="deadline" slot-scope="{ row, index }") {{ getFormattedDate(row.deadline) }}
                .projects-table__data(slot="status" slot-scope="{ row, index }") {{ row.status }}
                .projects-table__data(slot="totalCost" slot-scope="{ row, index }") {{ row.finance.Price.receivables }}
                    .projects-table__currency(v-if="row.finance.Price.receivables") &euro;
                .projects-table__data.projects-table_centered(slot="download" slot-scope="{ row, index }")
                    img.projects-table__icon(v-if="isDownload(row)" src="../../assets/images/download.png" @click.stop="download(index)")
</template>

<script>
import moment from "moment";
import DataTable from "../Tables/DataTable";
import tableFields from "~/mixins/tableFields";

export default {
    mixins: [tableFields],
    props: {
        projects: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            fields: [
                {label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: Math.floor(970*0.14), padding: "0"},
                {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: Math.floor(970*0.25), padding: "0"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: Math.floor(970*0.17), padding: "0"},
                {label: "Request On", headerKey: "headerRequestDate", key: "requestDate", width: Math.floor(970*0.12), padding: "0"},
                {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: Math.floor(970*0.12), padding: "0"},
                {label: "Total Cost", headerKey: "headerTotalCost", key: "totalCost", width: Math.floor(970*0.12), padding: "0"},
                {label: "", headerKey: "headerDownload", key: "download", width: 0, padding: "0"},
            ],
            tableWidth: 970
        }
    },
    methods: {
        getFormattedDate(date) {
            return moment(date).format("DD-MM-YYYY");
        },
        isDownload(project) {
            const statuses = ['Ready for Delivery', 'Delivered'];
            return statuses.indexOf(project.status) !== -1;
        },
        async clientInfo() {
          const token = this.jsess;
          const result = await this.$axios.$get(`/portal/clientinfo?token=${token}`);
            this.companyName = result.client.name;
        },
        async download(index) {
            console.log('Start downloading project files...', index);
            // let result = await this.$axios.get(`/portal/projectFiles?projectId=${this.clientProjects[index].id}`, {withCredentials: true});
            // let file = await this.$axios.get(`/portal/downloadProject?projectId=${this.clientProjects[index].id}`);

            // let link = document.createElement('a');
            //     link.href = file.data;
            //     link.click();
            // let del = await this.$axios.get(`/portal/deleteZip?projectId=${this.clientProjects[index].id}`);
        },
        getDetails({index}) {
            const id = this.projects[index]._id
            this.$router.push(`/projects/details/${id}`);
        }
    },
    components: {
        DataTable
    }
}
</script>


<style lang="scss" scoped>

.projects-table {
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
        cursor: pointer;
    }
    &_centered {
        justify-content: center;
    }
}

</style>
