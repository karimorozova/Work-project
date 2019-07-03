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
import { mapGetters } from "vuex";
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
        
    },
    computed: {
        ...mapGetters({
            requests: "getAllRequests",
            projects: "getAllProjects"
        }),
        sidebarLinks() {
            const requestsCounter = this.requests.length;
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
