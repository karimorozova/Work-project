<template lang="pug">
.projects-table
    DataTable(
        :fields="fields"
        :tableData="allProjects"
        :hasScroll="hasScroll"
        @onRowClicked="onRowClicked"
    )
        template(slot="ID" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Client Name" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Project Name" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Languages" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Status" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Receivables" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Payables" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="ROI" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Start date" slot-scope="{ field }") 
            span.projects-table__label {{ field.label }}
        template(slot="Deadline" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Project Manager" slot-scope="{ field }")
            span.projects-table__label {{ field.label }}
        template(slot="Edit" slot-scope="{ field }")
            span.projects-table__label
        template(slot="projectId" slot-scope="{ row }")
            span {{ row.projectId }}
        template(slot="clientName" slot-scope="{ row }")
            span {{ clientName(row.customer) }}
        template(slot="projectName" slot-scope="{ row }")
            span {{ row.projectName }}
        template(slot="languages" slot-scope="{ row }")
            span {{ projectLangs(row.jobs) }}
        template(slot="status" slot-scope="{ row }")
            span {{ row.status }}
        template(slot="receivables" slot-scope="{ row }")
            span {{ row.receivables }}
        template(slot="payables" slot-scope="{ row }")
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
            img.projects-table__edit(@click="edit" src="../../assets/images/edit-icon-qa.png")
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
                {label: "ID", key: "projectId", width: "10%"},
                {label: "Client Name", key: "clientName", width: "11%"},
                {label: "Project Name", key: "projectName", width: "12%"},
                {label: "Languages", key: "languages", width: "12%"},
                {label: "Status", key: "status", width: "8%"},
                {label: "Receivables", key: "receivables", width: "7%"},
                {label: "Payables", key: "payables", width: "6%"},
                {label: "ROI", key: "roi", width: "6%"},
                {label: "Start date", key: "createdAt", width: "7%"},
                {label: "Deadline", key: "deadline", width: "7%"},
                {label: "Project Manager", key: "projectManager", width: "11%"},
                {label: "Edit", key: "edit", width: "3%"},
                // {label: "scroll", key: "scroll", width: "16px"},
            ],
        }
    },
    methods: {
        async onRowClicked({index}) {
            this.$emit("selectProject", {project: this.allProjects[index]})
        },
        async estimate(ind) {
            let project = this.allProjects[ind];
            for(let job of project.jobs) {
                job.wordcount = +words;
            }
            let jobsCosts = await this.$http.post('../service/jobcost', project);
            let clientRates = await this.checkClientRates(ind);
            if(clientRates.length) {
                for(let job of project.jobs) {
                    for(let elem of clientRates) {
                        if(job.targetLanguage == elem.target) {
                            job.cost = parseFloat((job.wordcount*elem.rate).toFixed(2));
                        }
                    }
                }
                let saveJobs = await this.$http.post('../xtm/savejobs', {id: project._id, jobs: project.jobs, metrics: project.metrics});
            }
            this.$emit('refreshProjects');
        },
        async checkClientRates(ind) {
            let id = this.allProjects[ind].customer;
            let client = await this.$http.get(`../clientsapi/client?id=${id}`);
            let combinations = client.body.languageCombinations;
            let result = [];
            for(let comb of combinations) {
                if(comb.active && comb.service.title == this.allProjects[ind].service && 
                    comb.source.lang == this.allProjects[ind].sourceLanguage.lang) {
                    for(let lang of this.allProjects[ind].targetLanguages) {
                        if(lang.lang == comb.target.lang) {
                            for(let industry of comb.industry) {
                                if(industry.name === this.allProjects[ind].industry) {
                                    result.push({
                                        target: comb.target.lang,
                                        rate: industry.rate
                                    })
                                }    
                            }
                        }
                    }
                }
            }
            return result;
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
    &__edit {
        cursor: pointer;
    }
}
</style>
