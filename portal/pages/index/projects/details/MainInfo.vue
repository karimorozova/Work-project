<template lang="pug">
    .main-info
        .main-info__project-data
            .data-block
                .data-block__item
                    LabelValue(title="Project Name" :isColon="isColon" :value="project.projectName")  
                .data-block__item
                    LabelValue(title="Project ID" :isColon="isColon" :value="project.projectId")  
            .data-block
                .data-block__item
                    LabelValue(title="Status" :isColon="isColon" :value="project.status")  
                .data-block__item
                    LabelValue(v-if="project.finance" title="Total Cost" :isColon="isColon" :value="project.finance.Price.receivables")
                        span.main-info__currency(v-if="project.finance && project.finance.Price.receivables") &euro;
        .main-info__tasks(v-if="isQuote")
            QuoteTasks
        .main-info__tasks(v-else)
            ProjectTasks
        .main-info__buttons(v-if="project.status === 'Quote sent' && !project.hasOwnProperty('fromXTRF')")
            .main-info__button
                Button(value="Approve Quote" buttonClass="tasks-approve" @makeAction="updateQuote('approve')")
            .main-info__button
                Button(value="Reject Quote" @makeAction="updateQuote('reject')")
</template>

<script>
import LabelValue from "~/components/LabelValue";
import Button from "~/components/buttons/Button";
import ApproveModal from "~/components/ApproveModal";
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
            isApproveModal: false
        }
    },
    methods: {
        ...mapActions({
            selectProject: "selectProject",
            updateQuoteStatus: "updateQuoteStatus",
            alertToggle: "alertToggle"
        }),
        async updateQuote(key) {
            try {
                await this.updateQuoteStatus({quote: this.project, key});
                const updatedQuote = this.allProjects.find(item => item._id === this.project._id);
                this.selectProject(updatedQuote);
            } catch(err) {}
        },
    },
    computed: {
        ...mapGetters({
            project: "getSelectedProject",
            allProjects: "getAllProjects"
        }),
        isQuote() {
            const statuses = ['Quote sent', 'Requested'];
            return statuses.indexOf(this.project.status) !== -1
        }
    },
    components: {
        LabelValue,
        Button,
        QuoteTasks,
        ProjectTasks,
        ApproveModal
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
    height: 100%;
    box-sizing: border-box;
    position: relative;
    &__project-data {
       border-bottom: 1px solid $light-brown;
       display: flex;
       flex-direction: column;
       flex-wrap: wrap;
      height: 90px;
      padding: 20px;
    }
    &__currency {
        margin-left: 5px;
    }
    &__tasks {
      padding: 20px;
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
}

.data-block {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    position: relative;
    &__progress {
        position: absolute;
        left: -20px;
    }
}

</style>
