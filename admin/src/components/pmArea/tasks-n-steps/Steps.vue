<template lang="pug">
.steps
    .steps__action
        .steps__title Step Action
        .steps__drop-menu
            SelectSingle(
                :selectedOption="selectedAction"
                :options="stepActions"
                placeholder="Select Action"
                @chooseOption="setAction"
            )
    .steps__table(v-click-outside="closeStepInfo")
        .steps__tabs
            Tabs(
                :tabs="tabs"
                selectedTab="Steps"
                @setTab="showTab"
            )
        DataTable(
            :fields="fields"
            :tableData="allSteps"
            :activeIndex="activeIndex"
            :bodyClass="['steps-table-body', {'tbody_visible-overflow': allSteps.length < 10}]"
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
                .steps__info-icon(@click="showStepDetails(index)")
                    i.fa.fa-info-circle
            template(slot="name" slot-scope="{ row }")
                span.steps__step-data {{ row.name }}
            template(slot="language" slot-scope="{ row }")
                span.steps__step-data {{ row.source }} >> {{ row.target }}
            template(slot="vendor" slot-scope="{ row, index }")
                .steps__vendor-menu(v-if="row.status === 'Created' || row.status === 'Rejected'")
                    PersonSelect(
                        :persons="extendedVendors(index)"
                        :selectedPerson="vendorName(row.vendor)"
                        :isExtended="isAllShow"
                        :isAdditionalShow="isAdditionalShow"
                        @setPerson="(person) => setVendor(person, index)"
                        @togglePersonsData="toggleVendors"
                        @scrollDrop="scrollDrop"
                    )
                span.steps__step-vendor(v-if="row.status !== 'Created' && row.status !== 'Rejected'") {{ vendorName(row.vendor) }}
                    span.steps__step-no-select(v-if="!row.vendor") No Vendor
            template(slot="start" slot-scope="{ row, index }")
                Datepicker(
                    @selected="(e) => changeDate(e, 'start', index)" 
                    v-model="row.start"
                    inputClass="steps__custom-input" 
                    calendarClass="steps__calendar-custom" 
                    :format="customFormatter" 
                    monday-first=true
                    :highlighted="highlighted"
                    @scrollDrop="scrollDrop")
            template(slot="deadline" slot-scope="{ row, index }")
                Datepicker(
                    @selected="(e) => changeDate(e, 'deadline', index)" 
                    v-model="row.deadline"
                    inputClass="steps__custom-input" 
                    calendarClass="steps__calendar-custom" 
                    :format="customFormatter" 
                    monday-first=true
                    :disabled="disabled"
                    :highlighted="highlighted"
                    @scrollDrop="scrollDrop")
            template(slot="progress" slot-scope="{ row }")
                ProgressLine(:progress="progress(row.progress)")
            template(slot="status" slot-scope="{ row }")
                span.steps__step-status {{ row.status }}
            template(slot="receivables" slot-scope="{ row }")
                span.steps__money(v-if="row.finance.Price.receivables") &euro;
                span.steps__step-data {{ row.finance.Price.receivables }}
            template(slot="payables" slot-scope="{ row }")
                span.steps__money(v-if="row.finance.Price.payables") &euro;                
                span.steps__step-data {{ row.finance.Price.payables }}
            template(slot="margin" slot-scope="{ row }")
                span.steps__money(v-if="+marginCalc(row.finance.Price)") &euro;
                span.steps__step-data(v-if="+marginCalc(row.finance.Price)") {{ marginCalc(row.finance.Price) }}
        transition(name="fade")
            .steps__info(v-if="isStepInfo")
                StepInfo(
                    :step="allSteps[infoIndex]"
                    :index="infoIndex"
                    :vendors="vendors"
                    :task="getTask(infoIndex)"
                    @setStepVendor="(person) => setVendor(person, infoIndex)"
                    @closeStepInfo="closeStepInfo"
                )
    .steps__approve-action(v-if="isApproveActionShow")
        ApproveModal(
            :text="modalTexts.main" 
            :approveValue="modalTexts.approve"
            :notApproveValue="modalTexts.notApprove"
            @approve="approveAction"
            @notApprove="notApproveAction"
            @close="closeApproveModal")
</template>

<script>
import DataTable from "../../DataTable";
import ProgressLine from "../../ProgressLine";
import Tabs from "../../Tabs";
import PersonSelect from "../PersonSelect";
import ApproveModal from "../../ApproveModal";
const StepInfo = () => import("./StepInfo");
import SelectSingle from "../../SelectSingle";
const Datepicker = () => import("../../Datepicker");
import moment from "moment";
import ClickOutside from "vue-click-outside";
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
                {label: "Language", headerKey: "headerLanguage", key: "language", width: "12%"},
                {label: "Vendor name", headerKey: "headerVendor", key: "vendor", width: "14%", padding: 0},
                {label: "Start", headerKey: "headerStart", key: "start", width: "9%"},
                {label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "9%"},
                {label: "Progress", headerKey: "headerProgress", key: "progress", width: "8%"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "9%", padding: 0},
                {label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "9%"},
                {label: "Payables", headerKey: "headerPayables", key: "payables", width: "9%"},
                {label: "Margin", headerKey: "headerMargin", key: "margin", width: "8%"},
            ],
            selectedVendors: [],
            isAllSelected: false,
            actions: ["Request confirmation", "Cancel"],
            modalTexts: {main: "Are you sure?", approve: "Yes", notApprove: "No"},
            isApproveActionShow: false,
            activeIndex: -1,
            isAllShow: false,
            isAdditionalShow: true,
            chosenStep: {},
            infoIndex: -1,
            isStepInfo: false
        }
    },
    methods: {
        customFormatter(date) {
            return moment(date).format('DD-MM-YYYY');
        },
        scrollDrop({drop, offsetTop, offsetHeight}) {
            let tbody = document.querySelector('.table__tbody');
            if(drop && tbody.clientHeight >= 320) {
                setTimeout(() => {
                    const offsetBottom = offsetTop + offsetHeight*2;
                    const scrollBottom = tbody.scrollTop + tbody.offsetHeight;
                    if (offsetBottom > scrollBottom) {
                        tbody.scrollTop = offsetBottom + offsetHeight*2 - tbody.offsetHeight;
                    }
                }, 100);
            }
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
        showStepDetails(index) {
            this.infoIndex = index;
            this.isStepInfo = true;
        },
        closeStepInfo() {
            this.isStepInfo = false;
            this.infoIndex = -1;
        },
        setVendor({person}, index) {
            this.$emit("setVendor", {vendor: { _id: person._id }, index});
        },
        async setAction({option}) {
            this.selectedAction = option;
            this.setModalTexts(option);
            this.isApproveActionShow = true;
        },
        setModalTexts(option) {
            this.modalTexts = {main: "Are you sure?", approve: "Yes", notApprove: "No"};
            switch (this.selectedAction) {
                case "Request confirmation":
                    this.modalTexts.main = "Please, choose action:";
                    this.modalTexts.approve = "Send";
                    this.modalTexts.notApprove = "Cancel";
                    break;
                case "Mark as accept/reject":
                    this.modalTexts.main = "Select the status:";
                    this.modalTexts.approve = "Accepted";
                    this.modalTexts.notApprove = "Rejected";
            }
        },
        getCheckedSteps() {
            return this.allSteps.filter(item => {
                return item.check 
            })
        },
        async approveAction() {
            const checkedSteps = this.getCheckedSteps();
            !checkedSteps.length ? this.closeApproveModal() : await this.doStepApproveAction(checkedSteps);
        },
        async doStepApproveAction(checkedSteps) {
            try {
                switch (this.selectedAction) {
                    case "Request confirmation":
                        await this.requestConfirmation(checkedSteps);
                        break
                    case "Cancel":
                        await this.cancelSteps(checkedSteps);
                        break
                    case "Mark as accept/reject":
                        const status = this.getAcceptedStepStatus();
                        await this.setStepsStatus({status, steps: checkedSteps});
                        break
                }
            } catch(err) {
                this.alertToggle({message: "Internal server error.Try later.", isShow: true, type: 'error'});
            } finally {
                this.closeApproveModal();
            }
        },
        getAcceptedStepStatus() {
            let status = "Accepted";
            if(this.currentProject.status === 'Approved' || this.currentProject.status === 'Started') {
                status = "Ready to Start"
            }
            return status;
        },
        async notApproveAction() {
            const checkedSteps = this.getCheckedSteps();
            if(!checkedSteps.length) {
                return this.closeApproveModal();
            }
            try {
                switch(this.modalTexts.notApprove) {
                    case "No":
                    case "Cancel":
                        this.closeApproveModal();
                        break;
                    case "Rejected":
                        await this.setStepsStatus({status: "Rejected", steps: checkedSteps});
                }
            } catch(err) {
                this.alertToggle({message: "Internal server error.Try later.", isShow: true, type: 'error'});
            } finally {
                this.closeApproveModal();
            }
        },
        closeApproveModal() {
            this.isApproveActionShow = false;
            this.selectedAction = "";
        },
        async requestConfirmation(steps) {
            const filteredSteps = steps.filter(item => item.status === "Created" || item.status === "Rejected");
            if(!filteredSteps.length) return;
            try {
                const result = await this.$http.post('/pm-manage/vendor-request', { checkedSteps: filteredSteps, projectId: this.currentProject._id });
                await this.storeProject(result.body);
                this.alertToggle({message: "Requests has been sent.", isShow: true, type: 'success'})
            } catch(err) {
                this.alertToggle({message: "Error: Request Confirmation cannot be sent.", isShow: true, type: 'error'});
            }
        },
        async cancelSteps(steps) {
            const filteredSteps = steps.filter(item => item.status !== "Completed");
            if(!filteredSteps.length) return;
            try {
                if(this.allSteps.length === steps.length) {
                    await setProjectStatus({status: "Cancelled"});
                } else {
                    const result = await this.$http.post('/pm-manage/cancel-steps', { checkedSteps: filteredSteps, projectId: this.currentProject._id });
                    await this.storeProject(result.body);
                }
                this.alertToggle({message: "Chosen steps are cancelled.", isShow: true, type: 'success'});
            } catch(err) {
                this.alertToggle({message: "Error: Cannot execute action.", isShow: true, type: 'error'});
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
            const surname = vendor && (vendor.surname && vendor.surname !== "undefined") ? vendor.surname : "";
            return vendor ? vendor.firstName + ' ' + surname : "";
        },
        changeDate(e, prop, index) {
            this.$emit('setDate', {date: new Date(e), prop, index});
        },
        checkForLanguages(vendor, index) {
            const step = this.allSteps[index];
            const service = this.services.find(item => {
                return step.name === "translate1" ? item.symbol === "tr" : item.symbol === "pr";
            });
            const matchedVendor = vendor.languageCombinations.find(item => {
                if(item.source && item.source.symbol === step.source && 
                    item.target.symbol === step.target) {
                        return this.hasRateValue({
                                service: service._id, 
                                vendorIndustries: item.industries, 
                                stepIndustry: this.currentProject.industry._id
                            });
                }
            })
            return matchedVendor;
        },
        hasRateValue({service, vendorIndustries, stepIndustry}) {
            const industry = vendorIndustries.find(item => item.industry._id === stepIndustry);
            return industry ? industry.rates[service].value : false;
        },
        extendedVendors(index) {
            let result = [];
            if(this.isAllShow) {
                return this.vendors.filter(item => item.status === 'Active');
            }
            result = this.vendors.filter(item => item.status === 'Active' && this.checkForLanguages(item, index));
            return result;
        },
        ...mapActions({
            alertToggle: "alertToggle",
            setProjectValue: "setProjectValue",
            storeProject: "setCurrentProject",
            setStepsStatus: "setStepsStatus",
            setProjectStatus: "setProjectStatus"
        })
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject',
            vendors: "getVendors",
            services: "getVuexServices"
        }),
        stepActions() {
            let result = this.actions;
            const requestedStep = this.allSteps.find(item => item.status === "Request Sent" || item.status === "Rejected");
            if(requestedStep && result.indexOf("Mark as accept/reject") === -1) {
                result.unshift("Mark as accept/reject");
            }
            return result;
        }
    },
    components: {
        DataTable,
        ProgressLine,
        PersonSelect,
        SelectSingle,
        Datepicker,
        StepInfo,
        ApproveModal,
        Tabs
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.steps {
    display: flex;
    flex-direction: column;
    &__table {
        position: relative;
    }
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
    &__info {
        position: absolute;
        top: -300px;
        left: 10%;
        width: 80%;
        z-index: 50;
        background-color: $white;
        box-shadow: 0 0 10px $brown-shadow;
    }
    &__info-icon {
        cursor: pointer;
        display: flex;
        align-items: center;
        margin-left: 4px;
        i {
            color: $main-color;
            opacity: 0.7;
            transition: all 0.3s;
            &:hover {
                opacity: 1;
            }
        }
    }
    &__step-vendor {
        padding: 7px 5px 5px 6px;
    }
    &__step-no-select {
        opacity: 0.7;
    }
    &_rotated {
        transform: rotate(180deg);
    }
    &__vendor-menu {
        position: relative;
        width: 100%;
        height: 29px;
    }
    &__approve-action {
        position: absolute;
        right: 0;
        z-index: 50;
        background-color: $white;
    }
    &__step-status {
        padding-left: 5px;
        max-height: 32px;
        overflow-y: auto;
    }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
