<template lang="pug">
.project-action
    .project-action__title Project Action: 
    .project-action__drop-menu
        SelectSingle(
            :selectedOption="selectedAction"
            :options="filteredActions"
            placeholder="Select Action"
            @chooseOption="setAction"
        )
    .project-action__confirm(v-if="selectedAction")
        Button(:value="buttonValue" @clicked="makeAction")
</template>

<script>
import SelectSingle from "../SelectSingle";
import Button from "../Button";
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        project: {
            type: Object
        }
    },
    data() {
        return {
            selectedAction: "",
            actions: ["Cancel"],
            buttonValue: "Confirm"
        }
    },
    methods: {
        setAction({option}) {
            this.selectedAction = option;
            if(this.selectedAction === "Send a Quote") {
                this.buttonValue = "Edit & Send"
            }
        },
        async makeAction() {
            try {
                switch(this.selectedAction) {
                    case "Send a Quote":
                        const message = await this.$http.get(`/pm-manage/quote-message?projectId=${this.project._id}`);
                        this.$emit("editAndSend", { message });
                        break;
                    case "Cancel":
                        this.$emit('setStatus', { option: 'Cancelled'});
                        break;
                }
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot execute chosen action.', isShow: true, type: 'error'})
            }
        },
        async sendQuote() {
            try {
                const result = await this.$http.post('/pm-manage/send-quote', {id: this.project._id});
                await this.storeProject(result.body);
                this.alertToggle({message: 'The Quote has been sent', isShow: true, type: 'success'})
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot send the Quote.', isShow: true, type: 'error'})
            }
        },
        isAnyTaskReady() {
            return this.project.tasks.find(item => item.status === "Ready for Delivery");
        },
        ...mapActions({
            alertToggle: "alertToggle",
            storeProject: "setCurrentProject"
        }),
    },
    computed: {
        filteredActions() {
            let result = this.actions;
            if(this.project.finance.Price.receivables) {
                result = ["Send a Quote", "Cancel"];
            }
            if(this.project.status === "Started") {
                result = ["Send Project Details", "Cancel"];
            }
            if(this.isAnyTaskReady()) {
                result = ["Deliver", "Cancel"];
            }
            return result;
        }
    },
    components: {
        SelectSingle,
        Button
    }
}
</script>

<style lang="scss" scoped>
@import '../../assets/scss/colors.scss';

.project-action {
    padding: 10px 20px;
    box-shadow: 0 3px 20px $brown-shadow;
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    &__title {
        padding-bottom: 5px;
        font-size: 20px;
        border-bottom: 1px solid $brown-border;
        margin-bottom: 30px;
    }
    &__drop-menu {
        width: 191px;
        height: 28px;
        position: relative;
        margin-bottom: 20px;
    }
}
</style>
