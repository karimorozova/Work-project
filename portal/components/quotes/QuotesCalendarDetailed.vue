<template lang="pug">
  .datepickers
    .datepickers__item
        .datepickers__title
            .datepickers__text From
            .datepickers__check
                .datepickers__checkbox(@click="fromAny")
                  .innerCheck(:class="{checkedBox: checked.from}")
                .datepickers__hint Anytime
        .datepickers__picker
            input(type="text" :value="dateFrom" readonly)
            datepicker(wrapperClass="small" monday-first=true :inline="true" :highlighted='state.highlighted' @selected="(date) => setDate(date, 'from')" v-model="datesFilter.from")
    .datepickers__item
        .datepickers__title
            .datepickers__text To
            .datepickers__check
                .datepickers__checkbox(@click="toAny")
                  .innerCheck(:class="{checkedBox: checked.to}")
                .datepickers__hint Anytime
        .datepickers__picker
            input(type="text" :value="dateTo" readonly)
            datepicker(wrapperClass="small" monday-first=true :inline="true" :highlighted='state.highlighted' @selected="(date) => setDate(date, 'to')" v-model="datesFilter.to")
        .datepickers__button
          Button(value="Close" @makeAction="close")
</template>

<script>
import DatePicker from "../Datepicker.vue";
import Button from "../buttons/Button";
import moment from "moment";

export default {
    props: {
        datesFilter: {
            type: Object,
            default: () => {
                return {
                    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
                    to: new Date()
                }
            }
        }
    },
    data() {
        return {
            state: {
                highlighted: {
                    days: [6, 0]
                },
                disabled: {
                    to: moment().add(-1, 'day').endOf('day').toDate()
                }
            },
            currentTo: ''
        }
    },
    methods: {
        close() {
            this.$emit('close')
        },
        setDate(date, prop) {
            this.$emit('setDate', { prop , date })
        },
        fromAny() {
            let from = new Date(1970, 1, 1);
            if(this.checked.from) {
                from = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
            this.$emit('fromAny', { from });
        },
        toAny() {
            this.$emit('toAny', {to: new Date()});
        }
    },
    computed: {
        dateFrom() {
            return moment(this.datesFilter.from).format('MMMM Do YYYY')
        },
        dateTo() {
            return moment(this.datesFilter.to).format('MMMM Do YYYY')      
        },
        checked() {
            let result = {from: false, to: false}
            if(this.datesFilter.from <= new Date(1970, 1, 1)) {
                result.from = true;
            }
            if(this.datesFilter.to >= moment(new Date()).hours(2)) {
                result.to = true
            }
            return result;
        }
    },
    components: {
            datepicker: DatePicker,
            Button
    }
};
</script>


<style lang="scss" scoped>

.datepickers {
  position: absolute;
  top: 30px;
  left: -30%;
  z-index: 5;
  width: 500px;
  display: flex;
  border: 1px solid #67573e;
  padding: 10px;
  font-size: 16px;
  background-color: #fff;
  box-sizing: border-box;
  justify-content: space-between;
  @media screen and (max-width: 1550px) {
    padding: 10px;
  }
  &__title {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    box-sizing: border-box;        
    .datepickers__text {
      color: #67573e;
      font-size: 16px;
      font-weight: bold;
    }
    .datepickers__check {
      display: flex;
      align-items: baseline;
    }
  }
  &__hint {
    font-size: 14px;
  }
  &__button {
    text-align: right;
  }
  &__item {
    flex-direction: column;
    width: 48%;
    box-sizing: border-box;
    @media screen and (max-width: 1550px) {
      margin-right: 9px;
    }
  }
  &__picker {
    margin-bottom: 10px;
    box-sizing: border-box;
    input {
      padding: 4px;
      margin-bottom: 10px;
    }
  }
  &__checkbox {
    border: 0.1px solid #e2dddb;
    height: 20px;
    width: 20px;
    margin-right: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    .innerCheck {
      width: 62%;
      height: 62%;
      background-color: white;
    }
    .checkedBox {
      background-color: #67573e;
    }
  }
}

</style>