<template lang="pug">
.tasks
    .tasks__action
        .tasks__title Task Action
        .tasks__drop-menu
            SelectSingle(
                :selectedOption="selectedAction"
                :options="actions"
                placeholder="Select Action"
                @chooseOption="setAction"
            )
    .tasks__table
        .tasks__tabs
            Tabs(
                :tabs="tabs"
                selectedTab="Tasks"
                @setTab="showTab"
            )
        DataTable(
            :fields="fields"
            :tableData="allTasks"
            bodyRowClass="steps-table-row"
            @onRowClicked="onRowClicked"
        )
            template(slot="headerCheck" slot-scope="{ field }")
                input.tasks__check(type="checkbox" v-model="isAllSelected" @change="selectAll")
            template(slot="headerTaskid" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerLanguage" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerStart" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerDeadline" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerProgress" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerStatus" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerReceivables" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerPayables" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerMargin" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="headerDelivery" slot-scope="{ field }")
                span.tasks__label {{ field.label }}
            template(slot="check" slot-scope="{ row }")
                input.tasks__task-data(type="checkbox" v-model="row.check" @change="selectTask")
            template(slot="taskId" slot-scope="{ row }")
                span.tasks__task-data {{ row.taskId }}
            template(slot="language" slot-scope="{ row }")
                span.tasks__task-data {{ row.sourceLanguage }} >> {{ row.targetLanguage }}
            template(slot="start" slot-scope="{ row }")
                span.tasks__task-data {{ formatDate(row.start) }}
            template(slot="deadline" slot-scope="{ row }")
                span.tasks__task-data {{ formatDate(row.deadline) }}
            template(slot="progress" slot-scope="{ row }")
                .tasks__progress-bar(v-if="progress(row)")
                    .tasks__progress-filler(:style="{width: progress(row) + '%'}")
                    span.tasks__progress-tooltip {{ progress(row) }}%
            template(slot="status" slot-scope="{ row }")
                span.tasks__task-data {{ row.status }}
            template(slot="receivables" slot-scope="{ row }")
                span.tasks__money(v-if="row.finance.Price.receivables") &euro;
                span.tasks__task-data {{ row.finance.Price.receivables }}
            template(slot="payables" slot-scope="{ row }")
                span.tasks__money(v-if="row.finance.Price.payables") &euro;
                span.tasks__task-data {{ row.finance.Price.payables }}
            template(slot="margin" slot-scope="{ row }")
                span.tasks__money(v-if="+marginCalc(row.finance.Price)") &euro;
                span.tasks__task-data(v-if="+marginCalc(row.finance.Price)") {{ marginCalc(row.finance.Price) }}
            template(slot="delivery" slot-scope="{ row }")
                img.tasks__delivery-image(v-if="+progress(row) === 100" src="../../assets/images/download-big-b.png")
    .tasks__approve-action(v-if="isApproveActionShow")
        ApproveModal(text="Please, choose the action:" @close="closeApproveModal")
</template>

<script>
import DataTable from "../DataTable";
import Tabs from "../Tabs";
import SelectSingle from "../SelectSingle";
import ApproveModal from "../ApproveModal";
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        allTasks: {
            type: Array
        }
    },
    data() {
        return {
            fields: [
                {label: "check", headerKey: "headerCheck", key: "check", width: "4%"},
                {label: "Task ID", headerKey: "headerTaskid", key: "taskId", width: "14%"},
                {label: "Language", headerKey: "headerLanguage", key: "language", width: "11%"},
                {label: "Start", headerKey: "headerStart", key: "start", width: "9%"},
                {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "9%"},
                {label: "Progress", headerKey: "headerProgress", key: "progress", width: "9%"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "10%"},
                {label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "10%"},
                {label: "Payables", headerKey: "headerPayables", key: "payables", width: "9%"},
                {label: "Margin", headerKey: "headerMargin", key: "margin", width: "8%"},
                {label: "Delivery", headerKey: "headerDelivery", key: "delivery", width: "7%", cellClass: "tasks_centered"},
            ],
            selectedAction: "",
            actions: ["Cancel"],
            tabs: ['Tasks', 'Steps'],
            isAllSelected: false,
            isApproveActionShow: false
        }
    },
    methods: {
        onRowClicked({index}) {
            this.$emit("onRowClicked", {index: index})
        },
        setAction({option}) {
            this.selectedAction = option;
            this.isApproveActionShow = true;
        },
        showTab({index}) {
            return !this.currentProject.steps.length || this.tabs[index] === 'Tasks' ? true
            : this.$emit('showTab', { tab: this.tabs[index] });
          
        },
        formatDate(date) {
            return date.split('T')[0].split('-').reverse().join('-');
        },
        marginCalc(finance) {
            return (finance.receivables - finance.payables).toFixed(2);
        },
        progress(task) {
            const taskSteps = this.currentProject.steps.filter(item => item.taskId === task.id);
            return taskSteps.reduce((init, cur) => {
                return init + (cur.progress.wordsDone/cur.progress.wordsTotal)*100/taskSteps.length;
            }, 0).toFixed(2);
        },
        async selectAll() {
            let tasks = [];
            for(const task of this.allTasks) {
                tasks.push({...task, check: this.isAllSelected})
            }
            await this.setProjectValue({value: tasks, prop: 'tasks'});
        },
        async selectTask() {
            await this.setProjectValue({value: this.allTasks, prop: 'tasks'});
        },
        closeApproveModal() {
            this.isApproveActionShow = false;
            this.selectedAction = "";
        },
        ...mapActions({
            alertToggle: "alertToggle",
            setProjectValue: "setProjectValue"
        })
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject' 
        })
    },
    components: {
        DataTable,
        SelectSingle,
        ApproveModal,
        Tabs
    }    
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.tasks {
    display: flex;
    flex-direction: column;
    &__action {
        align-self: flex-end;
    }
    &__title {
        margin-bottom: 5px;
        font-size: 18px;
    }
    &__drop-menu {
        position: relative;
        width: 191px;
        height: 28px;
    }
    &__progress-tooltip {
        position: absolute;
        opacity: 0;
        background-color: $white;
        color: $main-color;
        transition: all 0.2s;
        font-size: 14px;
        top: -1px;
        left: 14px;
        padding: 0 3px;
    }
    &__progress-bar {
        width: 100%;
        height: 15px;
        border: 1px solid $brown-border;
        position: relative;
        box-sizing: border-box;
        padding: 1px;
        &:hover {
            .tasks__progress-tooltip {
                opacity: 1;
            }
        }
    }
    &__progress-filler {
        background-color: $green-success;
        height: 100%;
    }
    &__delivery-image {
        height: 18px;
        width: 18px;
        cursor: pointer;
    }
    &__approve-action {
        position: absolute;
        right: 0;
        z-index: 50;
        background-color: $white;
    }
}
</style>
