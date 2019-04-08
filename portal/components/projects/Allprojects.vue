<template lang="pug">
    .allProjects
        .allProjects__dropMenu(:class="{opened: openAll}")
            .drop-select(@click="showAllProjects") All Projects
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openAll}")
            .dropItem(v-if="openAll")
                .dropItem__filters
                    Filters(
                        :sourceFilter="sourceFilter"
                        :targetFilter="targetFilter"
                        @setLangFilter="setLangFilter"
                        )
                .dropItem__table
                    Projectstable(
                        @projectDetails="projectDetails"
                        :projects="projects"
                        :requestDateFilter="requestDateFilter"
                        :projectNameFilter="projectNameFilter"
                        :projectIdFilter="projectIdFilter"
                        :deadlineFilter="deadlineFilter"
                        :sourceFilter="sourceFilter"
                        :targetFilter="targetFilter"
                        :statusFilter="statusFilter"
                    )
</template>

<script>
import moment from 'moment';
import Filters from "./Filters";
import Projectstable from "./Projectstable";
import QuotesCalendarDetailed from "../../components/quotes/QuotesCalendarDetailed";
import ClientLangSource from "../../components/ClientLangSource";
import ClientLangTarget from "../../components/ClientLangTarget";

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
            sourceFilter: '',
            targetFilter: '',
            statusFilter: '',
            openAll: true,
            openSourceLangs: false,
            openTargetLangs: false,
            openStatus: false,
            currentFormVisible: false,
            currentFormVisibleOther: false,  
        }
    },
    methods: {
        setLangFilter({filter, value}) {
            console.log(filter, value);
            this[filter] = value;
        },
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
            if(this.currentFormVisible) {
                this.currentFormVisibleOther = false;
            }
        },
        showDetailedCalendarOther() {
        this.currentFormVisibleOther = !this.currentFormVisibleOther;
            if(this.currentFormVisibleOther) {
                this.currentFormVisible = false;
            }
        },
        async projectDetails(data) {
            this.$axios.get(`portal/job?projectId=${data.id}`)
            .then(res => this.$emit('projectDetails', {project: data, jobs: res.data.jobById}))
            .catch(err => {console.log(err)})
        },
        chooseSourceLang(data) {
            this.sourceFilter = data;
            this.openSourceLangs = false;
        },
        chooseTargetLang(data) {
            this.targetFilter = data;
            this.openTargetLangs = false;
        },
        requestOnFilter(data) {
            this.requestDateFilter = {from: data.from, to: data.to};
            this.currentFormVisible = false;
        },
        dealineFiltered(data) {
            this.deadlineFilter = {from: data.from, to: data.to};
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
        Filters,
        Projectstable,
        quotesCalendarDetailed: QuotesCalendarDetailed,
        "source-select": ClientLangSource,
        "target-select": ClientLangTarget
    }
};
</script>

<style lang="scss" src="../../assets/styles/projects/allprojects.scss" scoped>
</style>
