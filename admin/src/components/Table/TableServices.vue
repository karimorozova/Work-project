<template lang="pug">
.services-wrapper
    ServicesTable(
        :firstStageSteps="firstStageSteps"
        :secondStageSteps="secondStageSteps"
    )
</template>

<script>
import ServicesTable from "./services/ServicesTable";
import  { mapActions, mapGetters } from "vuex";

export default {
    data() {
        return {
            
        }
    },
    methods: {
        ...mapActions({
            setSteps: "setStepsFromDataBase",
            alertToggle: "alertToggle"
        }),
        async getSteps() {
            try {
                const result = await this.$http.get("/api/steps");
                this.setSteps(result.body);
            } catch(err) {
                this.alertToggle({message: "Error on getting Steps from DB", isShow: true, type: "error"})
            }
        }
    },
    computed: {
        ...mapGetters({
            vuexSteps: "getVuexSteps"
        }),
        firstStageSteps() {
            let result = [];
            if(this.vuexSteps.length) {
                result = this.vuexSteps.filter(item => item.isStage1).map(item => item.title);
            }
            return result;
        },
        secondStageSteps() {
            let result = [];
            if(this.vuexSteps.length) {
                result = this.vuexSteps.filter(item => item.isStage2).map(item => item.title);
            }
            return result;
        }
    },
    components: {
        ServicesTable,
    },
    created() {
        this.getSteps();   
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.services-wrapper {
    width: fit-content;
    background-color: $white;
    box-sizing: border-box;
    padding: 20px;
    box-shadow: 0 0 10px $main-color;
    position: relative;
}

</style>
