<template lang="pug">
  div.datepicker-wrapper__claendar-icon(v-click-outside="closePickers")
    img.datepicker-wrapper__calendar(src="../assets/images/calendar.png" @click="openPickers")
    .datepicker-wrapper__datepickers(v-if="isDatepickers")
      .datepicker-wrapper__pickers
        <slot></slot>
      .datepicker-wrapper__button
        Button(:value="btnText" @clicked="setDateRange")
</template>
<script>
import Button from "./Button"
import ClickOutside from "vue-click-outside"

export default {
  props: {
    btnText: {
      type: String
    }
  },
  data() {
    return {
      isDatepickers: false,
    };
  },
  methods: {
    openPickers() {
      this.isDatepickers = true
    },
    closePickers() {
      this.isDatepickers = false
    },
    setDateRange () {
      this.closePickers()
      this.$emit('updateFilter')
    }
  },
  directives: {
    ClickOutside
  },
  components: {
    Button,
  }
};
</script>
<style lang="scss" scoped>

.datepicker-wrapper {
  &__claendar-icon {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 5px;
  }

  &__button {
    margin-top: 20px;
    text-align: right;
    margin-right: 20px;
  }

  &__calendar {
    max-width: 20px;
    cursor: pointer;
  }

  &__datepickers {
    z-index: 50;
    background-color: white;
    position: absolute;
    padding: 20px 0 20px 20px;
    box-sizing: border-box;
    //box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
  }

  &__pickers {
    display: flex;
    justify-content: space-between;
  }
}
</style>