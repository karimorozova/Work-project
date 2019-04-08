<template lang="pug">
    .projects-table
        .projects-table__filters
        .projects-table__table
            DataTable(
                :fields="fields"
                :tableData="projects"
            )
                .projects-table__header(slot="headerRequestDate" slot-scope="{ field }") {{ field.label }}
                .projects-table__header(slot="headerProjectId" slot-scope="{ field }") {{ field.label }}
                .projects-table__header(slot="headerProjectName" slot-scope="{ field }") {{ field.label }}
                .projects-table__header(slot="headerDeadline" slot-scope="{ field }") {{ field.label }}
                .projects-table__header(slot="headerTotalCost" slot-scope="{ field }") {{ field.label }}
                .projects-table__header(slot="headerDownload" slot-scope="{ field }") {{ field.label }}
                .projects-table__data(slot="requestDate" slot-scope="{ row, index }") {{ getFormattedDate(row.createdAt) }}
                .projects-table__data(slot="projectId" slot-scope="{ row, index }") {{ row.projectId }}
                .projects-table__data(slot="projectName" slot-scope="{ row, index }") {{ row.projectName }}
                .projects-table__data(slot="deadline" slot-scope="{ row, index }") {{ getFormattedDate(row.deadline) }}
                .projects-table__data(slot="totalCost" slot-scope="{ row, index }") {{ row.finance.Price.receivables }}
                    .projects-table__currency(v-if="row.finance.Price.receivables") &euro;
                .projects-table__data.projects-table_centered(slot="download" slot-scope="{ row, index }")
                    img.projects-table__icon(src="../../assets/images/download.png" @click.stop="download(index)")
</template>

<script>
import moment from "moment";
import DataTable from "../Tables/DataTable";

