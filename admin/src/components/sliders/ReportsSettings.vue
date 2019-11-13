<template lang="pug">
.reports
    .reports__sidebar
        Sidebar(
            title="REPORTS" 
            :links="sidebarLinks"
            :activeIndex="sidebarIndex"
            @onLinkClick="toggleLink"
        )

    .reports__table
        router-view
</template>

<script>
import Sidebar from '../Sidebar';

export default {
    data() {
        return {
            sidebarLinks: [
                {title: "Lang-pair TPI", routeName: "lang-pair-tier"}, 
                {title: "LQA", routeName: "lqa"}, 
                {title: "Benchmark", routeName: "benchmark"}, 
            ],
            currentIndex: -1
        }
    },
    methods: {
        toggleLink({index}) {
            this.currentIndex = index;
            const { routeName } = this.sidebarLinks[index];
            this.$router.push({name: routeName});
        }
    },
    computed: {
        sidebarIndex() {
            if(this.$route.name === 'reports') return -1;
            return this.sidebarLinks.findIndex(item => item.routeName === this.$route.name);        
        }  
    },
    components: {
        Sidebar
    }
};
</script>

<style lang="scss" scoped>

.reports {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    min-height: 94vh;
    &__table {
        width: 100%;
    }
}

</style>
