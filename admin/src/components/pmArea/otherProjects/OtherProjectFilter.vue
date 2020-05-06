<template lang="pug">
    .filters
        .filters__col
            .filters__item
                LabelValue(label="Client Name")
                    input.filters__text-input(type="text" :value="clientName" @keyup="filterByName")
            .filters__item
                LabelValue(label="Source Langs")
                    .filters__drop-menu.filters_medium-menu
                        LanguagesSelect(
                            :selectedLangs="sourceLangs"
                            @chosenLang="({lang}) => addLang({lang}, 'sourceFilter')")
        .filters__col
            .filters__date
                LabelValue(label="Start Date and Time")
                    Datepicker(@selected="setStart" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" ref="startDate")
                img.filters__calendar-icon(src="../../../assets/images/calendar.png" @click="startOpen")

            .filters__item.filters_flex-end
                LabelValue(label="Target Langs")
                    .filters__drop-menu.filters_medium-menu
                        LanguagesSelect(
                            :selectedLangs="targetLangs"
                            @chosenLang="({lang}) => addLang({lang}, 'targetFilter')")
        .filters__col
            .filters__date
                LabelValue(label="Deadline")
                    Datepicker(@selected="setDeadline" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" ref="deadline")
                img.filters__calendar-icon(src="../../../assets/images/calendar.png" @click="deadlineOpen")
</template>

<script>
import LanguagesSelect from "../../LanguagesSelect";
import Datepicker from "../../Datepicker";
import LabelValue from "../LabelValue";
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    clientName: { type: String },
    sourceLangs: { type: Array, default: [] },
    targetLangs: { type: Array, default: [] }
  },
  data() {
    return {
      highlighted: {
        days: [6, 0]
      },
      doneTypingInterval: 1000
    };
  },
  methods: {
    setStart(event) {
      const date = event;
      date.setHours(0, 0, 0, 0);
      this.$emit("setFilter", { option: date, prop: "startFilter" });
    },
    setDeadline(event) {
      const date = event;
      date.setHours(23, 0, 0, 0);
      this.$emit("setFilter", { option: date, prop: "deadlineFilter" });
    },
    customFormatter(date) {
      return moment(date).format("DD-MM-YYYY, HH:mm");
    },
    startOpen() {
      this.$refs.startDate.showCalendar();
    },
    deadlineOpen() {
      this.$refs.deadline.showCalendar();
    },
    addLang({ lang }, goal) {
      const prop = goal === "sourceFilter" ? "sourceLangs" : "targetLangs";
      const position = this[prop].indexOf(lang.symbol);
      if (position !== -1) {
        this.$emit("removeLangFilter", { from: goal, position });
      } else {
        this.$emit("addLangFilter", { to: goal, lang });
      }
    },
    filterByName(e) {
      const { value } = e.target;
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(doneTyping, this.doneTypingInterval);
      const vm = this;
      function doneTyping() {
        vm.$emit("setFilter", { option: value, prop: "clientFilter" });
      }
    }
  },
  components: {
    LanguagesSelect,
    Datepicker,
    LabelValue
  }
};
</script>

<style lang="scss">
.filters {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 20px;
  &__itemCenter {
    display: flex;
    justify-content: center;
    &-button {
      background-image: url("../../../assets/images/refresh-icon.png");
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
    border: 1px solid #68573e;
    border-radius: 5px;
    color: #68573e;
    transition: all 0.2s;
    &:focus {
      box-shadow: 0 0 3px #68573e;
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
