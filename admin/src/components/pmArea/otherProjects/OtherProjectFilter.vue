<template lang="pug">
  .other-project__filter
    .filters-other
      .filters-other__col
        .filters-other__item
          LabelValue(label="Project ID")
            input.filters-other__text-input(type="text" id="clientId" @keyup="filterById")
        .filters-other__item
          LabelValue(label="Client Name")
            input.filters-other__text-input(type="text" :v-model="clientName" id="clientName" @keyup="filterByName")

      .filters-other__col
        .filters-other__date
          LabelValue(label="Start Date and Time")
            Datepicker(@selected="setStart" :highlighted="highlighted" monday-first=true inputClass="datepicker-height-30" calendarClass="calendar-custom" :format="customFormatter" ref="startDate")
          img.filters-other__calendar-icon(src="../../../assets/images/calendar.png" @click="startOpen")
        .filters-other__item
          //LabelValue(label="Target Langs")
            //.filters-other__drop-menu.filters-other_medium-menu
              //LanguagesSelect(
                //:selectedLangs="targetLangs"
                //@chosenLang="({lang}) => addLang({lang}, 'targetFilter')")

      .filters-other__col
        .filters-other__date
          LabelValue(label="Deadline")
            Datepicker(@selected="setDeadline" :highlighted="highlighted" monday-first=true inputClass="datepicker-height-30" calendarClass="calendar-custom" :format="customFormatter" ref="deadline")
          img.filters-other__calendar-icon(src="../../../assets/images/calendar.png" @click="deadlineOpen")
        .filters-other__item
          //LabelValue(label="Source Langs")
            //.filters-other__drop-menu.filters-other_medium-menu
              //LanguagesSelect(
                //:selectedLangs="sourceLangs"
                //@chosenLang="({lang}) => addLang({lang}, 'sourceFilter')")

      .filters-other__col
        .filters-other__item
          LabelValue(label="Project Manager")
            input.filters-other__text-input(type="text" :v-model="projectManager" id="projectManager" @keyup="filterByName")

    .button
      .button__row
        .button__body
          input.button__update-btn(type="submit" :value="detectedStatusForButton(this.$route.query.status)" @click="getXTRFProjects()")

        //.button__body
          input.button__update-btn(type="submit" value="Update XTRF Projects statuses" @click="parseMessages()")

</template>

<script>
	import Datepicker from "../../Datepicker"
	import LabelValue from "../LabelValue"
	import moment from "moment"
	import Button from "../../Button"
	import { mapActions } from "vuex"

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
					days: [ 6, 0 ]
				},
				doneTypingInterval: 1000,
				isUpload: true
			}
		},
		methods: {
			...mapActions([ 'alertToggle' ]),

			detectedStatusForButton(status) {
				switch (status) {
					case 'In-progress':
						return 'Update the financial part XTRF Open Projects'
					case 'Quote':
						return 'Update the financial part XTRF Quotes'
					case 'Closed':
						return 'Update the financial part XTRF Closed Projects'
				}
			},
			async getXTRFProjects() {
				try {
					const result = await this.$http.get(`/memoqapi/update-all-memoq-finance/${ this.$route.query.status }`)
					this.$emit('refreshProjects', result.data)
				} catch (err) {
					this.alertToggle({
						message: 'Server Error / Cannot update Project',
						isShow: true,
						type: 'error'
					})
				} finally {
					this.alertToggle({
						message: 'Projects updated',
						isShow: true,
						type: 'success'
					})
				}
			},
			async parseMessages() {
				try {
					const result = await this.$http.get(`/memoqapi/update-project-statuses-from-messages/${ this.$route.query.status }`)
					this.$emit('refreshProjects', result.data)
				} catch (err) {
					this.alertToggle({
						message: 'Server Error / Cannot parse messages',
						isShow: true,
						type: 'error'
					})
				} finally {
					this.alertToggle({
						message: 'Projects updated',
						isShow: true,
						type: 'success'
					})
				}
			},
			setStart(event) {
				const date = event
				date.setHours(0, 0, 0, 0)
				this.$emit('setFilter', { option: date, prop: 'startFilter' })
			},
			setDeadline(event) {
				const date = event
				date.setHours(23, 0, 0, 0)
				this.$emit('setFilter', { option: date, prop: 'deadlineFilter' })
			},
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY, HH:mm')
			},
			startOpen() {
				this.$refs.startDate.showCalendar()
			},
			deadlineOpen() {
				this.$refs.deadline.showCalendar()
			},
			addLang({ lang }, goal) {
				const prop = goal === "sourceFilter" ? "sourceLangs" : "targetLangs"
				const position = this[prop].indexOf(lang.symbol)
				if (position !== -1) {
					this.$emit("removeLangFilter", { from: goal, position })
				} else {
					this.$emit("addLangFilter", { to: goal, lang })
				}
			},
			filterById(e) {
				const { value } = e.target
				clearTimeout(this.typingTimer)
				this.typingTimer = setTimeout(doneTyping, this.doneTypingInterval)
				const vm = this

				function doneTyping() {
					vm.$emit("setFilter", { option: value, prop: "idFilter" })
				}
			},
			filterByName(e) {
				const { value } = e.target
				clearTimeout(this.typingTimer)
				this.typingTimer = setTimeout(doneTyping, this.doneTypingInterval)
				const vm = this

				function doneTyping() {
					e.target.id === "clientName"
							? vm.$emit("setFilter", { option: value, prop: "clientFilter" })
							: vm.$emit("setFilter", { option: value, prop: "pmFilter" })
				}
			}
		},
		components: {
			Button,
			Datepicker,
			LabelValue
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .button {
    &__row {
      display: flex;
      margin-bottom: 20px;
    }

    &__body {
      margin-right: 20px;
    }

    &__wait {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__text {
      line-height: 32px;
    }

    &__update-btn {
      width: auto;
      padding: 0 15px;
      height: 32px;
      color: white;
      font-size: 14px;
      border-radius: 4px;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .12), 0 1px 5px 0 rgba(0, 0, 0, .2);
      background-color: #D15F45;
      border: none;
      transition: .1s ease;
      outline: none;

      &:hover {
        cursor: pointer;
        box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.14), 0 1px 7px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -1px rgba(0, 0, 0, 0.2);
      }

      &:active {
        transform: scale(.98);
      }
    }
  }

  .filters-other {
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
      width: 24%;
      height: 80px;
    }

    &__drop-menu {
      position: relative;
      width: 220px;
      height: 32px;
    }

    &_medium-menu {
      width: 166px;
    }

    &_short-menu {
      width: 166px;
    }

    &__text-input {
      padding: 0 5px;
      width: 154px;
      height: 30px;
      outline: none;
      border: 1px solid $border;
      border-radius: 4px;
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
      top: 6px;
      right: 5px;
      width: 18px;
      cursor: pointer;
    }
  }

  .lds-ring {
    display: inline-block;
    position: relative;
  }

  .lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 20px;
    height: 20px;
    margin-top: -9px;
    margin-left: 12px;
    border: 3px solid #fff;
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #fff transparent transparent transparent;
  }

  .lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
  }

  .lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
  }

  .lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
  }

  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }


</style>
