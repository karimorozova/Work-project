<template lang="pug">
.pm-area
    Sidebar( 
        title="PM-AREA" 
        :links="sidebarLinks"
        :activeIndex="currentIndex"
        @onLinkClick="toggleLink"
    )
    router-view
</template>

<script>
import Sidebar from '../Sidebar';
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            links: [
                {title: 'Open Projects', routeName: 'open-projects'}, 
                {title: 'Incoming Requests', routeName: 'requests'}
            ],
            currentIndex: 0
        }
    },
    methods: {
        toggleLink({index}) {
            this.currentIndex = index;
            const { routeName } = this.sidebarLinks[index];
            this.$router.push({name: routeName});
        },
        setDefaultActiveLink() {
            const { name } = this.$route;
            if(name === 'pm-area') {
                return this.currentIndex = 0;
            }
            this.currentIndex = this.sidebarLinks.findIndex(item => item.routeName === name);
        }
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
    mounted() {
        this.setDefaultActiveLink();
        this.$router.push({name: this.sidebarLinks[this.currentIndex].routeName});
    },
    updated() {
        this.setDefaultActiveLink();
    },
    components: {
        Sidebar
    }
}
</script>

<style lang="scss" scoped>

.pm-area {
    min-height: 94vh;
    display: flex;
    width: 100%;
}

</style>
