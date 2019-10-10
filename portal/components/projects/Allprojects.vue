<template lang="pug">
    .all-projects
        .all-projects__drop-menu(:class="{'all-projects_cornered': isOpened}")
            .all-projects__drop-select(@click="toggleProjects") All Projects
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{'all-projects_rotate-180': isOpened}")
            .all-projects__item(v-if="isOpened")
                .all-projects__filters
                    Filters(
                        :sourceFilter="sourceFilter"
                        :targetFilter="targetFilter"
                        :requestFilter="requestFilter"
                        :deadlineFilter="deadlineFilter"
                        @setFilter="setFilter"
                        @setLangFilter="setFilter"
                        @setDateFilter="setDateFilter"
                        @setFromAnyFilter="setFromAnyFilter"
                        @setToAnyFilter="setToAnyFilter"
                    )
                .all-projects__table
                    Projectstable(
                        :projects="filteredProjects"
                    )
</template>

<script>
import moment from 'moment';
import Filters from "./Filters";
import Projectstable from "./Projectstable";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            requestFilter: {
                from: new Date(new Date().getFullYear(), 0, 1), 
                to: new Date()
            },
            projectNameFilter: '',
            deadlineFilter: {
                from: new Date(new Date().getFullYear(), 0, 1), 
                to: new Date(new Date().getFullYear(), new Date().getMonth() + 4, 1)
            },
            projectIdFilter: '',
            sourceFilter: '',
            targetFilter: '',
            statusFilter: '',
            isOpened: true
        }
    },
    methods: {
        setFilter({filter, value}) {
            this[filter] = value;
        },
        setDateFilter({filter, prop, date}) {
            this[filter][prop] = date;
        },
        setFromAnyFilter({filter, from}) {
            this[filter].from = from;
        },
        setToAnyFilter({filter, to}) {
            this[filter].to = to;
        },
        toggleProjects() {
            this.isOpened = !this.isOpened
        },
        isSourceExist(tasks) {
            return tasks.find(item => item.sourceLanguage === this.sourceFilter);
        },
        isTargetExist(tasks) {
            return tasks.find(item => item.targetLanguage === this.targetFilter);
        }
    },
    computed: {
        ...mapGetters({
            allProjects: "getAllProjects"
        }),
        filteredProjects() {
            let statuses = ['Quote sent', 'Requested'];
            let result = this.allProjects.filter(item => {
                return moment(item.startDate) >= this.requestFilter.from && moment(item.startDate) <= this.requestFilter.to
                    && moment(item.deadline) >= this.deadlineFilter.from && moment(item.deadline) <= this.deadlineFilter.to
                    && statuses.indexOf(item.status) === -1
            });
            if(this.projectIdFilter) {
                result = result.filter(item => item.projectId.indexOf(this.projectIdFilter) !== -1);
            }
            if(this.projectNameFilter) {
                result = result.filter(item => item.projectName.toLowerCase().indexOf(this.projectNameFilter) !== -1);
            }
            if(this.sourceFilter) {
                result = result.filter(item => this.isSourceExist(item.tasks));
            }
            if(this.targetFilter) {
                result = result.filter(item => this.isTargetExist(item.tasks));
            }
            return result;
        }
    },
    components: {
        Filters,
        Projectstable
    }
};
</script>

<style lang="scss" scoped>

.all-projects {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 80px;
    margin: 0 auto;
    &__drop-menu {
        width: 970px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        border-radius: 18px;
        box-shadow: 0 3px 13px rgba(103, 87, 62, 0.5);
        margin-bottom: 10px;
        padding: 0 14px;
        color: #67573e;
        transition: all 0.2s;
        @media (max-width: 1550px) {
            margin-left: 58px;
        }       
    }
    &__drop-select {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 18px;
        padding: 14px;
        cursor: pointer;
    }
    &__item {
        width: 100%;
    }
    &_rotate-180 {
        transform: rotate(180deg);
    }
    &_cornered {
        border-radius: 0;
        border: none;
        margin-bottom: 0;
        @media (max-width: 1550px) {
            margin-left: 58px;
        }
    }
}

</style>
