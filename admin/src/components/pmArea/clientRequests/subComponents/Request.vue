<template lang="pug">
  .project
    .project__all-info
      .project__info-row
        span.project__nameBody
          input.project__name(type="text" v-model="project.projectName" @change="changeProjectName(project.projectName)" placeholder="Project Name" :disabled="!canUpdateRequest")

      .project__info-row
        .project__date
          .input-title
            .input-title__text Start Date & Time:
            span.require *
          DatepickerWithTime(
            v-model="project.startDate"
            @selected="(e) => updateProjectDate(e, 'startDate')"
            :highlighted="highlighted"
            monday-first=true
            inputClass="datepicker-custom-project-info"
            calendarClass="calendar-custom"
            :format="customFormatter"
            :disabled="disabled"
            ref="start"
            :disabledPicker="disabledPicker && isProjectFinished || !canUpdateRequest"
          )
          .project__calendar-icon( @click="startOpen")
            i.far.fa-calendar-alt

        .project__date
          .input-title
            .input-title__text Deadline:
            span.require *
          DatepickerWithTime(
            v-model="project.deadline"
            @selected="(e) => updateProjectDate(e, 'deadline')"
            monday-first=true
            inputClass="datepicker-custom-project-info"
            calendarClass="calendar-custom"
            :format="customFormatter"
            :disabledPicker="isBilling && isProjectFinished || !canUpdateRequest"
            :disabled="disabled"
            ref="deadline"
          )
          .project__calendar-icon( @click="deadlineOpen")
            i.far.fa-calendar-alt

        .project__date
          .input-title
            .input-title__text Billing Date:
          DatepickerWithTime(
            v-model="project.billingDate"
            ref="billingDate"
            @selected="(e) => updateProjectDate(e, 'billingDate')"
            monday-first=true
            inputClass="datepicker-custom-project-info"
            calendarClass="calendar-custom"
            :format="customFormatter"
            :disabledPicker="isBilling || isProjectFinished || !canUpdateRequest"
            :disabled="disabled"
          )
          .project__calendar-icon( @click="billingOpen")
            i.far.fa-calendar-alt

        .project__same.checkbox
          input(type="checkbox" id="same" :disabled="isProjectFinished || !canUpdateRequest" :checked="isBilling" @change="setSameDate")
          label(for="same") As deadline

      .project__info-row
        .project__client
          .input-title
            .input-title__text Client Name:
            span.require *
          .project__input-icons(v-if="project._id")
            i.fas.fa-external-link-alt.icon-link(aria-hidden='true' @click="goToClientInfo")
            input.project__input-text2.project__input-client(@click="goToClientInfo" type="text" :value="project.customer.name" readonly :disabled="!canUpdateRequest")

        .project__industry
          .input-title
            .input-title__text Industry:
            span.require *
          input.project__input-text(type="text" :value="project.industry.name" :disabled="true")

        .project__number
          .input-title
            .input-title__text Billing Information:
            span.require *
          .project__drop-menu
            SelectSingle(
              :selectedOption="(project.clientBillingInfo && project.clientBillingInfo.officialName) || ''"
              :options="billingInfoList.map(({officialName}) => officialName)"
              @chooseOption="choseBillingInfo"
              placeholder="Option"
            )

        .project__same.checkbox

      .project__info-row.project_no-margin
        .project__textarea
          LabelValue(label="Project Brief" customClass="project_textarea")
            textarea.project__text(type="text" rows="9" v-model="project.brief" @change="updateBrief")
        .project__textarea
          LabelValue(label="Internal Notes" customClass="project_textarea")
            textarea.project__text(type="text" rows="9" v-model="project.notes" @change="updateNotes")

      .project__button(v-if="!project.projectId")
        Button(
          is-disabled="!canUpdateRequest"
          value="Approve Project"
          @clicked="checkForErrors"
        )
      ValidationErrors(
        v-if="areErrorsExist"
        :errors="errors"
        :isAbsolute="true"
        @closeErrors="closeErrors"
      )
</template>

