<template lang="pug">
  .filters
    .filters__row
      .filters__item
        label.filters__filter-title Project Id:
        input.filters__text-input(type="text" id="clientId" @keyup="filterById")

      .filters__item
        label.filters__filter-title Project Name:
        input.filters__text-input(type="text" :value="clientName" @keyup="filterByProjectName")

      //.filters__item
        //label.filters__filter-title Status:
        //.filters__drop-menu.filters__input
          //SelectSingle(
            //:selectedOption="status"
            //:options="statuses"
            //placeholder="Select"
            //@chooseOption="(e) => setValue(e, 'statusFilter')"
            //:projectsType="projectsType"
          //)

      //.filters__item(v-else)
        //label.filters__filter-title Sales Manager:
        //.filters__drop-menu.filters_short-menu
         // SelectSingle(
            //:selectedOption="salesFilter"
            //:options="salesNames"
            //placeholder="Name"
            //@chooseOption="(e) => setValue(e, 'salesFilter')"
          //)

      .filters__item
        label.filters__filter-title {{ projectsType === 'requests' ? 'Assigned To' : 'Project Manager' }}:
        .filters__drop-menu(:class="projectsType === 'requests' ? 'filters_medium-menu' : 'filters_short-menu'")
          SelectSingle(
            :selectedOption="pmFilter"
            :options="pmNames"
            placeholder="Name"
            @chooseOption="(e) => setValue(e, 'pmFilter')"
          )

      .filters__item
        label.filters__filter-title Client Name:
        input.filters__text-input(type="text" :value="clientName" @keyup="filterByName")

      //.filters__item
        //LabelValue(label="Source Langs")
        //label.filters__filter-title Source Langs:

        //.filters__drop-menu.filters_medium-menu
          //LanguagesSelect(
            //:selectedLangs="sourceLangs"
            //@chosenLang="({lang}) => addLang({lang}, 'sourceFilter')"
          //)
      //.filters__item.filters_flex-end
        //LabelValue(label="Target Langs")

        //label.filters__filter-title Target Langs:
        //.filters__drop-menu.filters_medium-menu
          //LanguagesSelect(
            //:selectedLangs="targetLangs"
            //@chosenLang="({lang}) => addLang({lang}, 'targetFilter')"
          //)


    .filters__row
      .filters__date
        label.filters__filter-title Start Date and Time:
        datepicker-with-time(@selected="setStart" :isTime="false" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom-filter" calendarClass="calendar-custom" :format="customFormatter" ref="startDate")
        span.calendar-wrapper( @click="startOpen")
          i.calendar.far.fa-calendar-alt

      .filters__date
        label.filters__filter-title Deadline:
        datepicker-with-time(@selected="setDeadline" :isTime="false" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom-filter" calendarClass="calendar-custom" :format="customFormatter" ref="deadline")
        span.calendar-wrapper( @click="deadlineOpen")
          i.calendar.far.fa-calendar-alt
      //.filters__itemLeft
        .filters__itemLeft-button(@click="refreshProjects")
</template>

<script>
	import SelectSingle from "../SelectSingle"
	import SelectMulti from "../SelectMulti"
	import Datepicker from "../Datepicker"
	import LabelValue from "./LabelValue"
	import moment from "moment"
	import { mapGetters, mapActions } from "vuex"
	import DatepickerWithTime from "../DatepickerWithTime"

	export default {
		props: {
			pmFilter: { type: String },
			salesFilter: { type: String },
			clientName: { type: String },
			sourceLangs: { type: Array },
			targetLangs: { type: Array },
			projectManagers: { type: Array },
			salesManagers: { type: Array },
			projectsType: { type: String }
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
			filterById(e) {
				const { value } = e.target
				clearTimeout(this.typingTimer)
				this.typingTimer = setTimeout(doneTyping, this.doneTypingInterval)
				const vm = this

				function doneTyping() {
					vm.$emit("setFilter", { option: value, prop: "idFilter" })
				}
			},
			filterByProjectName(e) {
				const { value } = e.target
				clearTimeout(this.typingTimer)
				this.typingTimer = setTimeout(doneTyping, this.doneTypingInterval)
				const vm = this

				function doneTyping() {
					vm.$emit('setFilter', { option: value, prop: 'projectFilter' })
				}
			},
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
				const position = this[prop].indexOf(lang.symbol)
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
			// if (this.projectsType === 'requests') {
			// 	this.statuses = [ "Requested" ]
			// }
		},
		components: {
			DatepickerWithTime,
			SelectSingle,
			SelectMulti,
			Datepicker,
			LabelValue
		}
	}
</script>


<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .filters {
    width: 100%;

    &__row {
      display: flex;
      margin-bottom: 20px;
      height: 50px;
      align-items: flex-end;
    }

    &__input {
      width: 200px;
    }

    &__date {
      position: relative;
      width: 250px;
    }

    &__text-input {
      font-size: 14px;
      color: $text;
      border: 1px solid $border;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 0 7px;
      outline: none;
      width: 220px;
      height: 32px;
      transition: .1s ease-out;

      &:focus {
        border: 1px solid $border-focus;
      }
    }

    &__filter-title {
      margin-bottom: 3px;
    }

    &__itemButton {
      position: relative;
      display: grid;
      align-items: end;
      width: 250px;
      justify-content: end;
    }

    &__item {
      position: relative;
      display: grid;
      align-items: end;
      width: 250px;

      ::-webkit-input-placeholder {
        opacity: 0.5;
      }
    }

    &__input-field {
      font-size: 14px;
      color: $text;
      border: 1px solid $border;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 0 7px;
      outline: none;
      width: 220px;
      height: 32px;
      transition: .1s ease-out;

      &:focus {
        border: 1px solid $border-focus;
      }
    }

    &__drop-menu {
      position: relative;
      width: 220px;
      height: 32px;
      box-sizing: border-box;
      z-index: 10;
    }

    .calendar {
      cursor: pointer;
    }

    .calendar-wrapper {
      position: absolute;
      right: 38px;
      bottom: 5px;
      font-size: 18px;
    }
  }
</style>
