<template lang="pug">
    .filters-other
        .filters-other__col
            .filters-other__item
                LabelValue(label="Client Name")
                    input.filters-other__text-input(type="text" :v-model="clientName" id="clientName" @keyup="filterByName")
            .filters-other__item
                LabelValue(label="Project Manager")
                    input.filters-other__text-input(type="text" :v-model="projectManager" id="projectManager" @keyup="filterByName")
        .filters-other__col
            .filters-other__date
                LabelValue(label="Start Date and Time")
                    Datepicker(@selected="setStart" :highlighted="highlighted" monday-first=true inputClass="datepicker-height-34" calendarClass="calendar-custom" :format="customFormatter" ref="startDate")
                img.filters-other__calendar-icon(src="../../../assets/images/calendar.png" @click="startOpen")

            .filters-other__item
                LabelValue(label="Target Langs")
                    .filters-other__drop-menu.filters-other_medium-menu
                        LanguagesSelect(
                            :selectedLangs="targetLangs"
                            @chosenLang="({lang}) => addLang({lang}, 'targetFilter')")
        .filters-other__col
            .filters-other__date
                LabelValue(label="Deadline")
                    Datepicker(@selected="setDeadline" :highlighted="highlighted" monday-first=true inputClass="datepicker-height-34" calendarClass="calendar-custom" :format="customFormatter" ref="deadline")
                img.filters-other__calendar-icon(src="../../../assets/images/calendar.png" @click="deadlineOpen")
            
            .filters-other__item
                LabelValue(label="Source Langs")
                    .filters-other__drop-menu.filters-other_medium-menu
                        LanguagesSelect(
                            :selectedLangs="sourceLangs"
                            @chosenLang="({lang}) => addLang({lang}, 'sourceFilter')")
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
    projectManager: { type: String },
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
        e.target.id === "clientName"
          ? vm.$emit("setFilter", { option: value, prop: "clientFilter" })
          : vm.$emit("setFilter", { option: value, prop: "pmFilter" });
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

<style lang="scss" scoped>
.filters-other {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 30px;
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
    width: 25%;
    font-size: 14px;
    height: 80px;
  }
  &__drop-menu {
    position: relative;
    width: 200px;
    height: 32px;
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
    height: 32px;
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
    top: 7px;
    right: 5px;
    width: 20px;
    cursor: pointer;
  }
}
</style>