<script>
	import SelectSingle from "../../../SelectSingle"
	import SelectMulti from "../../../SelectMulti"
	import ValidationErrors from "../../../ValidationErrors"
	import Datepicker from "../../../Datepicker"
	import LabelValue from "./../../LabelValue"
	import Button from "../../../Button"
	import moment from "moment"
	import { mapGetters, mapActions } from "vuex"
	import DatepickerWithTime from "../../../DatepickerWithTime"

	export default {
		props: {
			project: {
				type: Object
			}
		},
		data() {
			return {
				isBilling: false,
				isTest: false,
				selectedIndustry: "",
				disabled: {
					to: moment().add(-1, 'day').endOf('day').toDate()
				},
				highlighted: {
					days: [ 6, 0 ]
				},
				startDate: new Date(),
				deadline: "",
				billingDate: "",
				isSearchClient: true,
				isRequiredField: true,
				errors: [],
				areErrorsExist: false,
				clients: [],
				managers: []
			}
		},
		methods: {
			...mapActions([
				"alertToggle",
				"setProjectDate",
				"setCurrentProject",
				"updateClientsRequestsProps"
			]),
			async choseBillingInfo({ option }) {
				const billingInfo = this.billingInfoList.find(({ officialName }) => officialName === option)
				await this.setRequestProp({ prop: 'clientBillingInfo', value: billingInfo })
				await this.setRequestProp({ prop: 'paymentProfile', value: billingInfo.paymentType })
			},
			async updateBrief(e) {
				const { value } = e.target
				await this.setRequestProp({ prop: 'brief', value })
			},
			async updateNotes(e) {
				const { value } = e.target
				await this.setRequestProp({ prop: 'notes', value })
			},

			async changeProjectName(projectName) {
				this.errors = []
				if (!this.project.projectName) this.errors.push("Please, enter valid Project name.")
				if (this.errors.length) {
					this.areErrorsExist = true
					return
				}
				if (!this.errors.length) {
					await this.setRequestProp({ prop: 'projectName', value: projectName })
				}
			},
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY, HH:mm')
			},
			async updateProjectDate(e, prop) {
				if (prop === 'deadline' && this.isBilling) {
					const date = { ['billingDate']: e }
					await this.setDate('billingDate', date)
				}
				const date = { [prop]: e }
				await this.setDate(prop, date)
			},
			async setDate(prop, date) {
				if (prop === 'startDate' && this.project.tasks.length) return
				await this.updateClientsRequestsProps({ projectId: this.project._id, value: date })
			},
			async setTest(e) {
				if (!this.project._id) {
					this.isTest = e.target.checked
				} else {
					await this.updateClientsRequestsProps({ projectId: this.project._id, value: { 'isTest': e.target.checked } })
				}
			},
			async setSameDate(e) {
				this.isBilling = e.target.checked
				e.target.checked ?
						this.updateProjectDate(this.$refs.deadline.value, 'billingDate') :
						this.updateProjectDate(this.$refs.billingDate.value, 'billingDate')
			},
			async setRequestProp({ prop, value }) {
				try {
					await this.updateClientsRequestsProps({ projectId: this.project._id, value: { [prop]: value } })
					this.alertToggle({ message: "Project updated", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Server Error / Cannot update Project", isShow: true, type: "error" })
				}
			},
			setValue({ option }, prop) {
				this.$emit('setValue', { option, prop })
				if (prop === 'customer' && option.industries.length === 1) {
					this.selectedIndustry = option.industries[0]
				}
			},
			closeErrors() {
				this.areErrorsExist = false
			},
			async checkForErrors() {
				this.errors = []
				if (!this.project.projectName) {
					this.errors.push("Please, enter valid Project name.")
					this.project.projectName = this.project.projectName.replace(/( *[^\w\s\.]+ *)+/g, ' ').trim().replace(/^\d+( ?\d*)*/g, '')
				}
				if (!this.project.startDate) this.errors.push("Please, set the start date.")
				if (!this.project.deadline) this.errors.push("Please, set the deadline date.")
				if (!this.project.customer.name) this.errors.push("Please, select a Client.")
				if (!this.selectedIndustry) this.errors.push("Please, choose an industry.")
				if (this.errors.length) {
					this.areErrorsExist = true
					return
				}
				try {
					await this.createProject()
					await this.clientCreateProjectDate()
				} catch (err) {
					this.alertToggle({ message: "Server error on creating a new Project", isShow: true, type: "error" })
				}
			},
			async clientCreateProjectDate() {
				const formatDate = moment(new Date().getTime()).format('DD-MM-YYYY')
				await this.$http.post('/clientsapi/client-project-date', {
					date: formatDate,
					clientId: this.project.customer
				})
			},
			async createProject() {
				this.project.dateFormatted = moment(this.project.startDate).format('YYYY MM DD')
				this.project.industry = this.selectedIndustry._id
				const customer = { ...this.project.customer }
				this.project.customer = customer._id
				this.project.isTest = this.isTest
				try {
					const newProject = await this.$http.post("/pm-manage/new-project", { project: this.project, user: this.user })
					this.$emit('projectCreated', { project: newProject.data, customer: customer })
					this.alertToggle({ message: "New Project has been created", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Server error on creating a new Project", isShow: true, type: "error" })
				}
			},
			startOpen() {
				this.$refs.start.showCalendar()
			},
			deadlineOpen() {
				this.$refs.deadline.showCalendar()
			},
			billingOpen() {
				this.$refs.billingDate.showCalendar()
			},
			goToClientInfo() {
				const route = this.$router.resolve({ path: `/pangea-clients/all/details/${ this.project.customer._id }` })
				window.open(route.href, "_blank")
			},
			isBillingDate() {
				if (this.project.deadline === "") {
					this.isBilling = false
				} else {
					this.isBilling = this.project.deadline === this.project.billingDate
				}
			},
			async setDefaultClientBI() {
				if (this.billingInfoList.length === 1) {
					const [ billingInfo ] = this.billingInfoList
					await this.setRequestProp({ prop: 'clientBillingInfo', value: billingInfo })
					await this.setRequestProp({ prop: 'paymentProfile', value: billingInfo.paymentType })
				}
			}
		},
		computed: {
			...mapGetters({
				industries: "getAllIndustries",
				user: "getUser"
			}),
			billingInfoList() {
				if (this.project.customer.billingInfo && this.project.customer.billingInfo.length) {
					const billingInfo = this.project.customer.billingInfo
					return billingInfo.map(({ _id, officialName, paymentType }) => ({ _id, officialName, paymentType }))
				}
				return []
			},
			existProjectAccessChangeName() {
				if (this.project) {
					const { status } = this.project
					return status === 'Draft' || status === 'Quote sent'
				}
			},
			industriesList() {
				let result = []
				if (this.project.customer.name) {
					const projectIndustries = this.project.customer.industries
					if (projectIndustries[0].name) {
						return result = projectIndustries
					}
					return result = this.industries.filter(item => projectIndustries.indexOf(item._id) !== -1)
				}
				return result
			},
			nameOfProject() {
				return this.project.isUrgent ? this.project.projectName + " URGENT" : this.project.projectName
			},
			disabledPicker() {
				return !!(this.project._id && this.project.tasks && this.project.tasks.length)
			},
			isProjectFinished() {
				const { status } = this.project
				return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
			},
			canUpdateRequest() {
				return this.user.group.name === "Administrators"
						|| this.user.group.name === "Developers"
						|| this.project.projectManager._id === this.user._id
			}
		},
		components: {
			DatepickerWithTime,
			SelectSingle,
			SelectMulti,
			Datepicker,
			LabelValue,
			Button,
			ValidationErrors
		},
		mounted() {
			this.isBillingDate()
			this.setDefaultClientBI()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors";

  .input-title {
    display: flex;

    &__text {
      margin-bottom: 3px;
    }

    .require {
      color: $red;
      padding-left: 2px;
    }
  }

  .hide-elem {
    width: 170px;
  }

  .project {
    display: flex;
    flex-direction: column;
    width: 1000px;

    &__nameDisabled {
      display: flex;
      font-family: Myriad600;
      align-items: center;
      cursor: default;
      font-size: 21px;
      height: 38px;
      width: 459px;
      color: #68573e;
      border: 1px solid white;
    }

    &__input-icons {
      position: relative;

      .icon-link {
        position: absolute;
        right: 6px;
        top: 8px;
        font-size: 16px;
        cursor: pointer;
      }
    }

    &__same {
      width: 120px;
    }

    &__project-template {
      position: relative;
      margin-bottom: 60px;
    }

    &__all-info {
      padding: 20px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      position: relative;
      background: white;
      border-radius: 4px;
    }

    &__info-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      ::-webkit-input-placeholder {
        color: #68573E;
        opacity: 0.4;
      }
    }

    &__nameBody {
      width: 100%;
      margin-bottom: 10px;
    }

    &__name {
      font-size: 20px;
      padding: 0 5px;
      height: 42px;
      width: 488px;
      border-radius: 4px;
      color: #68573E;
      border: 1px solid $border;
      outline: none;
      color: $text;
      transition: .1s ease-out;

      &:focus {
        border: 1px solid $border-focus;
      }
    }

    &__date {
      position: relative;
    }

    &__client, &__industry, &__number {
      width: 220px;
    }

    &__drop-menu {
      position: relative;
      height: 32px;
    }

    &__client-link {
      display: flex;
      justify-content: flex-start;
    }

    &__link {
      border-bottom: 1px solid #c1bbb1;
      cursor: pointer;
    }

    &__input-client {
      cursor: pointer;
    }

    &__input-text {
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

    &__input-text2 {
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

    &__textarea {
      width: 471px;
    }

    &__text {
      width: 100%;
      margin-top: 4px;
      border-radius: 4px;
      border: 1px solid $border;
      padding: 5px;
      color: $text;
      resize: none;
      outline: none;
      box-sizing: border-box;
      transition: .1s ease-out;

      &:focus {
        border: 1px solid $border-focus;
      }
    }

    &__calendar-icon {
      position: absolute;
      bottom: 6px;
      right: 5px;
      width: 18px;
      cursor: pointer;
      font-size: 18px;
    }

    &__button {
      text-align: center;
      margin-top: 30px;
    }

    &_no-margin {
      margin-bottom: 0;
    }

    &__test {
      height: 24px;
      width: 120px;
    }

    .checkbox {
      display: flex;

      input[type="checkbox"] {
        opacity: 0;

        + {
          label {
            &::after {
              content: none;
            }
          }
        }

        &:checked {
          + {
            label {
              &::after {
                content: "";
              }
            }
          }
        }
      }

      label {
        position: relative;
        display: inline-block;
        padding-left: 22px;
        padding-top: 4px;

        &::before {
          position: absolute;
          content: "";
          display: inline-block;
          height: 16px;
          width: 16px;
          border: 1px solid #c1bbb1;
          left: 0px;
          top: 3px;
        }

        &::after {
          position: absolute;
          content: "";
          display: inline-block;
          height: 5px;
          width: 9px;
          border-left: 2px solid;
          border-bottom: 2px solid;
          transform: rotate(-45deg);
          left: 4px;
          top: 7px;
        }
      }
    }
  }

  #same,
  #test {
    width: 0;
  }

</style>