export default {
    props: {
        projects : {
            type: Array
        },
        requestDateFilter: {
            type: Object
        },
        projectNameFilter: {
            type: String
        },
        deadlineFilter: {
            type: Object
        },
        projectIdFilter: {
            type: String
        },
        sourceLangsFilter: {
            type: String
        },
        targetLangsFilter: {
            type: String
        },
        statusFilter: {
            type: String
        },
    },
    data() {
        return {
            clientQuotes: [],
            allProjectsFiltered: [],
            allProjects: [],
            fields: [
                {label: "Request On", headerKey: "headerRequestDate", key: "requestDate", width: "15%", padding: "0"},
                {label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: "16%", padding: "0"},
                {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "24%", padding: "0"},
                {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "16%", padding: "0"},
                {label: "Total Cost", headerKey: "headerTotalCost", key: "totalCost", width: "15%", padding: "0"},
                {label: "", headerKey: "headerDownload", key: "download", width: "14%", padding: "0"},
            ]
        }
    },
    methods: {
        getFormattedDate(date) {
            return moment(date).format("DD-MM-YYYY");
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
        }
    },
    computed: {
        clientProjects() {
            let result = [];
            let filtered = [];
            if(this.projects.length) {
                let array = this.projects;
                let finalDeadline = '';
                // for(let i = 0; i < array.length; i++) {
                // if(array[i].status == "CLOSED") {
                //         result.push({
                //         requestOn: moment(new Date(array[i].startDate.millisGMT)).format("DD-MM-YYYY"),
                //         id: array[i].id,
                //         startDate: array[i].startDate,
                //         idNumber: array[i].idNumber,
                //         name: array[i].name,
                //         status: array[i].status,
                //         deadline: array[i].deadline,
                //         totalAgreed: array[i].totalAgreed,
                //         projectManager: array[i].projectManager,
                //         service: array[i].service,
                //         specialization: array[i].specialization,
                //         languageCombinations: array[i].languageCombinations,
                //         fullInfoAppear: false
                //         })
                //     }
                // }
                array.map((project)=>{
                  result.push({
                            requestOn: moment(project.createdAt).format("DD-MM-YYYY"),
                            id: project._id,
                            startDate: moment(project.createdAt).format("DD-MM-YYYY"),
                            idNumber: project.projectId,
                            name: project.projectName,
                            // status: array[i].status,
                            deadline: moment(project.deadline).format("DD-MM-YYYY"),
                            totalAgreed: {formattedAmount:1000},
                            // projectManager: array[i].projectManager,
                            // service: array[i].service,
                            // specialization: array[i].specialization,
                            // languageCombinations: array[i].languageCombinations,
                            // fullInfoAppear: false
                            })
                });

                filtered = result;
                // if(this.requestDateFilter.from) {
                //     filtered = filtered.filter(item => {
                //         if (item.startDate.millisGMT >= this.requestDateFilter.from) {
                //             return true
                //         }
                //         return false
                //     })
                // }
                //
                // if(this.requestDateFilter.to) {
                //     filtered = filtered.filter(item => {
                //         if (item.startDate.millisGMT <= this.requestDateFilter.to) {
                //             return true
                //         }
                //         return false
                //     })
                // }
                //
                // if(this.deadlineFilter.from) {
                //     filtered = filtered.filter(item => {
                //         if (item.deadline.millisGMT >= this.deadlineFilter.from) {
                //             return true
                //         }
                //         return false
                //     })
                // }
                //
                // if(this.deadlineFilter.to) {
                //     filtered = filtered.filter(item => {
                //         if (item.deadline.millisGMT <= this.deadlineFilter.to) {
                //             return true
                //         }
                //         return false
                //     })
                // }
                //
                // if (this.projectNameFilter.length) {
                //     filtered = filtered.filter(item => {
                //         if (item.name.toLowerCase().indexOf(this.projectNameFilter.toLowerCase()) != -1) {
                //             return true
                //         }
                //         return false
                //     })
                // }
                //
                // if (this.projectIdFilter.length) {
                //     filtered = filtered.filter(item => {
                //         if (item.idNumber.indexOf(this.projectIdFilter) != -1) {
                //             return true
                //         }
                //         return false
                //     })
                // }
                //
                // if (this.sourceLangsFilter.length) {
                //     filtered = filtered.filter(item => {
                //         if (item.languageCombinations.length) {
                //             for (let i = 0; i < item.languageCombinations.length; i++) {
                //                 if (item.languageCombinations[i].sourceLanguage.name.indexOf(this.sourceLangsFilter) != -1) {
                //                     return true
                //                 }
                //             }
                //         }
                //         return false
                //     })
                // }
                //
                // if (this.targetLangsFilter.length) {
                //     filtered = filtered.filter(item => {
                //         if (item.languageCombinations.length) {
                //             for (let i = 0; i < item.languageCombinations.length; i++) {
                //                 if (item.languageCombinations[i].targetLanguage.name.indexOf(this.targetLangsFilter) != -1) {
                //                     return true
                //                 }
                //             }
                //         }
                //         return false
                //     })
                // }
                //
                // if (this.statusFilter.length) {
                //     filtered = filtered.filter(item => {
                //         if (item.status.toLowerCase().indexOf(this.statusFilter.toLowerCase()) != -1) {
                //             return true
                //         }
                //         return false
                //     })
                // }
                //
                // if (this.requestSort) {
                //     filtered.sort( (a, b) => { return a.startDate.millisGMT - b.startDate.millisGMT })
                // } else { filtered.sort( (a, b) => { return b.startDate.millisGMT - a.startDate.millisGMT }) }
                //
                // if (this.deadlineSort) {
                //     filtered.sort( (a, b) => { return a.deadline.millisGMT - b.deadline.millisGMT })
                // } else { filtered.sort( (a, b) => { return b.deadline.millisGMT - a.deadline.millisGMT }) }
                //
                // if (this.projectIdSort) {
                //     filtered.sort( (a, b) => {return  (a.idNumber > b.idNumber) ? 1 : ((b.idNumber > a.idNumber) ? -1 : 0) })
                // } else { filtered.sort( (a, b) => {return b.idNumber - a.idNumber }) }
                //
                // if (this.projectNameSort) {
                //     filtered.sort( (a, b) => { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0) })
                // } else { filtered.sort( (a, b) => { return b.name - a.name }) }

            }
            return filtered;
        },
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
