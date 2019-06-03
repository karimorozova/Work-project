<template lang="pug">
.pm-area
    Sidebar( 
        title="PM-AREA" 
        :links="links"
        :activeIndex="currentIndex"
        @onLinkClick="toggleLink"
    )
    router-view
</template>

<script>
import Sidebar from '../Sidebar';

export default {
    data() {
        return {
            sidebarLinks: [
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
        links() {
            return this.sidebarLinks.map(item => item.title);
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
