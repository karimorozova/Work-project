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
        router-view(:languages="languages")
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
            currentIndex: -1,
            languages: []
        }
    },
    methods: {
        toggleLink({index}) {
            this.currentIndex = index;
            const { routeName } = this.sidebarLinks[index];
            this.$router.push({name: routeName});
        },
        async getXtrfLangs() {
            try {
                const result = await this.$http.get('/reportsapi/languages');
                this.languages = result.body.map(item => item.lang).filter(item => item !== 'English [grouped]');
                this.languages.unshift("All");
            } catch(err) {
                this.alertToggle({message: "Error on getting XTRF languages", isShow: true, type: "error"});
            }
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
    },
    created() {
        this.getXtrfLangs();
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
