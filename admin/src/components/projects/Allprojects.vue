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
                tr(v-for="(project, ind) in allProjects" @click="showJobs(project._id)")
                    td {{ project.createdAt }}
                    td {{ project.projectId }}
                    td {{ project.projectName }}
                    td {{ project.status }}
                    td {{ project.date }}
                    td
                        .buttons
                            button.metrics(:disabled="project.jobs[0].wordcount != ''" @click="estimate(ind)" :class="{disabled: project.jobs[0].wordcount}") Get metrics and cost
                            button.mail(:disabled="project.status != 'Open'" @click="sendMail(ind)" :class="{disabled: project.status != 'Open'}") Send mail
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
                    td 
                        span {{ job.cost }} 
                            span(v-if="job.cost") &euro;
</template>

<script>
import moment from "moment";

export default {
    data() {
        return {
            projects: [],
            jobs: [],
            jobsShow: false
        }
    },
    methods: {
        async getProjects() {
            let projectsArray = await this.$http.get('../api/allprojects');
            this.projects = projectsArray.body;
        },
        async estimate(ind) {
            let project = this.allProjects[ind];
            let words = await this.$http.get(`../xtm/xtmwords?projectId=${project.xtmId}`);
            for(let job of project.jobs) {
                job.wordcount = +words.body;
            }
            let jobsCosts = await this.$http.post('../service/jobcost', project);
            let clientRates = await this.checkClient(ind);
            if(clientRates.length) {
                console.log(clientRates);
                for(let job of project.jobs) {
                    console.log(job);
                    for(let elem of clientRates) {
                        if(job.targetLanguage == elem.target) {
                            job.cost = parseFloat((job.wordcount*elem.rate).toFixed(2));
                        }
                    }
                } 
            }
            let saveProject = await this.$http.post('../xtm/saveproject', project);
            // let final = await this.$http.post('../xtm/savejobs', {id: project._id, jobs: project.jobs});
            await this.getProjects();
            this.showJobs(project._id);
        },
        async checkClient(ind) {
            let id = this.allProjects[ind].customer;
            let client = await this.$http.get(`../clientsapi/client?id=${id}`);
            let combinations = client.body.languageCombinations;
            let result = [];
            for(let comb of combinations) {
                if(comb.active && comb.service == this.allProjects[ind].service && 
                    comb.source.lang == this.allProjects[ind].sourceLanguage.lang) {
                    for(let lang of this.allProjects[ind].targetLanguages) {
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
        showJobs(id) {
            this.jobsShow = true;
            let project = this.allProjects.find(item => {
                return item._id == id
            });
            this.jobs = project.jobs;
        },
        async sendMail(ind) {
            console.log(this.allProjects[ind].customer);
            let result = await this.$http.post('../clientsapi/mailtoclient', this.allProjects[ind]);
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
        allProjects() {
            let result = [];
            if(this.projects.length) {
                result = this.projects;
            }
            return result;
        },
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

.buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
}

.metrics {
    width: 170px;
    margin-right: 5px;
    padding: 3px;
    color: #FFF;
    background-color: green;
    cursor: pointer;
}

.mail {
    width: 100px;
    padding: 3px;
    color: #FFF;
    background-color: green;
    cursor: pointer;
}

.disabled {
    opacity: 0.4;
    cursor: default;
}

</style>
