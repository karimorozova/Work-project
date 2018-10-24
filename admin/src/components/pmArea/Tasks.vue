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
                span.tasks__task-data {{ row.id }}
            template(slot="language" slot-scope="{ row }")
                span.tasks__task-data {{ row.sourceLanguage }} >> {{ row.targetLanguage }}
            template(slot="start" slot-scope="{ row }")
                span.tasks__task-data {{ row.start }}
            template(slot="deadline" slot-scope="{ row }")
                span.tasks__task-data {{ row.deadline }}
            template(slot="progress" slot-scope="{ row }")
                span.tasks__task-data {{ row.progress }}
            template(slot="status" slot-scope="{ row }")
                span.tasks__task-data {{ row.status }}
            template(slot="receivables" slot-scope="{ row }")
                span.tasks__task-data {{ row.receivables }}
            template(slot="payables" slot-scope="{ row }")
                span.tasks__task-data {{ row.payables }}
            template(slot="margin" slot-scope="{ row }")
                span.tasks__task-data {{ row.cost }}
            template(slot="delivery" slot-scope="{ row }")
                span.tasks__task-data {{ row.delivery }}
</template>

<script>
import DataTable from "../DataTable";
import Tabs from "../Tabs";
import VendorSelect from "./VendorSelect";
import SelectSingle from "../SelectSingle";
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
                {label: "Task ID", headerKey: "headerTaskid", key: "taskId", width: "10%"},
                {label: "Language", headerKey: "headerLanguage", key: "language", width: "11%"},
                {label: "Start", headerKey: "headerStart", key: "start", width: "9%"},
                {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "9%"},
                {label: "Progress", headerKey: "headerProgress", key: "progress", width: "9%"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "10%"},
                {label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "11%"},
                {label: "Payables", headerKey: "headerPayables", key: "payables", width: "9%"},
                {label: "Margin", headerKey: "headerMargin", key: "margin", width: "9%"},
                {label: "Delivery", headerKey: "headerDelivery", key: "delivery", width: "9%"},
            ],
            actions: ["Cancel"],
            tabs: ['Tasks', 'Steps'],
            isAllSelected: false
        }
    },
    methods: {
        onRowClicked({index}) {
            this.$emit("onRowClicked", {index: index})
        },
        setAction({option}) {
            this.selectedAction = option;
            return
        },
        showTab({index}) {
            return this.tabs[index] === 'Tasks' ? true
            : this.$emit('showTab', { tab: this.tabs[index] });
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
        Tabs
    }    
}
</script>

<style lang="scss" scoped>
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
}
</style>
