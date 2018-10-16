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
        DataTable(
            :fields="fields"
            :tableData="allSteps"
            :isExpand="isExpand"
            :activeIndex="activeIndex"
        )
            template(slot="Check" slot-scope="{ field }")
                input.steps__check(type="checkbox" v-model="isAllSelected" @change="selectAll")
            template(slot="Step" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Language" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Vendor name" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Start" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Deadline" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Progress" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Status" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Receivables" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Payables" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="Margin" slot-scope="{ field }")
                span.steps__label {{ field.label }}
            template(slot="check" slot-scope="{ row, index }")
                input.steps__step-data(type="checkbox" v-model="row.check" @change="selectStep(index)")
                .steps__expander(@click="expandRow(index)")
            template(slot="name" slot-scope="{ row }")
                span.steps__step-data {{ row.name }}
            template(slot="language" slot-scope="{ row }")
                span.steps__step-data {{ row.source }} >> {{ row.target }}
            template(slot="vendor" slot-scope="{ row, index }")
                Vendorselect(
                    :vendors="vendors"
                    :selectedVendor="vendorName(row.vendor)"
                    @changeVend="(vendor) => setVendor(vendor, index)"
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
                span.steps__step-data {{ progress(row.progress) }}
            template(slot="status" slot-scope="{ row }")
                span.steps__step-data {{ row.status }}
            template(slot="receivables" slot-scope="{ row }")
                span.steps__money(v-if="row.receivables") &euro;
                span.steps__step-data {{ row.receivables }}
            template(slot="payables" slot-scope="{ row }")
                span.steps__money(v-if="row.payables") &euro;                
                span.steps__step-data {{ row.payables }}
            template(slot="margin" slot-scope="{ row }")
                span.steps__money(v-if="row.margin") &euro;
                span.steps__step-data {{ row.margin }}
            template(slot="expanded")
                StepInfo
</template>

<script>
import DataTable from "../DataTable";
import Vendorselect from "./Vendorselect";
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
        vendors: {
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
            fields: [
                {label: "Check", key: "check", width: "4%"},
                {label: "Step", key: "name", width: "9%"},
                {label: "Language", key: "language", width: "11%"},
                {label: "Vendor name", key: "vendor", width: "15%"},
                {label: "Start", key: "start", width: "9%"},
                {label: "Deadline", key: "deadline", width: "9%"},
                {label: "Progress", key: "progress", width: "8%"},
                {label: "Status", key: "status", width: "9%"},
                {label: "Receivables", key: "receivables", width: "9%"},
                {label: "Payables", key: "payables", width: "9%"},
                {label: "Margin", key: "margin", width: "8%"},
            ],
            selectedVendors: [],
            isAllSelected: false,
            selectedAction: "",
            actions: ["Request confirmation", "Other Action"],
            isExpand: false,
            activeIndex: -1
        }
    },
    methods: {
        customFormatter(date) {
            return moment(date).format('DD-MM-YYYY');
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
        setVendor({vendor}, index) {
            const { _id, firstName, surname, email } = vendor;
            this.$emit("setVendor", {vendor: { _id, firstName, surname, email }, index: index});
        },
        async setAction({option}) {
            this.selectedAction = option;
            const steps = this.allSteps.filter(item => {
                return item.check 
            })
            try {
                if(option === "Request confirmation") {
                    const result = await this.$http.post('/pm-manage/vendor-request', { steps: steps, projectId: this.currentProject._id });
                    this.alertToggle({message: "Requests has been sent.", isShow: true, type: 'success'})
                }
            } catch(err) {
                this.alertToggle({message: "Internal server error. Request Confirmation cannot be sent.", isShow: true, type: 'error'})
            }

        },
        progress(prog) {
            return (prog.wordsDone/prog.wordsTotal)*100;
        },
        async selectAll() {
            const steps = this.allSteps.map(item => {
                item.check = this.isAllSelected;
                return item;
            })
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
        Vendorselect,
        SelectSingle,
        Datepicker,
        StepInfo
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
        margin-bottom: 20px;
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
}
</style>
