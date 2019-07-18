<template lang="pug">
.services-wrapper
    .tabs
        Tabs(:tabs="tabs" @setTab="setTab" :selectedTab="selectedTab")
    .table(v-if="isServices")
        ServicesTable(
            :allSteps="steps"
            :firstStageSteps="firstStageSteps"
            :secondStageSteps="secondStageSteps"
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
            steps: []
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
        }
    },
    computed: {
        firstStageSteps() {
            let result = [];
            if(this.steps.length) {
                result = this.steps.filter(item => item.isStage1).map(item => item.title);
            }
            return result;
        },
        secondStageSteps() {
            let result = [];
            if(this.steps.length) {
                result = this.steps.filter(item => item.isStage2).map(item => item.title);
            }
            return result;
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

.services-wrapper {
    min-width: 50%;
    width: fit-content;
    background-color: $white;
    box-sizing: border-box;
    padding: 20px;
    box-shadow: 0 0 10px $main-color;
    position: relative;
}

</style>
