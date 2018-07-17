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
                    td {{ project.createdAt }}
                    td {{ project.projectId }}
                    td {{ project.projectName }}
                    td {{ project.status }}
                    td {{ project.date }}
        table.jobsTable
            thead
                tr
                    th Language Pair
                    th Status
                    th Wordcount
            tbody
                tr(v-for="(job, i) in project.jobs" @click="edit(i)")
                    td {{ job.sourceLanguage }} >> {{ job.targetLanguage }}
                    td {{ job.status }}
                    td {{ job.wordcount }}
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
            this.$axios.$get('/api/allprojects')
            .then(res => {
                this.project = res[0];
                this.project.createdAt = moment(this.project.createdAt).format('DD-MM-YYYY');
                this.project.date = moment(this.project.date).format('DD-MM-YYYY');
            })
            .then(res => {
                if(this.project.jobs) {
                    this.$axios.$get(`/xtm/xtmwords?projectId=${this.project.jobs[0].id}`)
                    .then(res => {
                        this.project.jobs.forEach(item => {
                            item.wordcount = res;
                        });
                    })
                    .catch(err => console.log(err));
                }
            })
            .then(res => {
                for(let i = 0; i < this.project.jobs.length; i++) {
                    this.$axios.$get(`/xtm/metrics?projectId=${this.project.jobs[i].id}`)
                    .then(res => {
                        this.project.jobs[i].id = res[0].jobsMetrics[0].jobId;
                    })
                    .catch(err => {
                        console.log(err);
                    })

                }
            })
            .catch(err => {
                console.log(err)
            })
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
