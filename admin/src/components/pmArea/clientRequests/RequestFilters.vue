<template lang="pug">
  .filters
    .filters__row
      .filters__item(v-if="projectsType !== 'requests'")
        //LabelValue(label="Status")
        label.filters__filter-title Status:
        .filters__drop-menu.filters__input
          SelectSingle(
            :selectedOption="status"
            :options="statuses"
            placeholder="Select"
            @chooseOption="(e) => setValue(e, 'statusFilter')"
            :projectsType="projectsType"
          )

      .filters__item(v-else)
        //LabelValue(label="Sales Manager")
        label.filters__filter-title Sales Manager:
        .filters__drop-menu.filters_short-menu
          SelectSingle(
            :selectedOption="salesFilter"
            :options="salesNames"
            placeholder="Name"
            @chooseOption="(e) => setValue(e, 'salesFilter')"
          )

      .filters__item
        //LabelValue(:label="projectsType === 'requests' ? 'Assigned To' : 'Project Manager'")
        label.filters__filter-title {{ projectsType === 'requests' ? 'Assigned To' : 'Project Manager' }}:
        .filters__drop-menu(:class="projectsType === 'requests' ? 'filters_medium-menu' : 'filters_short-menu'")
          SelectSingle(
            :selectedOption="pmFilter"
            :options="pmNames"
            placeholder="Name"
            @chooseOption="(e) => setValue(e, 'pmFilter')"
          )

      .filters__item
        //LabelValue(label="Client Name")

        label.filters__filter-title Client Name:
        input.filters__text-input(type="text" :value="clientName" @keyup="filterByName")
      .filters__item
        //LabelValue(label="Source Langs")
        label.filters__filter-title Source Langs:

        .filters__drop-menu.filters_medium-menu
          LanguagesSelect(
            :selectedLangs="sourceLangs.map(({symbol}) => symbol)"
            @chosenLang="(lang) => addLang(lang, 'sourceFilter')"
          )
      .filters__item.filters_flex-end
        //LabelValue(label="Target Langs")

        label.filters__filter-title Target Langs:
        .filters__drop-menu.filters_medium-menu
          LanguagesSelect(
            :selectedLangs="targetLangs.map(({symbol}) => symbol)"
            @chosenLang="(lang) => addLang(lang, 'targetFilter')"
          )

    .filters__row
      .filters__date
        //LabelValue(label="Start Date and Time")
        label.filters__filter-title Start Date and Time:

        datepicker-with-time(@selected="setStart" :isTime="false" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom-filter" calendarClass="calendar-custom" :format="customFormatter" ref="startDate")
        span.calendar-wrapper( @click="startOpen")
          i.calendar.far.fa-calendar-alt
        //img.filters__calendar-icon(src="../../assets/images/calendar.png" @click="startOpen")

      .filters__date
        //LabelValue(label="Deadline")
        label.filters__filter-title Deadline:

        datepicker-with-time(@selected="setDeadline" :isTime="false" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom-filter" calendarClass="calendar-custom" :format="customFormatter" ref="deadline")
        span.calendar-wrapper(@click="deadlineOpen")
          i.calendar.far.fa-calendar-alt
        //img.filters__calendar-icon(src="../../assets/images/calendar.png" @click="deadlineOpen")
      //.filters__itemLeft
        .filters__itemLeft-button(@click="refreshProjects")
</template>

<script>
	import SelectSingle from "../../SelectSingle"
	import SelectMulti from "../../SelectMulti"
	import LanguagesSelect from "../../LanguagesSelect"
	import Datepicker from "../../Datepicker"
	import LabelValue from "../LabelValue"
	import moment from "moment"
	import { mapGetters, mapActions } from "vuex"
  import DatepickerWithTime from "../../DatepickerWithTime";

	export default {
		props: {
			status: { type: String },
			pmFilter: { type: String },
			salesFilter: { type: String },
			clientName: { type: String },
			sourceLangs: { type: Array },
			targetLangs: { type: Array },
			projectManagers: { type: Array },
			salesManagers: { type: Array },
			projectsType: { type: String },
			statuses: { type: Array }
		},
		data() {
			return {
				disabled: {
					to: moment().add(-1, 'day').endOf('day').toDate()
				},
				highlighted: {
					days: [ 6, 0 ]
				},
				typingTimer: "",
				doneTypingInterval: 800
			}
		},
		methods: {
			refreshProjects() {
				this.$emit('refreshProjects')
			},
			setStart(event) {
				const date = event
				date.setHours(0, 0, 0, 0)
				this.$emit("setFilter", { option: date, prop: 'startFilter' })
			},
			setDeadline(event) {
				const date = event
				date.setHours(23, 0, 0, 0)
				this.$emit("setFilter", { option: date, prop: 'deadlineFilter' })
			},
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY, HH:mm')
			},
			setValue({ option, index }, prop) {
				this.$emit('setFilter', { option, index, prop })
			},
			startOpen() {
				this.$refs.startDate.showCalendar()
			},
			deadlineOpen() {
				this.$refs.deadline.showCalendar()
			},
			addLang({ lang }, goal) {
				const prop = goal === 'sourceFilter' ? 'sourceLangs' : 'targetLangs'
				const position = this[prop].findIndex(({symbol}) => symbol === lang.symbol)
				if (position !== -1) {
					this.$emit('removeLangFilter', { from: goal, position })
				} else {
					this.$emit('addLangFilter', { to: goal, lang })
				}
			},
			setClientName(event) {
				let option = event.target.value
				this.$emit('setFilter', { option, prop: 'clientFilter' })
			},
			filterByName(e) {
				const { value } = e.target
				clearTimeout(this.typingTimer)
				this.typingTimer = setTimeout(doneTyping, this.doneTypingInterval)
				const vm = this

				function doneTyping() {
					vm.$emit('setFilter', { option: value, prop: 'clientFilter' })
				}
			}
		},
		computed: {
			...mapGetters({
				languages: "getAllLanguages"
			}),
			languageNames() {
				return this.languages.map(item => {
					return item.lang
				})
			},
			pmNames() {
				const fullNames = this.projectManagers.map(item => {
					return item.firstName + " " + item.lastName
				})
				return [ 'All', ...fullNames ]
			},
			salesNames() {
				const fullNames = this.salesManagers.map(item => {
					return item.firstName + " " + item.lastName
				})
				return [ 'All', ...fullNames ]
			}
		},
		mounted() {
			if (this.projectsType === 'requests') {
				this.statuses = [ "Requested" ]
			}
		},
		components: {
      DatepickerWithTime,
			SelectSingle,
			SelectMulti,
			LanguagesSelect,
			Datepicker,
			LabelValue
		}
	}
</script>


<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.filters {
  width: 100%;
  //display: flex;

  &__row{
    display: flex;
    margin-bottom: 20px;
    height: 50px;
    align-items: flex-end;
  }

  &__input {
    width: 191px;
  }

  &__date {
    position: relative;
    width: 232px;
  }

    &__text-input {
      padding: 0 5px;
      width: 179px;
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

  &__filter-title {
    margin-bottom: 3px;
  }

  &__itemButton{
    position: relative;
    display: grid;
    align-items: end;
    width: 232px;
    justify-content: end;
  }

  &__item {
    position: relative;
    display: grid;
    align-items: end;
    width: 232px;

    ::-webkit-input-placeholder {
      opacity: 0.5;
    }
  }

  &__input-field {
    box-sizing: border-box;
    color: $main-color;
    width: 191px;
    height: 30px !important;
    padding-left: 5px;
    border: 1px solid $main-color;
    border-radius: 5px;
    outline: none;
    font-size: 14px;
  }

  &__drop-menu {
    position: relative;
    width: 191px;
    height: 30px;
    box-sizing: border-box;
    z-index: 10;
  }

  .calendar {
    cursor: pointer;
  }

  .calendar-wrapper {
    position: absolute;
    right: 50px;
    bottom: 5px;
    font-size: 18px;
  }
}

  //.filters {
  //  display: flex;
  //  width: 100%;
  //  justify-content: space-between;
  //  margin-bottom: 20px;
  //
  //  &__itemLeft {
  //    display: flex;
  //    justify-content: flex-end;
  //
  //    &-button {
  //      background-image: url('../../assets/images/refresh-icon.png');
  //      width: 24px;
  //      height: 20px;
  //      cursor: pointer;
  //    }
  //  }
  //
  //  &__itemCenter {
  //    display: flex;
  //    justify-content: space-between;
  //
  //
  //  }
  //
  //  &__row {
  //    display: flex;
  //    flex-direction: column;
  //    justify-content: space-between;
  //    width: 24%;
  //    height: 80px;
  //  }
  //
  //  &__drop-menu {
  //    position: relative;
  //    width: 166px;
  //    height: 30px;
  //  }
  //
  //  &_medium-menu {
  //    width: 166px;
  //  }
  //
  //  &_short-menu {
  //    width: 166px;
  //  }
  //
  //  &__text-input {
  //    padding: 0 5px;
  //    width: 154px;
  //    height: 30px;
  //    outline: none;
  //    border: 1px solid #68573E;
  //    border-radius: 5px;
  //    color: #68573E;
  //    transition: all 0.2s;
  //
  //    &:focus {
  //      box-shadow: 0 0 3px #68573E;
  //    }
  //  }
  //
  //  &__date {
  //    position: relative;
  //  }
  //
  //  &__calendar-icon {
  //    position: absolute;
  //    top: 5px;
  //    right: 5px;
  //    width: 18px;
  //    cursor: pointer;
  //  }
  //}

  .left {

  }
</style>
