<template lang="pug">
    .root
        .row
            .shortInfo
                .row__columns
                    .col
                        .col__title 
                            span Request On
                            img.req_img(src="../../assets/images/white-arrow.png")
                    .col
                        .col__title
                            span Project ID
                            img(src="../../assets/images/white-arrow.png")                        
                    .col.col-5
                        .col__title 
                            span Project Name
                            .double_arrow
                              .up
                                img.arrow_up(src="../../assets/images/white-arrow.png")
                              .down
                                img.arrow_down(src="../../assets/images/white-arrow.png")                       
                    .col.col-4
                        .col__title 
                            span Status
                            .double_arrow
                              .up
                                img.arrow_up(src="../../assets/images/white-arrow.png")
                              .down
                                img.arrow_down(src="../../assets/images/white-arrow.png")                
                    .col
                        .col__title 
                            span Deadline
                            .double_arrow
                              .up
                                img.arrow_up(src="../../assets/images/white-arrow.png")
                              .down
                                img.arrow_down(src="../../assets/images/white-arrow.png")                  
                    .col.col-5.colSplit
                        .col__title 
                            span Total Cost
                        .col
                        .col
        .scrollArea
            .row(v-for="(project, index) in clientProjects")
                .shortInfo
                    .row__columns_info
                        .col(@click="projectDetails(index)") {{ project.requestOn }}
                        .col.proj(@click="projectDetails(index)") {{ project.projectId }}
                        .col.col-5 {{ project.projectName }}
                        .col.col-4 {{ project.status }}
                        .col {{ project.deadline }}
                        .col.col-5.colSplit
                            .col
                                span {{ project.totalCost }}
                            .col                        
                            .col                                
                //- .fullInfo(v-if="project.fullInfoAppear")
                //-     .languagePair
                //-         .languagePair__title {{ languagePair }}
                //-             img.languagePair__image(src="../../assets/images/open-close-arrow-brown.png")
                //-         ul.languagePair__ul
                //-             li.languagePair__li(v-for="language in languagesFromTo") {{ language.description }}
                //-     .cost
                //-         .cost__title {{ cost }}
                //-             img.cost__image(src="../../assets/images/open-close-arrow-brown.png")
                //-         ul.cost__ul
                //-             li.cos
  
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
            type: Date
        },
        projectNameFilter: {
            type: String
        },
        deadlineFilter: {
            type: Date
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
            allProjectsFiltered: []
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
            console.log(result);
            this.companyName = result.data.name;
        }
    },
    computed: {
        clientProjects() {
            let result = [];
            if(this.projects.length) {
                let array = this.projects;
                let finalDeadline = '';
                for(let i = 0; i < array.length; i++) {
                    if(array[i].deadline) {
                     finalDeadline = moment(new Date(array[i].deadline.millisGMT)).format("DD-MM-YYYY");
                    } else {
                        finalDeadline = ''
                }
                if(array[i].status == "CLOSED") {
                        result.push({
                        requestOn: moment(new Date(array[i].startDate.millisGMT)).format("DD-MM-YYYY"),
                        projectId: array[i].idNumber,
                        projectName: array[i].name,
                        status: array[i].status,
                        deadline: finalDeadline, //moment(new Date()).format("DD-MM-YYYY"),
                        totalCost: array[i].totalAgreed.formattedAmount,
                        fullInfoAppear: false
                        })
                    }         
                }
            }
            return result;
        },
        // filteredProjects() {
        //     if (this.projects.length) {
        //         if (this.projectNameFilter.length) {
        //             this.projects.map(item => {
        //                 if (item.name.toLowerCase().indexOf(this.projectNameFilter.toLowerCase()) != -1)
        //                     this.allProjectsFiltered.push(item)
        //             });
        //         }

        //         if (this.projectIdFilter.length) {
        //             this.projects.map(item => {
        //                 if (item.idNumber.indexOf(this.projectIdFilter) != -1)
        //                     this.allProjectsFiltered.push(item)
        //             });
        //         }

        //         if (this.sourceLangsFilter.length) {
        //             this.projects.map(item => {
        //                 if (item.languageCombinations.length) {
        //                     for(let i = 0; i < item.languageCombinations.length; i++) {
        //                         if (item.item.languageCombinations[i].sourceLanguage.name.indexOf(this.sourceLangsFilter) != -1) {
        //                             this.allProjectsFiltered.push(item)        
        //                         }
        //                     }
        //                 }
        //             });
        //         }

        //         if (this.targetLangsFilter.length) {
        //             this.projects.map(item => {
        //                 if (item.languageCombinations.length) {
        //                     for(let i = 0; i < item.languageCombinations.length; i++) {
        //                         if (item.item.languageCombinations[i].targetLanguage.name.indexOf(this.tergetLangsFilter) != -1) {
        //                             this.allProjectsFiltered.push(item)        
        //                         }
        //                     }
        //                 }
        //             });
        //         }

        //         if (this.statusFilter.length) {
        //             this.projects.map(item => {
        //                 if (item.status.indexOf(this.statusFilter) != -1)
        //                     this.allProjectsFiltered.push(item)
        //             });
        //         }

        //         return this.allProjectsFiltered;
        //     }
        // }
    },
    mounted() {
        this.getCookie(),
        this.clientInfo()
    }
}
</script>


<style lang="scss">
@import "../../assets/styles/projects/projectstable.scss";

</style>
