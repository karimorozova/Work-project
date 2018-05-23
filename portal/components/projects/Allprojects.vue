<template lang="pug">
    .allProjects
        .allProjects__dropMenu(:class="{opened: openAll}")
            .dropSelect(@click="showAllProjects") All Projects
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openAll}")
            .dropItem(v-if="openAll")
                .dropItem__filters
                    .filterBlock
                        .filterBlock__item.projectId
                            label Project ID
                            input(type="text" v-model="projectIdFilter")
                        .filterBlock__item.sourceLangs    
                            label Source Langs
                            .sourceLangs__select.selector
                                span(v-model="sourceLangsFilter" @click="sourceLangOpen") {{ sourceLangsFilter }}
                                    img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openSourceLangs}")
                                .selector__drop(v-if="openSourceLangs")
                                    select-lang(@chooseLang="chooseSourceLang")
                    .filterBlock
                        .filterBlock__item.projectName
                            label Project Name
                            input(type="text" v-model="projectNameFilter")
                        .filterBlock__item.targetLangs
                            label Target Langs                            
                            .targetLangs__select.selector
                                span(v-model="targetLangsFilter" @click="targetLangOpen") {{ targetLangsFilter }}
                                    img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openTargetLangs}")
                                .selector__drop(v-if="openTargetLangs")
                                    select-lang(@chooseLang="chooseTargetLang")
                    .filterBlock
                        .filterBlock__item.request
                            label Request On
                            input(type="text" :value="requestFilter")
                            img(src="../../assets/images/calendar.png" @click="showDetailedCalendar")
                        quotesCalendarDetailed(v-if="currentFormVisible" @dateFilter='requestOnFilter')
                        .filterBlock__item.deadline
                            label Deadline
                            input(type="text" :value="deadFilter")
                            img(src="../../assets/images/calendar.png" @click="showDetailedCalendarOther")
                        quotesCalendarDetailed(v-if="currentFormVisibleOther" @dateFilter='dealineFiltered' :class="{switcher: currentFormVisibleOther}")   
                .dropItem__table
                    Projectstable(
                        @projectDetails="projectDetails"
                        :projects="projects"
                        :requestDateFilter="requestDateFilter"
                        :projectNameFilter="projectNameFilter"
                        :projectIdFilter="projectIdFilter"
                        :deadlineFilter="deadlineFilter"
                        :sourceLangsFilter="sourceLangsFilter"
                        :targetLangsFilter="targetLangsFilter"
                        :statusFilter="statusFilter"
                    )
        //- button(@click="getRepos") Click
</template>

<script>
import moment from 'moment';
import Projectstable from "./Projectstable";
import QuotesCalendarDetailed from "../../components/quotes/QuotesCalendarDetailed";
import LanguagesSelect from "../../components/LanguagesSelect";

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
        }
    },
    data() {
        return {
            requestDateFilter: {from: "", to: ""},
            projectNameFilter: '',
            deadlineFilter: {from: "", to: ""},
            projectIdFilter: '',
            sourceLangsFilter: '',
            targetLangsFilter: '',
            statusFilter: '',
            openAll: false,
            openSourceLangs: false,
            openTargetLangs: false,
            openStatus: false,
            currentFormVisible: false,
            currentFormVisibleOther: false,  
        }
    },
    methods: {
        showAllProjects() {
            this.openAll = !this.openAll
        },
        sourceLangOpen() {
        this.openSourceLangs = !this.openSourceLangs;
        },
        targetLangOpen() {
        this.openTargetLangs = !this.openTargetLangs;
        },
        statusOpen() {
        this.openStatus = !this.openStatus;
        },
        showDetailedCalendar() {
        this.currentFormVisible = !this.currentFormVisible;
        },
        showDetailedCalendarOther() {
        this.currentFormVisibleOther = !this.currentFormVisibleOther;
        },
        async projectDetails(data) {
            this.$axios.get(`portal/job?projectId=${data.id}`)
            .then(res => this.$emit('projectDetails', {project: data, jobs: res.data.jobById}))
            .catch(err => {console.log(err)})
        },
        chooseSourceLang(data) {
            this.sourceLangsFilter = data;
            this.openSourceLangs = false;
        },
        chooseTargetLang(data) {
            this.targetLangsFilter = data;
            this.openTargetLangs = false;
        },
        requestOnFilter(data) {
            this.requestDateFilter = {from: data.from, to: data.to};
            console.log(this.requestDateFilter);
            this.currentFormVisible = false;
        },
        dealineFiltered(data) {
            this.deadlineFilter = {from: data.from, to: data.to};
            console.log(this.deadlineFilter);
            this.currentFormVisibleOther = false;
            
        }
    },
    computed: {
        requestFilter() {
            let result = "";
            if(this.requestDateFilter.from) {
                result = moment(this.requestDateFilter.from).format('DD-MM-YYYY') + ' / ' + moment(this.requestDateFilter.to).format('DD-MM-YYYY')
            }
            return result
        },
        deadFilter() {
            let result = "";
            if(this.deadlineFilter.from) {
                result = moment(this.deadlineFilter.from).format('DD-MM-YYYY') + ' / ' + moment(this.deadlineFilter.to).format('DD-MM-YYYY')
            }
            return result
        }
    },
    components: {
        Projectstable,
        quotesCalendarDetailed: QuotesCalendarDetailed,
        "select-lang": LanguagesSelect
    }
};
</script>

<style lang="scss" src="../../assets/styles/projects/allprojects.scss" scoped>
// @import "../../assets/styles/projects/allprojects.scss";
</style>
