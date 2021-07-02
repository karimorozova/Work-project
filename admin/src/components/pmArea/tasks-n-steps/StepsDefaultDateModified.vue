<template lang="pug">
  .steps-date
    .steps-date-wrapperTitle
      .steps-date__header
        .steps-date__title Step {{ stepCounter }} - {{setSteps[0].steps[stepCounter-1].step.title}}

    .steps-date-wrapper
      .steps-date__picker
        .steps-date__input-wrapper
          .steps-date__label Start date:
            span.steps-date__label-red *
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
          .steps-date__label Deadline:
            span.steps-date__label-red *
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

    .steps-date-wrapper
      .steps-date__picker
        .steps-date__input-wrapper
          .steps-date__label Unit:
            span.steps-date__label-red *
          .steps-date__datepicker-wrapper
            .steps-date__input(v-if="tasksData.stepsAndUnits[stepCounter-1]")
              .steps-date__drop-menu
                SelectSingle(
                  :selectedOption="tasksData.stepsAndUnits[stepCounter-1].unit"
                  :options="optionUnits"
                  placeholder="Select"
                  @chooseOption="setUnit"
                )
</template>

<script>
	import Datepicker from "../../DatepickerWithTime"
	import SelectSingle from "@/components/SelectSingle"
	import scrollDrop from "@/mixins/scrollDrop"
	import moment from "moment"
	import { mapActions } from "vuex"

	export default {
		mixins: [ scrollDrop ],
		props: {
			stepCounter: {
				type: Number
			},
			start: {
				type: [ Date, String ]
			},
			deadline: {
				type: [ Date, String ]
			},
			service: {
				type: String,
				default: ''
			},
			workflowId: {
				type: Number
			},
			tasksData: {
				type: Object
			},
			originallyUnits: {
				type: Array
			},
			originallyServices: {
				type: Array
			},
			originallySteps: {
				type: Array
			},
		},
		data() {
			return {
				highlighted: {
					days: [ 6, 0 ]
				},
				disabled: {
					to: moment().add(-1, 'day').endOf('day').toDate()
				},
				isReadonly: false,
				// originallyUnits: null,
				services: null,
				currentUnit: '',
				steps: null
			}
		},
		methods: {
			...mapActions({
				setDataValue: "setTasksDataValue",
				getSteps: "getSteps",
				getServices: "getServices"
			}),
			setUnit({ option }) {
				this.currentUnit = this.originallyUnits.find(item => item.type === option)
				this.sendUnit()
			},
			setParams(option) {
				this.currentUnit = this.originallyUnits.find(item => item.type === option)
				this.sendUnit()
			},
			// async getUnits(){
			//   try {
			//     const result = await this.$http.get("/api/originallyUnits");
			//     this.originallyUnits = result.body.filter(item => item.active);
			//   } catch (err) {
			//     this.alertToggle({
			//       message: "Erorr on getting Units",
			//       isShow: true,
			//       type: "error"
			//     });
			//   }
			// },
			// async getServiceSteps() {
			// 	try {
			// 		const services = await this.$http.get("/api/services")
			// 		const steps = await this.$http.get("/api/steps")
			// 		this.services = services.body
			// 		this.steps = steps.body
			// 	} catch (err) {
			// 		this.alertToggle({
			// 			message: "Erorr on getting Services or Steps",
			// 			isShow: true,
			// 			type: "error"
			// 		})
			// 	}
			// },
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY, HH:mm')
			},
			showStartCalendar() {
				this.$refs.start.showCalendar()
			},
			showDeadlineCalendar() {
				this.$refs.deadline.showCalendar()
			},
			setDate(e, prop) {
				this.$emit("setDate", { date: new Date(e), prop })
			},
			sendUnit() {
				this.$emit('sendUnit', {
					stepCounter: this.stepCounter,
					step: this.setSteps[0].steps[this.stepCounter - 1].step.title,
					unit: this.currentUnit.type
				})
			},
			invalidDateWarn({ message }) {
				console.log(message)
			}
		},
		created() {
			// this.getServiceSteps()
		},
		mounted() {
			// this.getServiceSteps();
			// this.getUnits();
		},
		computed: {
			setSteps() {
				if (this.originallyServices) {
					return this.originallyServices.filter(item => item.title == this.service)
				}
			},
			optionUnits() {
				const currentStep = this.setSteps[0].steps[this.stepCounter - 1].step.title
				return this.originallySteps.filter(item => item.title == currentStep)[0]
						.calculationUnit.map(item => item.type)
			},
			disabledStart() {
				let result = {
					to: moment().add(-1, 'day').endOf('day').toDate()
				}
				if (this.deadline) {
					result = {
						to: moment().add(-1, 'day').endOf('day').toDate(),
						from: moment(this.deadline).add(-1, 'hour').endOf('day').toDate()
					}
				}
				return result
			},
			disabledDeadline() {
				let result = {
					to: moment().add(-1, 'day').endOf('day').toDate()
				}
				if (this.start) {
					result = {
						to: moment(this.start).add(-1, 'day').endOf('day').toDate()
					}
				}
				return result
			}
		},
		components: {
			Datepicker,
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  @import '../../../assets/scss/colors.scss';

  .steps-date {
    background-color: $active-background;
    border: 1px solid #938676;
    margin-top: 40px;
    position: relative;
    border-radius: 4px;
    padding: 10px 15px 5px;

    &__input {
      margin-top: 3px;
    }

    &__drop-menu {
      position: relative;
      width: 220px;
      border-radius: 4px;
      height: 32px;
      background: #fff;
    }

    &__header {
      width: 100%;
      text-align: center;
    }

    &-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    &__datepicker-wrapper {
      position: relative;
    }

    &__input-wrapper {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    &__title {
      position: relative;
      max-width: 100%;
      text-align: center;
      font-size: 18px;
      margin-bottom: 15px;
    }

    &__picker {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      position: relative;
    }

    &__label {

      &-red {
        color: red;
        font-size: 14px;
        margin-right: 15px;
      }
    }

    &__image {
      position: absolute;
      top: 9px;
      right: 5px;
      width: 18px;
      cursor: pointer;
    }
  }

</style>
