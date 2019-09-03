<template lang="pug">
.steps-date
  .steps-date-wrapper
    .steps-date__picker
      .steps-date__input-wrapper
        .steps-date__label Start date
        .steps-date__datepicker-wrapper
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
                  inputClass2="datepicker-custom-mod"
                  calendarClass="calendar-custom"
                  @selected="(e) => setDate(e, 'start')"
                  @invalidDate="invalidDateWarn"
              )
          img.steps-date__image(src="../../../assets/images/calendar.png" @click="showStartCalendar")
    .steps-date__picker
      .steps-date__input-wrapper
        .steps-date__label Deadline
        .steps-date__datepicker-wrapper
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
                  inputClass2="datepicker-custom-mod"
                  calendarClass="calendar-custom"
                  @selected="(e) => setDate(e, 'deadline')"
                  @invalidDate="invalidDateWarn"
              )
          img.steps-date__image(src="../../../assets/images/calendar.png" @click="showDeadlineCalendar")
  .steps-date__title Step {{ stepCounter }}

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
  @import '../../../assets/scss/colors.scss';
.steps-date {
  padding: 12px 20px 0;
  background-color: $active-background;
  border: 1px solid $brown-border;
  width: 452px;
  margin-bottom: 50px;
  position: relative;
    &-wrapper{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    &__datepicker-wrapper {
      position: relative;
    }
    &__input-wrapper {
      display: flex;
      flex-direction: column;
      position:relative;
      align-items: center;
    }
    &__title {
      position: relative;
      max-width: 48px;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0.8;
    }
    &__picker {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        position: relative;
    }
    &__label {
        background-color: #fff;
        position: relative;
        bottom: 22px;
        padding: 0 5px;
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
