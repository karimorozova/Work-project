<template lang="pug">
.steps
    .steps__action
        .steps__title Step Action
        .steps__drop-menu
            SelectSingle(
                :selectedOption="selectedAction"
                :options="actions"
                placeholder="Select Action"
                @chooseOption="setAction"
            )
    .steps__table
        .steps__tabs
            Tabs(
                :tabs="tabs"
                selectedTab="Steps"
                @setTab="showTab"
            )
        DataTable(
            :fields="fields"
            :tableData="allSteps"
            :isExpand="isExpand"
            :activeIndex="activeIndex"
            bodyClass="steps-table-body"
            bodyCellClass="steps-table-cell"
            bodyRowClass="steps-table-row"
        )
            template(slot="headerCheck" slot-scope="{ field }")
                input.steps__check(type="checkbox" v-model="isAllSelected" @change="selectAll")
            template(slot="headerName" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="headerLanguage" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="headerVendor" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="headerStart" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="headerDeadline" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="headerProgress" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="headerStatus" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="headerReceivables" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="headerPayables" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="headerMargin" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="check" slot-scope="{ row, index }")
                input.steps__step-data(type="checkbox" v-model="row.check" @change="selectStep")
                .steps__expander(@click="expandRow(index)")
            template(slot="name" slot-scope="{ row }")
                span.steps__step-data {{ row.name }}
            template(slot="language" slot-scope="{ row }")
                span.steps__step-data {{ row.source }} >> {{ row.target }}
            template(slot="vendor" slot-scope="{ row, index }")
                .steps__vendor-menu
                    PersonSelect(
                        :persons="extendedVendors(index)"
                        :selectedPerson="vendorName(row.vendor)"
                        :isExtended="isAllShow"
                        :isAdditionalShow="isAdditionalShow"
                        @setPerson="(person) => setVendor(person, index)"
                        @togglePersonsData="toggleVendors"
                    )
            template(slot="start" slot-scope="{ row, index }")
                Datepicker(@selected="(e) => changeDate(e, 'start', index)" 
                    v-model="row.start"
                    inputClass="steps__custom-input" 
                    calendarClass="steps__calendar-custom" 
                    :format="customFormatter" 
                    monday-first=true
                    :highlighted="highlighted")
            template(slot="deadline" slot-scope="{ row, index }")
                Datepicker(@selected="(e) => changeDate(e, 'deadline', index)" 
                    v-model="row.deadline"
                    inputClass="steps__custom-input" 
                    calendarClass="steps__calendar-custom" 
                    :format="customFormatter" 
                    monday-first=true
                    :disabled="disabled"
                    :highlighted="highlighted")
            template(slot="progress" slot-scope="{ row }")
                span.steps__step-data(v-if="!progress(row.progress)") {{ progress(row.progress) }}
                .steps__progress-bar(v-if="progress(row.progress)")
                    .steps__progress-filler(:style="{width: progress(row.progress) + '%'}")
                    span.steps__progress-tooltip {{ progress(row.progress) }}%
            template(slot="status" slot-scope="{ row }")
                span.steps__step-data {{ row.status }}
            template(slot="receivables" slot-scope="{ row }")
                span.steps__money(v-if="row.finance.Price.receivables") &euro;
                span.steps__step-data {{ row.finance.Price.receivables }}
            template(slot="payables" slot-scope="{ row }")
                span.steps__money(v-if="row.finance.Price.payables") &euro;                
                span.steps__step-data {{ row.finance.Price.payables }}
            template(slot="margin" slot-scope="{ row }")
                span.steps__money(v-if="+marginCalc(row.finance.Price)") &euro;
                span.steps__step-data(v-if="+marginCalc(row.finance.Price)") {{ marginCalc(row.finance.Price) }}
            template(slot="expanded" slot-scope="{ row, index }")
                StepInfo(
                    :step="row"
                    :index="index"
                    :vendors="vendors"
                    :task="getTask(index)"
                    @setStepVendor="(person) => setVendor(person, index)"
                )
</template>

