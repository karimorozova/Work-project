<template lang="pug">
    .filters
        .filters__col
            .filters__item(v-if="projectsType !== 'requests'")
                LabelValue(label="Status")
                    .filters__drop-menu
                        SelectSingle(
                            :selectedOption="status"
                            :options="statuses"
                            placeholder="Select"
                            @chooseOption="(e) => setValue(e, 'statusFilter')"
                            :projectsType="projectsType"
                        )
            .filters__item(v-else)
                LabelValue(label="Sales Manager")
                    .filters__drop-menu.filters_short-menu
                        SelectSingle(
                            :selectedOption="salesFilter"
                            :options="salesNames"
                            placeholder="Name"
                            @chooseOption="(e) => setValue(e, 'salesFilter')"
                        )
            .filters__item
                LabelValue(:label="projectsType === 'requests' ? 'Assigned To' : 'Project Manager'")
                    .filters__drop-menu(:class="projectsType === 'requests' ? 'filters_medium-menu' : 'filters_short-menu'")
                        SelectSingle(
                            :selectedOption="pmFilter"
                            :options="pmNames"
                            placeholder="Name"
                            @chooseOption="(e) => setValue(e, 'pmFilter')"
                        )
        .filters__col
            .filters__item
                LabelValue(label="Client Name")
                    input.filters__text-input(type="text" :value="clientName" @keyup="filterByName")
            .filters__item
                LabelValue(label="Source Langs")
                    .filters__drop-menu.filters_medium-menu
                        LanguagesSelect(
                            :selectedLangs="sourceLangs"
                            @chosenLang="({lang}) => addLang({lang}, 'sourceFilter')"
                        )
        .filters__col
            .filters__date
                LabelValue(label="Start Date and Time")
                    Datepicker(@selected="setStart" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" ref="startDate")
                img.filters__calendar-icon(src="../../assets/images/calendar.png" @click="startOpen")
            .filters__item.filters_flex-end
                LabelValue(label="Target Langs")
                    .filters__drop-menu.filters_medium-menu
                        LanguagesSelect(
                            :selectedLangs="targetLangs"
                            @chosenLang="({lang}) => addLang({lang}, 'targetFilter')"
                        )
        .filters__col
            .filters__date
                LabelValue(label="Deadline")
                    Datepicker(@selected="setDeadline" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" ref="deadline")
                img.filters__calendar-icon(src="../../assets/images/calendar.png" @click="deadlineOpen")
            .filters__itemCenter
                .filters__itemCenter-button(@click="refreshProjects")
</template>

<script>
import SelectSingle from "../SelectSingle";
import SelectMulti from "../SelectMulti";
import LanguagesSelect from "../LanguagesSelect";
import Datepicker from "../Datepicker";
import LabelValue from "./LabelValue";
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        status: {type: String},
        pmFilter: {type: String},
        salesFilter: {type: String},
        clientName: {type: String},
        sourceLangs: {type: Array},
        targetLangs: {type: Array},
        projectManagers: {type: Array},
        salesManagers: {type: Array},
        projectsType: {type: String},
    },
    data() {
        return {
            disabled: {
                to: moment().add(-1, 'day').endOf('day').toDate()
            },
            highlighted: {
                days: [6, 0]
            },
            statuses: ["All", "Approved", "Closed", "Cancelled", "Cancelled Halfway", "Draft", "In Progress", "Quote sent", "Rejected"],
            typingTimer: "",
            doneTypingInterval: 800
        }
    },
    methods: {
        refreshProjects(){
            this.$emit('refreshProjects')
        },
        setStart(event) {
            const date = event;
            date.setHours(0,0,0,0);
            this.$emit("setFilter", {option: date, prop: 'startFilter'})
        },
        setDeadline(event) {
            const date = event;
            date.setHours(23,0,0,0);
            this.$emit("setFilter", {option: date, prop: 'deadlineFilter'})
        },
        customFormatter(date) {
            return moment(date).format('DD-MM-YYYY, HH:mm');
        },
        setValue({option, index}, prop) {
            this.$emit('setFilter', {option, index, prop})
        },
        startOpen() {
            this.$refs.startDate.showCalendar()
        },
        deadlineOpen() {
            this.$refs.deadline.showCalendar()
        },
        addLang({lang}, goal) {
            const prop = goal === 'sourceFilter' ? 'sourceLangs' : 'targetLangs';
            const position = this[prop].indexOf(lang.symbol);
            if(position != -1) {
                this.$emit('removeLangFilter', {from: goal, position})
            } else {
                this.$emit('addLangFilter', {to: goal, lang})
            }
        },
        setClientName(event) {
            let option = event.target.value;
            this.$emit('setFilter', {option, prop: 'clientFilter'})
        },
        filterByName(e) {
            const { value } = e.target;
            clearTimeout(this.typingTimer);
            this.typingTimer = setTimeout(doneTyping, this.doneTypingInterval);
            const vm = this;
            function doneTyping () {
                vm.$emit('setFilter', {option: value, prop: 'clientFilter'});
            }
        },
    },
    computed: {
        ...mapGetters({
            languages: "getAllLanguages",
        }),
        languageNames() {
            return this.languages.map(item => {
                return item.lang;
            })
        },
        pmNames() {
            const fullNames = this.projectManagers.map(item => {
                return item.firstName + " " + item.lastName;
            })
            return ['All', ...fullNames];
        },
        salesNames() {
            const fullNames = this.salesManagers.map(item => {
                return item.firstName + " " + item.lastName;
            })
            return ['All', ...fullNames];
        }
    },
    mounted() {
      if (this.projectsType === 'requests') {
        this.statuses = ["Requested"];
      }
    },
    components: {
        SelectSingle,
        SelectMulti,
        LanguagesSelect,
        Datepicker,
        LabelValue
    }
}
</script>


<style lang="scss">
.filters {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 20px;
    &__itemCenter{
        display: flex;
        justify-content: center;
        &-button{
            background-image: url('../../assets/images/refresh-icon.png');
            width: 24px;
            height: 20px;
            cursor: pointer;
        }
    }
    &__col {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 21%;
        font-size: 14px;
        height: 80px;
        &:nth-of-type(3) {
            width: 25%;
        }
        &:last-child {
            width: 19%;
        }
    }
    &__drop-menu {
        position: relative;
        width: 200px;
        height: 28px;
    }
    &_medium-menu {
        width: 166px;
    }
    &_short-menu {
        width: 148px;
    }
    &__text-input {
        padding: 0 5px;
        width: 156px;
        height: 28px;
        outline: none;
        border: 1px solid #68573E;
        border-radius: 5px;
        color: #68573E;
        transition: all 0.2s;
        &:focus {
            box-shadow: 0 0 3px #68573E;
        }
    }
    &__date {
        position: relative;
    }
    &__calendar-icon {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 18px;
        cursor: pointer;
    }
}
</style>
