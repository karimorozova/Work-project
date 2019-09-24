<template lang="pug">
    .main-info
        .main-info__project-data
            .data-block
                .data-block__item
                    LabelValue(title="Project Name" :isColon="isColon" :value="project.projectName")  
                .data-block__item(v-if="project.status === 'Requested'")
                    LabelValue(title="Request ID" :isColon="isColon" :value="project.requestId")
                .data-block__item(v-else)
                    LabelValue(title="Project ID" :isColon="isColon" :value="project.projectId")  
            .data-block
                .data-block__item
                    LabelValue(title="Status" :isColon="isColon" :value="project.status")  
                .data-block__item
                    LabelValue(v-if="project.finance" title="Total Cost" :isColon="isColon" :value="receivables")
                        span.main-info__currency(v-if="project.finance.Price.receivables && project.status !== 'Requested'") &euro;
            .data-block(v-if="!isQuote")
                Progress(:percent="getTotalProgress()")
        .main-info__tasks(v-if="isQuote")
            QuoteTasks
        .main-info__tasks(v-else)
            ProjectTasks
        .main-info__buttons(v-if="project.status === 'Quote sent'")
            .main-info__button
                Button(value="Approve Quote" buttonClass="tasks-approve" @makeAction="updateQuote('approve')")
            .main-info__button
                Button(value="Reject Quote" @makeAction="updateQuote('reject')")
        .main-info__buttons(v-if="project.status === 'Requested'")
            .main-info__button
                Button(value="Cancel Quote" @makeAction="showModal")
        .main-info__modal(v-if="isApproveModal")
            ApproveModal(
                approveValue="Yes"
                notApproveValue="No"
                text="Are you sure?"
                @approve="cancelQuote"
                @notApprove="closeModal"
                @close="closeModal"
            )
</template>

<script>
import LabelValue from "~/components/LabelValue";
import Button from "~/components/buttons/Button";
import ApproveModal from "~/components/ApproveModal";
import Progress from "~/components/Progress";
import ClickOutside from "vue-click-outside";
import QuoteTasks from "./QuoteTasks";
import ProjectTasks from "./ProjectTasks";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            isColon: true,
            domain: "",
            icons: {
                approve: {icon: require("../../../../assets/images/Approve-icon.png"), active: true},
                reject: {icon: require("../../../../assets/images/Reject-icon.png"), active: true}
            },
            isXtmJobs: false,
            isApproveModal: false
        }
    },
    methods: {
        ...mapActions({
            selectProject: "selectProject",
            updateQuoteStatus: "updateQuoteStatus",
            alertToggle: "alertToggle",
            cancelCurrentQuote: "cancelQuote"
        }),
        async updateQuote(key) {
            try {
                await this.updateQuoteStatus({quote: this.project, key});
                const updatedQuote = this.allProjects.find(item => item._id === this.project._id);
                this.selectProject(updatedQuote);
            } catch(err) {}
        },
        getTotalProgress() {
            let total = 0;
            const { steps } = this.project;
            if(steps && steps.length) {
                for(let step of steps) {
                    const progress = isNaN(step.progress) ? +(step.progress.wordsDone/step.progress.wordsTotal*100).toFixed(2) : step.progress;
                    total+= progress;
                }
                return +(total/steps.length).toFixed(2);
            }
            return 0;
        },
        showModal() {
            this.isApproveModal = true;
        },
        closeModal() {
            this.isApproveModal = false;
        },
        async cancelQuote() {
            this.isApproveModal = false;
            try {
                await this.cancelCurrentQuote({id: this.project._id, status: this.project.status});
                this.$router.push('/dashboard');
            } catch(err) { }
        }
    },
    computed: {
        ...mapGetters({
            project: "getSelectedProject",
            allProjects: "getAllProjects",
            allRequests: "getAllRequests"
        }),
        isQuote() {
            const statuses = ['Quote sent', 'Requested'];
            return statuses.indexOf(this.project.status) !== -1
        },
        receivables() {
            return this.project.status !== 'Requested' ? this.project.finance.Price.receivables : "-";
        }
    },
    components: {
        LabelValue,
        Button,
        QuoteTasks,
        ProjectTasks,
        ApproveModal,
        Progress
    },
    directives: {
        ClickOutside
    },
    mounted() {
        this.domain = process.env.domain;
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.main-info {
    border-right: 1px solid $light-brown;
    display: flex;
    flex-direction: column;
    padding-left: 20px;
    height: 100%;
    box-sizing: border-box;
    position: relative;
    &__project-data {
       border-bottom: 1px solid $light-brown;
       display: flex;
       flex-direction: column;
       flex-wrap: wrap;
       height: 100px;
       padding: 10px 0 10px 8px;
    }
    &__currency {
        margin-left: 5px;
    }
    &__tasks {
        margin-top: 20px;
        padding-right: 10px;
    }
    &__buttons {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
    }
    &__button {
        width: 30%;
        display: flex;
        justify-content: center;
        position: relative;
    }
    &__image {
        cursor: pointer;
        transition: transform 0.1s ease-out;
        &:hover {
            transform: scale(1.1);
        }
    }
    &__modal {
        position: absolute;
        top: 50%;
        left: 30%;
    }
}

.data-block {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    position: relative;
    &:last-child {
        width: 20%;
    }
}

</style>
