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
        .project-action__button
            Button(:value="approveButtonValue" @clicked="makeApprovedAction")
        .project-action__button(v-if="isAlternativeAction")
            Button(:value="alternativeButtonValue" @clicked="makeAlterAction")
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
            approveButtonValue: "Confirm",
            alternativeButtonValue: "Reject",
            isAlternativeAction: false
        }
    },
    methods: {
        setDefaults() {
            this.selectedAction = "";
            this.approveButtonValue = "Confirm";
            this.isAlternativeAction = false;
        },
        setAction({option}) {
            this.selectedAction = option;
            this.isAlternativeAction = false;
            if(this.selectedAction === "Send a Quote" || this.selectedAction === "Send Project Details") {
                this.approveButtonValue = "Edit & Send"
            }
            if(this.selectedAction === "Cancel") {
                this.approveButtonValue = "Confirm"
            }
            if(this.selectedAction === "Accept/Reject Quote") {
                this.approveButtonValue = "Accept";
                this.alternativeButtonValue = "Reject",
                this.isAlternativeAction = true
            }
        },
        async makeApprovedAction() {
            try {
                switch(this.selectedAction) {
                    case "Send a Quote":
                        const message = await this.$http.get(`/pm-manage/quote-message?projectId=${this.project._id}`);
                        this.$emit("editAndSend", { message, subject: "quote" });
                        break;
                    case "Send Project Details":
                        const details = await this.$http.get(`/pm-manage/project-details?projectId=${this.project._id}`);
                        this.$emit("editAndSend", { message: details, subject: "details" });
                        break;
                    case "Accept/Reject Quote":
                        await this.acceptQuote();
                        break;
                    case "Deliver":
                        await this.deliverProject();
                        break;
                    case "Cancel":
                        await this.cancelProject();
                        break;
                }
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot execute chosen action.', isShow: true, type: 'error'})
            } finally {
                this.setDefaults();
            }
        },
        async makeAlterAction() {
            try {
                switch(this.selectedAction) {
                    case "Accept/Reject Quote":
                        await this.rejectQuote();
                        break;
                }
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot execute chosen action.', isShow: true, type: 'error'})
            } finally {
                this.setDefaults();
            }
        },
        async cancelProject() {
            if(this.project.status === "Delivered" || this.project.status === "Closed") return;
            try {
                await this.setStatus('Cancelled');
            } catch(err) { }
        },
        async setStatus(status) {
            try {
                await this.setProjectStatus({status});
                this.alertToggle({message: "Project's status changed", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }
        },
        async acceptQuote() {
            const status = this.project.isStartAccepted ? "Started" : "Approved";
            try {
                await this.setStatus(status);
            } catch(err) { }
        },
        async rejectQuote() {
            try {
                await this.setStatus("Rejected");
            } catch(err) { }
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
        async deliverProject() {
            try {
                await this.deliverProjectToClient(this.project._id);
            } catch(err) {              
            }
        },
        ...mapActions({
            alertToggle: "alertToggle",
            storeProject: "setCurrentProject",
            setProjectStatus: "setProjectStatus",
            deliverProjectToClient: "deliverProjectToClient"
        }),
    },
    computed: {
        filteredActions() {
            let result = this.actions;
            const nonStartedStatuses = ["Draft", "Quote sent", "Requested", "Cancelled"]
            if(this.project.status === "Approved") {
                result = ["Send a Quote", "Cancel"];
            }
            if(this.project.finance.Price.receivables && nonStartedStatuses.indexOf(this.project.status) !== -1) {
                result = ["Send a Quote", "Accept/Reject Quote", "Cancel"];
            }
            if(this.project.status === "Started" || this.project.status === "In progress") {
                result = ["Send Project Details", "Cancel"];
            }
            if(this.project.status === "Ready for Delivery") {
                result = ["Deliver", "Cancel"];
            }
            if(this.project.status === "Closed") {
                result = ["Deliver"];
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
    &__confirm {
        display: flex;
    }
    &__button {
        :first-child {
            margin-right: 10px;
        }
    }
}
</style>
