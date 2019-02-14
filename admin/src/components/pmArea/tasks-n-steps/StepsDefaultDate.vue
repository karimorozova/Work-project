<template lang="pug">
.steps-date
    .steps-date__title Step {{ stepCounter }}:
    .steps-date__picker
        .steps-date__label Start date:
        .steps-date__input
            Datepicker(
                ref="start"
                :isReadonly="isReadonly"
                :value="start"
                :format="customFormatter" 
                monday-first=true
                :disabled="disabledStart"
                :highlighted="highlighted"
                inputClass="datepicker-custom" 
                calendarClass="calendar-custom"
                @selected="(e) => setDate(e, 'start')"
                @invalidDate="invalidDateWarn"
            )
        img.steps-date__image(src="../../../assets/images/calendar.png" @click="showStartCalendar")
    .steps-date__picker
        .steps-date__label Deadline:
        .steps-date__input
            Datepicker(
                ref="deadline"
                :isReadonly="isReadonly"
                :value="deadline"
                :format="customFormatter"
                monday-first=true
                :disabled="disabledDeadline"
                :highlighted="highlighted"
                inputClass="datepicker-custom" 
                calendarClass="calendar-custom"
                @selected="(e) => setDate(e, 'deadline')"
                @invalidDate="invalidDateWarn"
            )
        img.steps-date__image(src="../../../assets/images/calendar.png" @click="showDeadlineCalendar")        

</template>

<script>
import Datepicker from "../../Datepicker";
import moment from "moment";
import { mapGetters, mapActions} from "vuex";

export default {
    props: {
        stepCounter: {
            type: Number
        },
        start: {
            type: [Date, String]
        },
        deadline: {
            type: [Date, String]
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
            isReadonly: false
        }
    },
    methods: {
        customFormatter(date) {
            return moment(date).format('DD-MM-YYYY, HH:mm');
        },
        showStartCalendar() {
            this.$refs.start.showCalendar();
        },
        showDeadlineCalendar() {
            this.$refs.deadline.showCalendar();
        },
        setDate(e, prop) {
            this.$emit("setDate", { date: new Date(e), prop })
        },
        invalidDateWarn({message}) {
            console.log(message);
        }
    },
    computed: {
        disabledStart() {
            let result = {
                to: moment().add(-1, 'day').endOf('day').toDate()
            };
            if(this.deadline) {
                result = {
                    to: moment().add(-1, 'day').endOf('day').toDate(),
                    from: moment(this.deadline).add(-1, 'hour').endOf('day').toDate()
                }
            }
            return result;
        },
        disabledDeadline() {
            let result = {
                to: moment().add(-1, 'day').endOf('day').toDate()
            };
            if(this.start) {
                result = {
                    to: moment(this.start).add(-1, 'day').endOf('day').toDate()
                }
            }
            return result;
        }
    },
    components: {
        Datepicker
    }    
}
</script>

<style lang="scss" scoped>

.steps-date {
    display: flex;
    width: 72%;
    align-items: center;
    margin-bottom: 20px;
    &__title {
        width: 11%;
    }
    &__picker {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        width: 40%;
        position: relative;
    }
    &__label {
        margin-right: 10px;
    }
    &__image {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 18px;
        cursor: pointer;
    }
}

</style>
