<template lang="pug">
    .invoices
        .invoices__title
            p Invoices
        .invoices__main
            p Coming soon ...
        table.projectTable
            thead
                tr
                    th ProjectId
                    th Project Name
                    th Status
            tbody
                tr
                    td {{ project.projectId }}
                    td {{ project.projectName }}
                    td {{ project.status }}
        table.jobsTable
            thead
                tr
                    th Language Pair
                    th Status
                    th Wordcount
            tbody
                tr(v-for="job in project.jobs")
                    td {{ job.sourceLanguage }} >> {{ job.targetLanguage }}
                    td {{ job.status }}
                    td {{ job.wordcount }}
</template>

<script>
export default {
    data() {
        return {
            project: {},
            wordcount: ''
        }
    },
    methods: {
        async getProjects() {
            this.$axios.$get('/api/allprojects')
            .then(res => {
                console.log(res)
                this.project = res[0];
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
            .catch(err => {
                console.log(err)
            })
        },
        // async getProjectInfo() {
        //     this.$axios.$get('/xtm/customer-projects')
        //     .then(res => {
        //         this.project = res;
        //     })
        //     .then(res => {})
        //     this.$axios.$get('/xtm/status')
        //     .then(res => {
        //         console.log(res);
        //         this.project = res;
        //     })
        //     .then(result => {
        //         this.getWords();
        //     })
        //     .catch(err => console.log(err))
        // },
        // async getWords() {
        //     this.$axios.$get('/xtm/xtmwords?projectId=5500')
        //     .then(res => {
        //         console.log(res);
        //         this.wordcount = res;
        //         for(let i = 0; i < this.project.jobs.length; i++) {
        //             this.project.jobs[i].wordcount = res
        //         }
        //     })
        //     .catch(err => console.log(err))
        // }
    },
    mounted() {
        this.getProjects();
        // this.getProjectInfo();
        // this.getWords()
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
