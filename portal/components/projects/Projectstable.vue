<template lang="pug">
    .root
        .row
            .shortInfo
                .row__columns
                    .col
                        .col__title
                            span Request On
                            img.req_img(src="../../assets/images/white-arrow-down.png" @click="sortReq" :class="{toUp: requestSort}")
                    .col.col-lg
                        .col__title
                            span Project ID
                            img(src="../../assets/images/white-arrow-down.png" @click="sortProjId" :class="{toUp: projectIdSort}")
                    .col.col-xlg
                        .col__title
                            span Project Name
                            img.arrow_down(src="../../assets/images/white-arrow-down.png" @click="sortProjName" :class="{toUp: projectNameSort}")
                    .col.col-md
                        .col__title
                            span Deadline
                            img.arrow_down(src="../../assets/images/white-arrow-down.png" @click="sortDeadline" :class="{toUp: deadlineSort}")
                    .col.col-end
                        span Total Cost
                    .col.col-d
        .scrollArea
            .row(v-for="(project, main) in clientProjects")
                .shortInfo
                    .row__columns_info
                        .col(@click="projectDetails(parent)") {{ project.requestOn }}
                        .col.proj(@click="projectDetails(parent)") {{ project.idNumber }}
                        .col.col-xlg(@click="projectDetails(main)")
                            span {{ project.name }}
                        .col.col-md(v-if="project.deadline" @click="projectDetails(parent)")
                            span {{ project.deadline.formatted.split(' ')[0].split('-').reverse().join('-') }}
                        .col.col-end(@click="projectDetails(parent)")
                            span {{ project.totalAgreed.formattedAmount }}
                        .col.col-d(@click="downloadZip(parent)")
                            img(src="../../assets/images/download.png")

</template>

<script>
import moment from "moment";

