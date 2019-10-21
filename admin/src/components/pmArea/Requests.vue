<template lang="pug">
    .requests
        .requests__table
            Allprojects(
                projectsType="requests"
                @filterProjects="getRequests"
                @bottomScrolled="bottomScrolled"
            )
</template>

<script>
import Allprojects from './Allprojects';
import { mapActions, mapGetters } from 'vuex';
import projectsAndRequsets from '@/mixins/projectsAndRequests';

export default {
    mixins: [projectsAndRequsets],
    data() {
        return {
            isDataRemain: true,
            lastDate: new Date(),
            endpoint: 'all-requests',
            prop: 'requests'
        }
    },
    methods: {
        ...mapActions(["setRequests", "alertToggle"]),
        async getRequests(filters) {
            await this.getData(filters);
        }
    },
    computed: {
        ...mapGetters({
            requests: "getAllRequests"
        })
    },
    components: {
        Allprojects
    },
    created() {
        this.getRequests();
    }
};

</script>

<style lang="scss" scoped>

.requests {
    width: calc(100% - 150px);
}

</style>
