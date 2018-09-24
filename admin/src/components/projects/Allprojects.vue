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
                    td {{ project.createdAt.split('T')[0].split('-').reverse().join('-') }}
                    td {{ project.projectId }}
                    td {{ project.projectName }}
                    td {{ project.status }}
                    td {{ project.date.split('T')[0].split('-').reverse().join('-') }}
                    td
                        .buttons
                            button.metrics(:disabled="project.jobs[0].wordcount != ''" @click="estimate(ind)" :class="{disabled: project.jobs[0].wordcount}") Get metrics and cost
                            button.mail(:disabled="project.status != 'Open'" @click="sendMail(ind)" :class="{disabled: project.status != 'Open'}") Send e-mail
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
        .vendors-select(v-if="jobsShow")
            label.vendors-select__title Vendors
            Vendorselect(:selectedVendors="selectedVendors"
                :filteredVendors="filteredVendors"
                @changeVend="changeVend")
            button.mail(@click="vendorsMail") Send e-mail(s)
        .hide-jobs(v-if="jobsShow")
            button.hide-jobs__but(@click="hideJobs") Hide jobs
</template>

<script>
import moment from "moment";
import Vendorselect from './Vendorselect';

export default {
    data() {
        return {
            projects: [],
            jobs: [],
            jobsShow: false,
            selectedVendors: [{name: 'All'}],
        }
    },
    methods: {
        hideJobs() {
            this.jobsShow = false;
        },
        changeVend(data) {
            if(this.selectedVendors[0].name == 'All') {
                this.selectedVendors = [];
                this.selectedVendors.push(data.vendor);
            } else {
                if(this.filteredVendors.indexOf(data.vendor._id) != -1) {
                    this.selectedVendors = this.selectedVendors.filter(item => {
                        return item._id != data.vendor._id
                    })
                } else {
                    this.selectedVendors.push(data.vendor);                    
                }
            }
            if(!this.selectedVendors.length) {
                this.selectedVendors = [{name: "All"}]
            }
        },
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
            console.log(combinations);
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
            console.log("result: " + result);
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
            let result = await this.$http.post('../clientsapi/mailtoclient', this.allProjects[ind]);
        },
        async vendorsMail() {
            let result = await this.$http.post('../vendorsapi/mailtovendors', JSON.stringify(this.selectedVendors));
        },
        async edit(i) {
            let jobId = this.jobs[i].id;
            this.$http.get(`../xtm/editor?jobId=${jobId}`)
            .then(res => {
                let link = document.createElement('a');
                link.href = res.data;
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
        },
        filteredVendors() {
            let result = [];
            if(this.selectedVendors[0].name == 'All') {
                result = ["All"]
            } else {
                for(let ven of this.selectedVendors) {
                    result.push(ven._id)
                }
            }
            return result;
        }
    },
    mounted() {
        this.getProjects();
    },
    components: {
        Vendorselect
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

.vendors-select {
    display: flex;
    align-items: center;
    &__title {
        margin-bottom: 0;
        margin-right: 10px;
    }
    .mail {
        margin-left: 10px;
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
    width: 110px;
    padding: 3px;
    color: #FFF;
    background-color: green;
    cursor: pointer;
}

.disabled {
    opacity: 0.4;
    cursor: default;
}

.hide-jobs {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    &__but {
        width: 110px;
        padding: 3px;
        color: white;
        background-color: #F5876E;
        border: none;
        outline: none;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 0 3px 10px #67573E;
        &:active {
            box-shadow: 0 0 5px #67573E;
        }
    }
}

</style>
