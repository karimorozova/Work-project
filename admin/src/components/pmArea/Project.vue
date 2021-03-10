<template lang="pug">
  .project
    .project__all-info
      .project__info-row
        input.project__name(v-if="!project._id" type="text" v-model="project.projectName" placeholder="Project Name")
        span.project__nameBody(v-else)
          input.project__name(v-if="!existProjectAccessChangeName" type="text" :value="nameOfProject" placeholder="Project Name" disabled)
          input.project__name(v-else type="text" v-model="project.projectName" @change="changeProjectName(project.projectName)" placeholder="Project Name")
      .project__info-row
        .project__date
          LabelValue(label="Start Date & Time" :isRequired="isRequiredField" customClass="project_margin")
            Datepicker(v-model="project.startDate" @selected="(e) => updateProjectDate(e, 'startDate')" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" :disabled="disabled" ref="start" :disabledPicker="disabledPicker")
          img.project__calendar-icon(src="../../assets/images/calendar.png" @click="startOpen")
        .project__date
          LabelValue(label="Deadline" :isRequired="isRequiredField" customClass="project_margin")
            Datepicker(v-model="project.deadline" @selected="(e) => updateProjectDate(e, 'deadline')" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" :disabled="disabled" ref="deadline")
          img.project__calendar-icon(src="../../assets/images/calendar.png" @click="deadlineOpen")
        .project__date
          LabelValue(label="Billing Date" customClass="project_margin")
            Datepicker(
              v-model="project.billingDate"
              ref="billingDate"
              @selected="(e) => updateProjectDate(e, 'billingDate')"
              :highlighted="highlighted"
              monday-first=true
              inputClass="datepicker-custom"
              calendarClass="calendar-custom"
              :format="customFormatter"
              :disabledPicker="isBilling"
              :disabled="disabled"
            )
          img.project__calendar-icon(src="../../assets/images/calendar.png" @click="billingOpen")
        .project__same.checkbox
          input(type="checkbox" id="same" :checked="isBilling" @change="setSameDate")
          label(for="same") As deadline
      .project__info-row
        .project__client
          LabelValue(label="Client Name" :isRequired="isRequiredField" customClass="project_margin")
            .project__input-icons(v-if="project._id")
              i.fa.fa-external-link.icon-link(aria-hidden='true' @click="goToClientInfo")
              input.project__input-text2.project__input-client(@click="goToClientInfo" type="text" :value="project.customer.name" readonly)

            .project__drop-menu(v-else)
              SelectSingle(
                :selectedOption="project.customer.name"
                :options="clients"
                :hasSearch="isSearchClient"
                placeholder="Name"
                @chooseOption="(e) => setValue(e, 'customer')"
              )
        .project__industry
          LabelValue(label="Industry" :isRequired="isRequiredField" customClass="project_margin")
            input.project__input-text( v-if="project.tasks && project.tasks.length"  type="text" :value="project.industry.name" disabled)
            .project__drop-menu(v-else)
              SelectSingle(
                :selectedOption="selectedIndustry.name || project.industry.name"
                :options="industriesList"
                @chooseOption="setIndustry"
                placeholder="Industry"
              )
        .project__number
          LabelValue(label="Client Project Number" customClass="project_margin")
            input.project__input-text(type="text" :value="project.clientProjectNumber" placeholder="Project Number" @change="setClientNumber")
        .project__test.checkbox
          input(type="checkbox" id="test" :checked="project.isTest" @change="setTest")
          label(for="test") Test
      .project__info-row.project_no-margin
        .project__textarea
          LabelValue(label="Project Brief" customClass="project_textarea")
            textarea.project__text(type="text" rows="10" v-model="project.brief")
        .project__textarea
          LabelValue(label="Internal Notes" customClass="project_textarea")
            textarea.project__text(type="text" rows="10" v-model="project.notes")
      .project__button(v-if="!project.projectId")
        Button(
          value="Create Project"
          @clicked="checkForErrors"
        )
    ValidationErrors(v-if="areErrorsExist"
      :errors="errors"
      @closeErrors="closeErrors")
</template>

<script>
	import SelectSingle from "../SelectSingle"
	import SelectMulti from "../SelectMulti"
	import ValidationErrors from "../ValidationErrors"
	import Datepicker from "../Datepicker"
	import LabelValue from "./LabelValue"
	import Button from "../Button"
	import moment from "moment"
	import { mapGetters, mapActions } from "vuex"

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
				industries: [],
				disabled: {
					to: moment().add(-1, 'day').endOf('day').toDate()
				},
				highlighted: {
					days: [6, 0]
				},
				startDate: new Date(),
				deadline: "",
				billingDate: "",
				isSearchClient: true,
				isRequiredField: true,
				errors: [],
				areErrorsExist: false,
				clients: []
			}
		},
		methods: {
			...mapActions([
				"alertToggle",
				"setProjectDate",
				"setCurrentProject"
			]),
			async changeProjectName(projectName) {
				this.errors = []
				if (!this.project.projectName || (this.project.projectName && !this.checkProjectName())) this.errors.push("Please, enter valid Project name.")
				if (this.errors.length) {
					this.areErrorsExist = true
					return
				}
				if (!this.errors.length) {
					await this.setProjectProp({ prop: 'projectName', value: projectName })
				}
			},
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY, HH:mm')
			},
			async updateProjectDate(e, prop) {
				if (this.project._id) {
					if (prop === 'deadline' && this.isBilling) {
						const date = { ['billingDate']: e }
						await this.setDate('billingDate', date)
					}
					const date = { [prop]: e }
					await this.setDate(prop, date)
				} else {
					if (prop === 'deadline' && this.isBilling) {
						this.project.billingDate = e
					}
				}
			},
			async setDate(prop, date) {
				if (prop === 'startDate' && this.project.tasks.length) return
				await this.setProjectDate({ date, projectId: this.project._id })
			},
			async setTest(e) {
				if (!this.project._id) {
					this.isTest = e.target.checked
				} else {
					await this.setProjectProp({ prop: 'isTest', value: e.target.checked })
				}
			},
			async setSameDate(e) {
				this.isBilling = e.target.checked
				if (!this.project._id) {
					this.project.billingDate = e.target.checked ? this.project.deadline : this.project.billingDate
				} else {
					e.target.checked ?
							this.updateProjectDate(this.$refs.deadline.value, 'billingDate') :
							this.updateProjectDate(this.$refs.billingDate.value, 'billingDate')
				}
			},
			async setClientNumber(e) {
				const { value } = e.target
				if (!this.project._id) {
					return this.$emit('setValue', { prop: 'clientProjectNumber', option: value })
				}
				await this.setProjectProp({ prop: 'clientProjectNumber', value })
			},
			async setProjectProp({ prop, value }) {
				try {
					const result = await this.$http.put("/pm-manage/project-prop", { projectId: this.project._id, prop, value })
					await this.setCurrentProject(result.body)
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
			setIndustry({ option }) {
				this.selectedIndustry = option
			},
			closeErrors() {
				this.areErrorsExist = false
			},
			checkProjectName() {
				const regex = /^[A-Za-z][A-Za-z0-9\-\_ ]+((([A-Za-z0-9])+([\-\_])?)* *)*$/
				return regex.test(this.project.projectName)
			},
			async checkForErrors() {
				this.errors = []
				if (!this.project.projectName || (this.project.projectName && !this.checkProjectName())) this.errors.push("Please, enter valid Project name.")
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
					const newProject = await this.$http.post("/pm-manage/new-project", this.project)
					this.$emit('projectCreated', { project: newProject.body, customer: customer })
					this.alertToggle({ message: "New Project has been created", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Server error on creating a new Project", isShow: true, type: "error" })
				}
			},
			async getIndustries() {
				const industries = await this.$http.get('/api/industries')
				this.industries = industries.body
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
				const route = this.$router.resolve({ path: `/clients/details/${ this.project.customer._id }` })
				window.open(route.href, "_blank")
			},
			async getCustomers() {
				try {
					if (!this.project._id) {
						if (!this.clients.length) {
							let result = await this.$http.get(`/active-clients`)
							this.clients = [...result.body]
						}
					}
				} catch (err) {
					this.alertToggle({ message: "Error on getting customers", isShow: true, type: "error" })
				}
			},
			async getProjectData() {
				const { id } = this.$route.params
				if (id !== undefined) {
					const curProject = await this.$http.get(`/pm-manage/project?id=${ id }`)
					await this.setCurrentProject(curProject.body)
				}
			},
			isBillingDate() {
				if (this.$refs.deadline.value === "") {
					this.isBilling = false
				} else this.isBilling = this.$refs.deadline.value === this.$refs.billingDate.value
			},
			setIsBillingTrue() {
				this.isBilling = true
			}
		},
		computed: {
			existProjectAccessChangeName() {
				if (this.project) {
					const { status } = this.project
					return status === 'Draft' || status === 'Quote sent'
				}
			},
			industriesList() {
				let result = []
				if (this.project.customer.name) {
					const industries = this.project.customer.industries
					if (industries[0].name) {
						return result = industries
					}
					return result = result.filter(item => industries.indexOf(item._id) !== -1)
				}
				return result
			},
			nameOfProject() {
				return this.project.isUrgent ? this.project.projectName + " URGENT" : this.project.projectName
			},
			disabledPicker() {
				return !!(this.project._id && this.project.tasks && this.project.tasks.length)
			}
		},
		components: {
			SelectSingle,
			SelectMulti,
			Datepicker,
			LabelValue,
			Button,
			ValidationErrors
		},
		async created() {
			await this.getProjectData()
			this.getCustomers()
			this.getIndustries()
			this.isBillingDate()
			!this.project._id && this.setIsBillingTrue()
		}
	}
</script>

<style lang="scss" scoped>

  .project {
    padding: 40px;
    display: flex;
    flex-direction: column;

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
      width: 113px;
    }

    &__project-template {
      position: relative;
      width: 191px;
      margin-bottom: 60px;
    }

    &__all-info {
      width: 960px;
      padding: 20px;
      box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
    }

    &__info-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;

      ::-webkit-input-placeholder {
        color: #68573E;
        opacity: 0.47;
      }
    }
    &__nameBody{
      width: 100%;
    }

    &__name {
      font-size: 22px;
      padding: 0 5px;
      height: 44px;
      width: 40%;
      border-radius: 5px;
      color: #68573E;
      border: 1px solid #68573E;
      outline: none;

      &:focus {
      }
    }

    &__date {
      width: fit-content;
      position: relative;
    }

    &__client, &__industry, &__number {
      width: fit-content;
    }

    &__drop-menu {
      position: relative;
      height: 28px;
      width: 170px;
    }

    &__client-link {
      width: 170px;
      display: flex;
      justify-content: flex-start;
    }

    &__link {
      border-bottom: 1px solid #68573E;
      cursor: pointer;
    }

    &__input-client {
      cursor: pointer;
    }

    &__input-text {
      width: 158px;
      height: 28px;
      border: 1px solid #68573E;
      border-radius: 5px;
      padding: 0 5px;
      color: #68573E;
      font-size: 14px;
      outline: none;

      &:focus {
      }
    }

    &__input-text2 {
      width: 133px;
      height: 28px;
      border: 1px solid #68573E;
      border-radius: 5px;
      padding: 0 5px;
      color: #68573E;
      font-size: 14px;
      outline: none;
      padding-right: 30px;

      &:focus {
      }
    }

    &__textarea {
      width: 43%;
    }

    &__text {
      width: 100%;
      margin-top: 10px;
      border-radius: 10px;
      border: 1px solid #68573E;
      padding: 5px;
      color: #68573E;
      resize: none;
      outline: none;
      box-sizing: border-box;

      &:focus {
      }
    }

    &__calendar-icon {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 18px;
      cursor: pointer;
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
          border: 1px solid;
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

  input:disabled {
    background-color: #F2EFEB;
  }

</style>
