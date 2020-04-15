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
import { mapActions } from "vuex";
import defaultSidebarLinks from "@/mixins/defaultSidebarLinks";

export default {
    mixins: [defaultSidebarLinks],
    data() {
        return {
            links: [
                {title: 'Open Projects', routeName: 'open-projects'}, 
                {title: 'Incoming Requests', routeName: 'requests'},
                {title: 'Previous Projects', routeName: 'prev-projects'},
                {title: 'Other Projects', routeName: 'other-projects'}
            ],
            currentIndex: 0,
            defaultRouteName: "projects",
            requestsCounter: ""
        }
    },
    methods: {
        ...mapActions(["alertToggle"]),
        async getRequestsQuantity() {
            try {
                const requests = await this.$http.get('/api/requests-quantity');
                this.requestsCounter = requests.data.quantity;
            } catch(err) {

            }
        }
    },
    computed: {
        sidebarLinks() {
            return this.links.map(item => {
                if(item.routeName === 'requests') {
                    item.counter = this.requestsCounter;
                }
                return item
            });
        }
    },
    components: {
        Sidebar
    },
    created() {
        this.getRequestsQuantity();
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
