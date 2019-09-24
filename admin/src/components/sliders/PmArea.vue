<template lang="pug">
.projects-area
    Sidebar( 
        title="PROJECTS" 
        :links="sidebarLinks"
        :activeIndex="currentIndex"
        @onLinkClick="toggleLink"
    )
    router-view
</template>

<script>
import Sidebar from '../Sidebar';
import { mapGetters, mapActions } from "vuex";
import defaultSidebarLinks from "@/mixins/defaultSidebarLinks";

export default {
    mixins: [defaultSidebarLinks],
    data() {
        return {
            links: [
                {title: 'Open Projects', routeName: 'open-projects'}, 
                {title: 'Incoming Requests', routeName: 'requests'},
                {title: 'Previous Projects', routeName: 'prev-projects'}
            ],
            currentIndex: 0,
            defaultRouteName: "projects"
        }
    },
    methods: {
        ...mapActions({
            setStoreProjects: "setAllProjects",
            setRequests: "setRequests"
        }),
        async getProjects() {
            try {
                const projects = await this.$http.get('/api/allprojects?status=Others');
                await this.setStoreProjects([...projects.body]);
            } catch(err) {

            }
        },
        async getRequests() {
            try {
                const requests = await this.$http.get('/api/all-requests');
                await this.setRequests([...requests.body]);
            } catch(err) {

            }
        },
    },
    computed: {
        ...mapGetters({
            requests: "getAllRequests",
        }),
        sidebarLinks() {
            const requestsCounter = this.requests.filter(item => item.status !== 'Cancelled').length;
            return this.links.map(item => {
                if(item.routeName === 'requests') {
                    item.counter = requestsCounter;
                }
                return item
            });
        }
    },
    components: {
        Sidebar
    },
    created() {
        this.getProjects();
        this.getRequests();
    }
}
</script>

<style lang="scss" scoped>

.projects-area {
    min-height: 94vh;
    display: flex;
    width: 100%;
}

</style>
