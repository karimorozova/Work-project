<template lang="pug">
    .deadline-date
        .deadline-date__title Suggested Deadline
        .deadline-date__picker
            Datepicker(ref="picker" 
                placeholder="dd-mm-yyyy"
                :format='format' 
                @selected="setDeadline"
                monday-first=true 
                :highlighted="highlighted" 
                :disabled="disabled"
                inputClass="request-quote__input"
                calendarClass="quote-calendar")
            img.deadline-date__icon(src="../../../../../assets/images/calendar.png" @click="togglePicker")
        .deadline-date__comment Select
</template>

<script>
import Datepicker from '@/components/Datepicker.vue';
import moment from "moment";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            highlighted: {
                days: [6, 0]
            },
            disabled: {
                to: moment().add(-1, 'day').endOf('day').toDate()
            },
            format: "dd-MM-yyyy",
            selectedDate: ""
        }
    },
    methods: {
        ...mapActions({
            setDetail: "setRequestQuoteDetail"
        }),
        togglePicker() {
            this.$refs.picker.showCalendar();
        },
        setDeadline(date) {
            this.setDetail({prop: "deadline", value: date});
        }
    },
    components: {
        Datepicker
    }    
}
</script>

<style lang="scss" scoped>

.deadline-date {
    display: flex;
    flex-direction: column;
    align-items: center;
    &__title {
        font-size: 12px;
        margin-bottom: 5px;
    }
    &__picker {
        position: relative;
        display: flex;
        align-items: center;
    }
    &__icon {
        position: absolute;
        width: 20px;
        right: -25px;
        cursor: pointer;
    }
    &__comment {
        font-size: 12px;
        opacity: 0.6;
        margin-top: 5px; 
    }
}

</style>
