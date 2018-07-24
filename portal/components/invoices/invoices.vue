<template lang="pug">
    .invoices
        .invoices__title
            p Invoices
        .invoices__main
            p Coming soon ...
        table.projectTable
            thead
                tr
                    th Requested on
                    th ProjectId
                    th Project Name
                    th Status
                    th Suggested deadline
            tbody
                tr
                    td {{ requestDate }}
                    td {{ project.projectId }}
                    td {{ project.projectName }}
                    td {{ project.status }}
                    td {{ deadline }}
        table.jobsTable
            thead
                tr
                    th Language Pair
                    th Status
                    th Wordcount
                    th Cost
            tbody
                tr(v-for="(job, i) in project.jobs" @click="edit(i)")
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
            project: {}
        }
    },
    methods: {
        async getProjects() {
            let projectsArray = await this.$axios.$get('/api/allprojects');
            this.project = projectsArray[0];
            if(this.project.jobs) {
                let words = await this.$axios.$get(`/xtm/xtmwords?projectId=${this.project.xtmId}`);
                this.project.jobs.forEach(item => {
                    item.wordcount = words;
                });
                 
            let saveProject = await this.$axios.$post('/xtm/saveproject', this.project);
            let jobsCosts = await this.$axios.$post('/service/jobcost', this.project);
            projectsArray = await this.$axios.$get('/api/allprojects');
            this.project = projectsArray[0];
            }
        },
        async edit(i) {
            let jobId = this.project.jobs[i].id;
            this.$axios.$get(`/xtm/editor?jobId=${jobId}`)
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

<style lang="scss">
    @import "../../assets/styles/invoices/invoices.scss";
.projectTable, .jobsTable {
    border: 1px solid #67573E;
    border-collapse: collapse;
    margin-bottom: 20px;
    width: 650px;
    th, td {
        border:1px solid #67573E;
    }
}
</style>