<script>
import DataTable from "../DataTable";
import Tabs from "../Tabs";
import PersonSelect from "./PersonSelect";
import StepInfo from "./StepInfo";
import SelectSingle from "../SelectSingle";
import Datepicker from "../Datepicker";
import moment from "moment";
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        allSteps: {
            type: Array
        },
        tasks: {
            type: Array
        }
    },
    data() {
        return {
            highlighted: {
                days: [6, 0]
            },
            disabled: {
                to: moment().add(-1, 'day').endOf('day').toDate()
            },
            tabs: ['Tasks', 'Steps'],
            fields: [
                {label: "Check", headerKey: "headerCheck", key: "check", width: "4%"},
                {label: "Step", headerKey: "headerName", key: "name", width: "9%"},
                {label: "Language", headerKey: "headerLanguage", key: "language", width: "11%"},
                {label: "Vendor name", headerKey: "headerVendor", key: "vendor", width: "15%", padding: 0},
                {label: "Start", headerKey: "headerStart", key: "start", width: "9%"},
                {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "9%"},
                {label: "Progress", headerKey: "headerProgress", key: "progress", width: "8%"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "9%"},
                {label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "9%"},
                {label: "Payables", headerKey: "headerPayables", key: "payables", width: "9%"},
                {label: "Margin", headerKey: "headerMargin", key: "margin", width: "8%"},
            ],
            selectedVendors: [],
            isAllSelected: false,
            actions: ["Request confirmation", "Mark as accept / reject", "Cancel"],
            isExpand: false,
            activeIndex: -1,
            isAllShow: false,
            isAdditionalShow: true
        }
    },
    methods: {
        customFormatter(date) {
            return moment(date).format('DD-MM-YYYY');
        },
        toggleVendors({isAll}) {
            this.isAllShow = isAll;
        },
        showTab({index}) {
            return this.tabs[index] === 'Steps' ? true
            : this.$emit('showTab', { tab: this.tabs[index] });
        },
        marginCalc(finance) {
            return (finance.receivables - finance.payables).toFixed(2);
        },
        getTask(index) {
            return this.tasks.find(item => {
                return item.taskId === this.allSteps[index].taskId
            })
        },
        expandRow(index) {
            if(this.activeIndex !== index) {
                this.activeIndex = index;
                this.isExpand = true;    
            } else {
                this.activeIndex = -1;
                this.isExpand = false;
            }
            this.$emit("onRowClicked", {index: index})
        },
        setVendor({person}, index) {
            const { _id, firstName, surname, email } = person;
            this.$emit("setVendor", {vendor: { _id, firstName, surname, email }, index: index});
        },
        async setAction({option}) {
            this.selectedAction = option;
            const checkedSteps = this.allSteps.filter(item => {
                return item.check 
            })
            if(!checkedSteps.length) {
                return
            }
            try {
                if(option === "Request confirmation") {
                   return await this.requestConfirmation(checkedSteps);
                }
                if(option === "Cancel") {
                    return await this.cancelSteps(checkedSteps);
                }
            } catch(err) {
                this.alertToggle({message: "Internal server error. Request Confirmation cannot be sent.", isShow: true, type: 'error'})
            }

        },
        async requestConfirmation(steps) {
            try {
                const result = await this.$http.post('/pm-manage/vendor-request', { checkedSteps: steps, projectId: this.currentProject._id });
                await this.storeProject(result.body);
                this.alertToggle({message: "Requests has been sent.", isShow: true, type: 'success'})
            } catch(err) {
                this.alertToggle({message: "Internal server error. Request Confirmation cannot be sent.", isShow: true, type: 'error'});
            }
        },
        async cancelSteps(steps) {
            try {
                const result = await this.$http.post('/pm-manage/cancel-steps', { checkedSteps: steps, projectId: this.currentProject._id });
                await this.storeProject(result.body);
                this.alertToggle({message: "Chosen steps are cancelled.", isShow: true, type: 'success'});
            } catch(err) {
                this.alertToggle({message: "Internal server error. Cannot execute action.", isShow: true, type: 'error'});
            }
        },
        progress(prog) {
            return ((prog.wordsDone/prog.wordsTotal)*100).toFixed(2);
        },
        async selectAll() {
            let steps = [];
            for(const step of this.allSteps) {
                steps.push({...step, check: this.isAllSelected})
            }
            await this.setProjectValue({value: steps, prop: 'steps'});
        },
        async selectStep() {
            await this.setProjectValue({value: this.allSteps, prop: 'steps'});
        },
        vendorName(vendor) {
            return vendor ? vendor.firstName + ' ' + vendor.surname : "";
        },
        changeDate(e, prop, index) {
            this.$emit('setDate', {date: new Date(e), prop, index});
        },
        checkForLanguages(vendor, index) {
            return vendor.languageCombinations.find(item => {
                return item.source.symbol === this.allSteps[index].source && 
                    item.target.symbol === this.allSteps[index].target
            })
        },
        extendedVendors(index) {
            if(this.isAllShow) {
                return this.vendors;
            }
            const result = this.vendors.filter(item => this.checkForLanguages(item, index));
            return result;
        },
        ...mapActions({
            alertToggle: "alertToggle",
            setProjectValue: "setProjectValue",
            storeProject: "setCurrentProject"
        })
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject',
            vendors: "getVendors"
        })
    },
    components: {
        DataTable,
        PersonSelect,
        SelectSingle,
        Datepicker,
        StepInfo,
        Tabs
    }    
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.steps {
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
    &__expander {
        position: relative;
        cursor: pointer;
        opacity: 0.6;
        padding: 5px;
        margin-left: 5px;
        &:before {
            content: "";
            position: absolute;
            width: 7px;
            border: 1px solid $brown-border;
            top: 4px;
            left: -2px;
            transform: rotate(60deg);
        }
        &:after {
            content: "";
            position: absolute;
            width: 7px;
            border: 1px solid $brown-border;
            top: 4px;
            left: 2px;
            transform: rotate(-60deg);
        }
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
            .steps__progress-tooltip {
                opacity: 1;
            }
        }
    }
    &__progress-filler {
        background-color: $green-success;
        height: 100%;
    }
    &__vendor-menu {
        position: relative;
        width: 100%;
        height: 29px;
    }
}
</style>
