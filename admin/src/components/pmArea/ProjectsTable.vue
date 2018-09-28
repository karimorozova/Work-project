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
        //- template(slot="scroll" slot-scope="{ field }" v-if="needScroll")
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
                {label: "Request On", key: "createdAt", width: "13%"},
                {label: "Project ID", key: "projectId", width: "15%"},
                {label: "Project Name", key: "projectName", width: "26%"},
                {label: "Status", key: "status", width: "13%"},
                {label: "Deadline", key: "date", width: "13%"},
                {label: "Total Cost", key: "totalCost", width: "10%"},
                {label: "", key: "download", width: "10%"},
                // {label: "scroll", key: "scroll", width: "16px"},
            ],
        }
    },
    methods: {
        async onRowClicked({index}) {
            if(!this.allProjects[index].metrics) {
                await this.estimate(index);
            }
            this.$emit("selectProject", {project: this.allProjects[index]})
        },
        async estimate(ind) {
            let project = this.allProjects[ind];
            let metrics = await this.$http.get(`../xtm/metrics?projectId=${project.xtmId}`);
            project.metrics = {
                iceMatch: metrics.body[0].coreMetrics.exactMatchWords,
                fuzzyMatch95: metrics.body[0].coreMetrics.fuzzyForwardC1Words,
                fuzzyMatch85: metrics.body[0].coreMetrics.fuzzyForwardC2Words,
                fuzzyMatch75: metrics.body[0].coreMetrics.fuzzyForwardC3Words,
                fuzzyRepeat95: metrics.body[0].coreMetrics.fuzzyMatchC1Words,
                fuzzyRepeat85: metrics.body[0].coreMetrics.fuzzyMatchC2Words,
                fuzzyRepeat75: metrics.body[0].coreMetrics.fuzzyMatchC3Words,
                repeat: metrics.body[0].coreMetrics.leveragedInheritedWords,
                leveragedMatch: metrics.body[0].coreMetrics.leveragedTmWords,
                machineTranslation: metrics.body[0].coreMetrics.machineTranslationWords,
                nonTranslatable: metrics.body[0].coreMetrics.numericWords,
                totalWords: metrics.body[0].coreMetrics.totalWords
            };
            const words = project.metrics.totalWords;
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
    },
    computed: {
        needScroll() {
            return this.allProjects.length > 5;
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
}
</style>
