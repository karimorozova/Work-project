<template lang="pug">
    .date-range
        .date-range__title Date Range:
        .date-range__dates
            input.date-range__input(type="text" readonly :value="dateRange")
            img.date-range__icon(src="../../assets/images/calendar.png" @click="togglePickers")
            .date-range__datepickers(v-if="isDatepickers" v-click-outside="closePickers")
                .date-range__pickers
                    DatePickers(
                        title="From"
                        @setTodaysDate="(e) => setDate(e, 'fromDate')"
                        @setNextDate="(e) => setDate(e, 'fromDate')"
                        @setPrevDate="(e) => setDate(e, 'fromDate')"
                        @setDate="(e) => setDate(e, 'fromDate')"
                        @removeAnytime="(e) => removeAnytime(e, 'fromDate')"
                        @setAnytime="(e) => setAnytime(e, 'fromDate')"
                        :date="fromDate")
                    DatePickers(
                        title="To"
                        @setTodaysDate="(e) => setDate(e, 'toDate')"
                        @setNextDate="(e) => setDate(e, 'toDate')"
                        @setPrevDate="(e) => setDate(e, 'toDate')"
                        @setDate="(e) => setDate(e, 'toDate')"
                        @removeAnytime="(e) => removeAnytime(e, 'toDate')"
                        @setAnytime="(e) => setAnytime(e, 'toDate')" 
                        :date="toDate")
                .date-range__button
                    Button(value="Assign" @clicked="setDateRange")
</template>

<script>
import DatePickers from "./DatePickers";
import Button from "../Button";
import moment from "moment";
import ClickOutside from "vue-click-outside";

export default {
    data() {
        return {
            isDatepickers: false,
            fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            toDate: new Date(),
            dateRange: ""
        }
    },
    methods: {
        togglePickers() {
            this.isDatepickers = !this.isDatepickers;
        },
        closePickers() {
            this.isDatepickers = false;
        },
        setDate({date}, prop) {
            this[prop] = new Date(date);
        },
        setAnytime(e, prop) {
            this[prop] = prop === 'fromDate' ? new Date('2019-01-01') : new Date();
        },
        removeAnytime(e, prop) {
            const today = new Date();
            this[prop] = prop === 'fromDate' ? new Date(today.getFullYear(), today.getMonth(), 1) : today;            
        },
        setDateRange() {
            this.$emit("getFilteredReports", {fromDate: this.fromDate, toDate: this.toDate});
            this.dateRange = moment(this.fromDate).format("DD-MM-YYYY") + ' / ' + moment(this.toDate).format("DD-MM-YYYY");
            this.closePickers();
        }
    },
    components: {
        DatePickers,
        Button
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>
@import '../../assets/scss/colors.scss';

.date-range {
    display: flex;
    align-items: center;
    font-size: 14px;
    &__title {
        margin-right: 10px;
    }
    &__dates {
        position: relative;
    }
    &__input {
        padding: 3px;
        border: 1px solid $cell-border;
        border-radius: 8px;
        width: 175px;
        height: 25px;
        box-sizing: border-box;
        color: $main-color;
    }
    &__icon {
        position: absolute;
        width: 18px;
        right: 5px;
        top: 3px;
        cursor: pointer;
    }
    &__datepickers {
        z-index: 50;
        background-color: $white;
        position: absolute;
        width: 472px;
        padding: 20px;
        box-sizing: border-box;
        box-shadow: 0 0 10px $brown-shadow;
    }
    &__pickers {
        display: flex;
        justify-content: space-between;
    }
    &__button {
        margin-top: 10px;
        text-align: right;
    }
}

</style>
