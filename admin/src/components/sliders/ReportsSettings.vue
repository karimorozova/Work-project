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
        router-view(:allXtrfLangs="allXtrfLangs")
</template>

<script>
import Sidebar from '../Sidebar';

export default {
    data() {
        return {
            sidebarLinks: [
                {title: "Language Tier", routeName: "lang-pair-tier"}, 
                {title: "LQA Status", routeName: "lqa"}, 
                {title: "Upcoming LQAs", routeName: "upcoming-lqa"}, 
                {title: "Vendor Cost Benchmark", routeName: "benchmark"},
	              {title: "Competencies Queue", routeName: "pending-competencies"},
            ],
            currentIndex: -1,
            allXtrfLangs: []
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
                 const result = await this.$http.get('/api/languages');
                this.allXtrfLangs = result.body.map(item => item.lang).filter(item => item !== 'English [grouped]');
                this.allXtrfLangs.unshift("All");
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
@import "../../assets/scss/colors.scss";

.reports {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    min-height: 94vh;
    &__sidebar {
        box-shadow: -10px 0 10px 10px $brown-shadow;
    }
    &__table {
        width: 100%;
    }
}

</style>
