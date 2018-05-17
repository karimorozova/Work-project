<template lang="pug">
    .allProjects
        quotesCalendarDetailed(v-if="currentFormVisible")
        quotesCalendarDetailed(v-if="currentFormVisibleOther" :class="{switcher: currentFormVisibleOther}")
        .allProjects__dropMenu(:class="{opened: openAll}")
            .dropSelect(@click="showAllProjects") All Projects
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openAll}")
            .dropItem(v-if="openAll")
                .dropItem__filters
                    .filterBlock
                        .filterBlock__item.request
                            label Request On
                            input(type="text" v-model="requestDateFilter")
                            img(src="../../assets/images/calendar.png" @click="showDetailedCalendar")
                        .filterBlock__item.projectName
                            label Project Name
                            input(type="text" v-model="projectNameFilter")
                        .filterBlock__item.sourceLangs
                            label Source Langs
                            span(v-model="sourceLangsFilter" @click="sourceLangOpen")
                                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openSourceLangs}")
                    .filterBlock
                        .filterBlock__item.deadline
                            label Deadline
                            input(type="text" v-model="deadlineFilter")
                            img(src="../../assets/images/calendar.png" @click="showDetailedCalendarOther")                            
                        .filterBlock__item.projectId
                            label Project ID
                            input(type="text" v-model="pojectIdFilter")
                        .filterBlock__item.sourceLangs
                            label Target Langs
                            span(v-model="tergetLangsFilter" @click="targetLangOpen")
                                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openTargetLangs}")                                
                    .filterBlock
                        .filterBlock__item.status
                            label Status
                            span(v-model="statusFilter" @click="statusOpen")
                                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openStatus}")                                
                .dropItem__table
                    Projectstable(:projects="projects")

</template>

<script>
import Projectstable from "./Projectstable";
import QuotesCalendarDetailed from "../../components/quotes/QuotesCalendarDetailed";

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
            requestDateFilter: '',
            projectNameFilter: '',
            deadlineFilter: '',
            pojectIdFilter: '',
            sourceLangsFilter: '',
            tergetLangsFilter: '',
            statusFilter: '',
            openAll: false,
            openSourceLangs: false,
            openTargetLangs: false,
            openStatus: false,
            currentFormVisible: false,
            currentFormVisibleOther: false        
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
    }
  },
  components: {
    Projectstable,
    quotesCalendarDetailed: QuotesCalendarDetailed
  }
};
</script>

<style lang="scss">
@import "../../assets/styles/projects/allprojects.scss";
</style>
