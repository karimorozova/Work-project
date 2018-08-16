<template lang="pug">
    .all-projects
        table.projectTable
            thead
                tr
                    th Requested on
                    th ProjectId
                    th Project Name
                    th Status
                    th Suggested deadline
                    th 
            tbody
                tr(v-for="(project, ind) in projects" @click="showJobs(ind)")
                    td {{ project.createdAt }}
                    td {{ project.projectId }}
                    td {{ project.projectName }}
                    td {{ project.status }}
                    td {{ project.date }}
                    td 
                        input.metrics(v-if="!project.jobs[0].wordcount" type="button" value="Get metrics and cost" @click="estimate(ind)")
        table.jobsTable(v-if="jobsShow")
            thead
                tr
                    th Language Pair
                    th Status
                    th Wordcount
                    th Cost
            tbody
                tr(v-for="(job, i) in jobs" @click="edit(i)")
                    td {{ job.sourceLanguage }} >> {{ job.targetLanguage }}
                    td {{ job.status }}
                    td {{ job.wordcount }}
                    td {{ job.cost }}
</template>

<script>
import moment from "moment";

export default {
    data() {
        return {
            projects: [],
            jobs: [],
            jobsShow: false
            // project: {}
        }
    },
    methods: {
        async getProjects() {
            let projectsArray = await this.$http.get('../api/allprojects');
            this.projects = projectsArray.body;
        },
        async estimate(ind) {
            let project = this.projects[ind];
            let words = await this.$http.get(`../xtm/xtmwords?projectId=${project.xtmId}`);
            console.log(words);
            for(let job of project.jobs) {
                job.wordcount = +words.body;
            }
            let saveProject = await this.$http.post('../xtm/saveproject', project);
            let jobsCosts = await this.$http.post('../service/jobcost', project);
            let clientRates = await this.checkClient(ind);
            if(clientRates.length) {
                for(let job of project.jobs) {
                    for(let elem of clientRates) {
                        if(job.targetLanguage == elem.target) {
                            job.cost == job.wordcount*elem.rate;
                        }
                    }
                } 
            }
            await this.getProjects();
        },
        async checkClient(ind) {
            let id = this.projects[ind].customer;
            let client = await this.$http.get(`../clientsapi/client?id=${id}`);
            let combinations = client.body.languageCombinations;
            let result = [];
            for(let comb of combinations) {
                if(comb.active && comb.service == this.projects[ind].service && 
                    comb.source.lang == this.projects[ind].sourceLanguage.lang) {
                    for(let lang of this.projects[ind].targetLanguages) {
                        if(lang.lang == comb.target.lang) {
                            result.push({
                                target: comb.target.lang,
                                rate: comb.rate
                            })
                        }
                    }
                }
            }
            return result;
        },
        showJobs(ind) {
            this.jobsShow = true;
            this.jobs = this.projects[ind].jobs;
        },
        async edit(i) {
            let jobId = this.project.jobs[i].id;
            this.$axios.$get(`../xtm/editor?jobId=${jobId}`)
            .then(res => {
                let link = document.createElement('a');
                link.href = res;
                link.target = '_blank';
                link.click();
            })
            .catch(err => {
                console.log(err)
            })
        }
    },
    computed: {
        requestDate() {
            let result = '';
            if(this.project.createdAt) {
                result = moment(this.project.createdAt).format('DD-MM-YYYY');
            }
            return result;
        },
        deadline() {
            let result = '';
            if(this.project.date) {
                result = moment(this.project.date).format('DD-MM-YYYY');
            }
            return result;
        }
    },
    mounted() {
        this.getProjects();
    }
}
</script>

<style lang="scss" scoped>

.all-projects {
  margin: 20px;
}

.projectTable, .jobsTable {
    border: 1px solid #67573E;
    border-collapse: collapse;
    margin-bottom: 20px;
    width: 900px;
    th, td {
        border:1px solid #67573E;
    }
}

.metrics {
    margin: 10px;
    padding: 3px;
    color: #FFF;
    background-color: green;
}

</style>
