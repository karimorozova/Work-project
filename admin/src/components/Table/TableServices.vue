<template lang="pug">
.services-wrapper
    .tabs
        Tabs(:tabs="tabs" @setTab="setTab" :selectedTab="selectedTab")
    .table(v-if="isServices")
        ServicesTable(
            :allSteps="steps"
            :firstStageSteps="firstStageSteps"
            :secondStageSteps="secondStageSteps"
            @setUnitFilter="setUnitFilter"
        )
    .table(v-if="isSteps")
        StepsTable(
            :steps="steps"
            @setStepsWithId="setStepsWithId"
            @updateSteps="updateSteps")
</template>

<script>
import ServicesTable from "./services/ServicesTable";
import StepsTable from "./services/StepsTable";
import Tabs from "@/components/Tabs";
import  { mapActions } from "vuex";

export default {
    data() {
        return {
            isServices: true,
            isSteps: false,
            tabs: ["Services", "Steps"],
            selectedTab: "Services",
            steps: [],
            unitFilter: ""
        }
    },
    methods: {
        ...mapActions({
            setSteps: "setStepsFromDataBase",
            alertToggle: "alertToggle"
        }),
        setTab({index}) {
            this.isServices = index === 0;
            this.isSteps = !this.isServices;
            this.selectedTab = this.tabs[index];
        },
        setUnitFilter({unit}) {
            this.unitFilter = unit;
        },
        setStepsWithId() {
            this.steps = this.steps.filter(item => item._id);
        },
        async updateSteps() {
            await this.getSteps();
        },
        async getSteps() {
            try {
                const result = await this.$http.get("/api/steps");
                this.steps = result.body;
            } catch(err) {
                this.alertToggle({message: "Error on getting Steps from DB", isShow: true, type: "error"})
            }
        },
        getFilteredStageSteps(stageProp) {
            if(this.steps.length) {
                return this.steps.filter(item => {
                    return this.unitFilter ? item[stageProp] && item.calculationUnit === this.unitFilter : item[stageProp];
                })
            }
            return [];
        }
    },
    computed: {
        firstStageSteps() {
            const result = this.getFilteredStageSteps('isStage1');
            return result.length ? result.map(item => item.title) : [];
        },
        secondStageSteps() {
            const result = this.getFilteredStageSteps('isStage2');
            return result.length ? result.map(item => item.title) : [];
        }
    },
    components: {
        ServicesTable,
        StepsTable,
        Tabs
    },
    created() {
        this.getSteps();   
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.services-wrapper {
    @extend %setting-table;
    width: fit-content;
    box-sizing: border-box;
}

</style>
