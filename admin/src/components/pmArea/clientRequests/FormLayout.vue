<template lang="pug">
  .form
    .form__projectName
      input(type="text" v-model="currentClientRequest.projectName" placeholder="Project Name" @change="changeProjectName(currentClientRequest.projectName)")
      Check(@click="checkProjectName", :isApproved="currentClientRequest.checkedForm.isCheckProjectName")
    .form__projectDeadline
      DatepickerWithTime(
        v-model="currentClientRequest.deadline"
        @selected="(e) => updateProjectDate(e)"
        monday-first=true
        inputClass="datepicker-custom-project-info"
        calendarClass="calendar-custom"
        :format="customFormatter"
        :disabledPicker="false"
        :disabled="disabled"
        ref="deadline"
      )
      Check(@click="checkProjectDeadline", :isApproved="currentClientRequest.checkedForm.isCheckDeadline")
    .form__languages
      .form__languages-source {{currentClientRequest.requestForm.sourceLanguage.lang}}
      .form__languages-target {{currentClientRequest.requestForm.targetLanguages[0].lang}}

</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import DatepickerWithTime from "../../DatepickerWithTime"
	import moment from "moment"
	import Check from "../../Check"

	export default {
		data() {
			return {
				clientRequest: {},
				disabled: {
					to: moment().add(-1, 'day').endOf('day').toDate()
				}
			}
		},
		methods: {
			changeProjectName(name) {
				console.log(name)
			},
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY, HH:mm')
			},
			checkProjectName(data) {
				this.currentClientRequest.checkedForm.isCheckProjectName = data
			},
			checkProjectDeadline(data) {
				this.currentClientRequest.checkedForm.isCheckDeadline = data
			},
			async updateProjectDate(date) {
				console.log(date)
				// if (this.project._id) {
				// 	if (prop === 'deadline' && this.isBilling) {
				// 		const date = { ['billingDate']: e }
				// 		await this.setDate('billingDate', date)
				// 	}
				// 	const date = { [prop]: e }
				// 	await this.setDate(prop, date)
				// } else {
				// 	if (prop === 'deadline' && this.isBilling) {
				// 		this.project.billingDate = e
				// 	}
				// }
			},
			deadlineOpen() {
				this.$refs.deadline.showCalendar()
			}
		},
		computed: {
			...mapGetters({
				currentClientRequest: "getCurrentClientRequest"
			})
		},
		components: {
			Check,
			DatepickerWithTime
		}
	}
</script>

<style scoped lang="scss">
  .form {
    padding: 40px;
  }
</style>