export default {
    props: {
        client: {
            type: Object
        },
        user: {
            type: Object
        },
        projects : {
            type: Array
        },
        quotes: {
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
            requestSort: false,
            projectIdSort: false,
            projectNameSort: false,
            deadlineSort: false
        }
    },
    methods: {
        getCookie() {
        // let sessionCookie = document.cookie.split("=")[1];
            if (document.cookie.indexOf("ses") >= 0) {
                return true;
            } else {
                console.log("login failed");
                // alert("Please, Log in!")
                // window.location.replace("/");
            }
        },
        async clientInfo() {
            const result = await this.$axios.request({
                method: "get",
                url: "portal/clientinfo",
                withCredentials: true
            });
            // console.log(result);
            this.companyName = result.data.name;
        },
        projectDetails(index) {
            this.$emit('projectDetails', this.clientProjects[index]);
        },
        sortReq() {
            this.requestSort = !this.requestSort;
        },
        sortProjId() {
            this.projectIdSort = !this.projectIdSort;
        },
        sortProjName() {
            this.projectNameSort = !this.projectNameSort;
        },
        sortDeadline() {
            this.deadlineSort = !this.deadlineSort;
        },
        async downloadZip(index) {
            console.log('Start downloading project files...');
            let result = await this.$axios.get(`/portal/projectFiles?projectId=${this.clientProjects[index].id}`, {withCredentials: true});
            let file = await this.$axios.get(`/portal/downloadProject?projectId=${this.clientProjects[index].id}`);

            let link = document.createElement('a');
                link.href = file.data;
                link.click();
            let del = await this.$axios.get(`/portal/deleteZip?projectId=${this.clientProjects[index].id}`);
        }
    },
    computed: {
        clientProjects() {
            let result = [];
            if(this.projects.length) {
                let array = this.projects;
                let finalDeadline = '';
                for(let i = 0; i < array.length; i++) {
                if(array[i].status == "CLOSED") {
                        result.push({
                        requestOn: moment(new Date(array[i].startDate.millisGMT)).format("DD-MM-YYYY"),
                        id: array[i].id,
                        startDate: array[i].startDate,
                        idNumber: array[i].idNumber,
                        name: array[i].name,
                        status: array[i].status,
                        deadline: array[i].deadline,
                        totalAgreed: array[i].totalAgreed,
                        projectManager: array[i].projectManager,
                        service: array[i].service,
                        specialization: array[i].specialization,
                        languageCombinations: array[i].languageCombinations,
                        fullInfoAppear: false
                        })
                    }
                }

                var filtered = result;
                if(this.requestDateFilter.from) {
                    filtered = filtered.filter(item => {
                        if (item.startDate.millisGMT >= this.requestDateFilter.from) {
                            return true
                        }
                        return false
                    })
                }

                if(this.requestDateFilter.to) {
                    filtered = filtered.filter(item => {
                        if (item.startDate.millisGMT <= this.requestDateFilter.to) {
                            return true
                        }
                        return false
                    })
                }

                if(this.deadlineFilter.from) {
                    filtered = filtered.filter(item => {
                        if (item.deadline.millisGMT >= this.deadlineFilter.from) {
                            return true
                        }
                        return false
                    })
                }

                if(this.deadlineFilter.to) {
                    filtered = filtered.filter(item => {
                        if (item.deadline.millisGMT <= this.deadlineFilter.to) {
                            return true
                        }
                        return false
                    })
                }

                if (this.projectNameFilter.length) {
                    filtered = filtered.filter(item => {
                        if (item.name.toLowerCase().indexOf(this.projectNameFilter.toLowerCase()) != -1) {
                            return true
                        }
                        return false
                    })
                }

                if (this.projectIdFilter.length) {
                    filtered = filtered.filter(item => {
                        if (item.idNumber.indexOf(this.projectIdFilter) != -1) {
                            return true
                        }
                        return false
                    })
                }

                if (this.sourceLangsFilter.length) {
                    filtered = filtered.filter(item => {
                        if (item.languageCombinations.length) {
                            for (let i = 0; i < item.languageCombinations.length; i++) {
                                if (item.languageCombinations[i].sourceLanguage.name.indexOf(this.sourceLangsFilter) != -1) {
                                    return true
                                }
                            }
                        }
                        return false
                    })
                }

                if (this.targetLangsFilter.length) {
                    filtered = filtered.filter(item => {
                        if (item.languageCombinations.length) {
                            for (let i = 0; i < item.languageCombinations.length; i++) {
                                if (item.languageCombinations[i].targetLanguage.name.indexOf(this.targetLangsFilter) != -1) {
                                    return true
                                }
                            }
                        }
                        return false
                    })
                }

                if (this.statusFilter.length) {
                    filtered = filtered.filter(item => {
                        if (item.status.toLowerCase().indexOf(this.statusFilter.toLowerCase()) != -1) {
                            return true
                        }
                        return false
                    })
                }

                if (this.requestSort) {
                    filtered.sort( (a, b) => { return a.startDate.millisGMT - b.startDate.millisGMT })
                } else { filtered.sort( (a, b) => { return b.startDate.millisGMT - a.startDate.millisGMT }) }

                if (this.deadlineSort) {
                    filtered.sort( (a, b) => { return a.deadline.millisGMT - b.deadline.millisGMT })
                } else { filtered.sort( (a, b) => { return b.deadline.millisGMT - a.deadline.millisGMT }) }

                if (this.projectIdSort) {
                    filtered.sort( (a, b) => {return  (a.idNumber > b.idNumber) ? 1 : ((b.idNumber > a.idNumber) ? -1 : 0) })
                } else { filtered.sort( (a, b) => {return b.idNumber - a.idNumber }) }

                if (this.projectNameSort) {
                    filtered.sort( (a, b) => { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0) })
                } else { filtered.sort( (a, b) => { return b.name - a.name }) }

            }
            return filtered;
        },
    },
    mounted() {
        this.getCookie(),
        this.clientInfo()
    }
}
</script>


<style lang="scss" src="../../assets/styles/projects/projectstable.scss" scoped>
// @import "../../assets/styles/projects/projectstable.scss";

</style>
