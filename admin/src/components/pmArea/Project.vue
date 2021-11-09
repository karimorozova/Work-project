<template lang="pug">
  .project
    .project__all-info

      .project__info-row
        //input.project__name(v-if="!project._id" type="text" v-model="project.projectName" placeholder="Project Name" style="margin-bottom: 10px")
        //span.project__nameBody(v-else)
        //.project__nameDisabled(v-if="!existProjectAccessChangeName") {{ nameOfProject }}
        input.project__name( type="text" v-model="project.projectName" @change="changeProjectName(project.projectName)" placeholder="Project Name")

        .project__test.checkbox
          input(type="checkbox" id="test" :checked="project.isTest" @change="setTest")
          label(for="test") Test

      .project__info-row
        .project__date
          .input-title
            .input-title__text Start Date & Time:
            span.require *
          DatePicker(
            :value="new Date(project.startDate)"
            @confirm="(e) => updateProjectDate(e, 'startDate')"
            format="DD-MM-YYYY, HH:mm"
            type="datetime"
            ref="start"
            :clearable="false"
            :confirm="true"
            confirm-text="Set date"
            :disabled-date="notBeforeToday"
            :disabled="true"
            prefix-class="xmx"
          )

        .project__date
          .input-title
            .input-title__text Deadline:
            span.require *
          DatePicker(
            :value="new Date(project.deadline)"
            @confirm="(e) => updateProjectDate(e, 'deadline')"
            format="DD-MM-YYYY, HH:mm"
            type="datetime"
            ref="deadline"
            :clearable="false"
            :confirm="true"
            confirm-text="Set date"
            :disabled-date="notBeforeStartDate"
            :disabled="isBilling && isProjectFinished"
            prefix-class="xmx"
          )

        .project__date
          .input-title
            .input-title__text Billing Date:
          DatePicker(
            :value="new Date(project.billingDate)"
            @confirm="(e) => updateProjectDate(e, 'billingDate')"
            format="DD-MM-YYYY, HH:mm"
            type="datetime"
            ref="billingDate"
            :clearable="false"
            :confirm="true"
            confirm-text="Set date"
            :disabled-date="notBeforeStartDate"
            prefix-class="xmx"
          )

        //.project__same.checkbox
        //  input(type="checkbox" id="same" :disabled="isProjectFinished" :checked="isBilling" @change="setSameDate")
        //  label(for="same") As deadline

      .project__info-row
        .project__client
          .input-title
            .input-title__text Client Name:
            span.require *
          .project__input-icons(v-if="project._id")
            i.fas.fa-external-link-alt.icon-link(aria-hidden='true' @click="goToClientInfo")
            input.project__input-text2.project__input-client(@click="goToClientInfo" type="text" :value="project.customer.name" readonly)

          .project__drop-menu(v-else)
            SelectSingle(
              :selectedOption="project.customer.name"
              :options="clients"
              :hasSearch="isSearchClient"
              placeholder="Name"
              @chooseOption="setCustomer"
            )
        .project__industry
          .input-title
            .input-title__text Industry:
            span.require *
          input.project__input-text( v-if="project.industry.name"  type="text" :value="project.industry.name" disabled)
          .project__drop-menu(v-else)
            SelectSingle(
              :selectedOption="selectedIndustry.name"
              :options="industriesList"
              @chooseOption="setIndustry"
              placeholder="Industry"
            )
        .project__number
          .input-title
            .input-title__text Billing Information:
            span.require *
          // TODO: delete false!
          input.project__input-text(v-if="(isProjectFinished && project.clientBillingInfo) || (project._id && project.clientBillingInfo) " type="text" :value="(project.clientBillingInfo.name) " disabled)
          .project__drop-menu(v-else)
            SelectSingle(
              :selectedOption="(project.clientBillingInfo && project.clientBillingInfo.name) || ''"
              :options="billingInfoList.map(({name}) => name)"
              @chooseOption="choseBillingInfo"
              placeholder="Option"
            )


      .project__block-row.project_no-margin
        .project__block
          .block__header(@click="toggleBlock('isBrief')" :class="{'block__header-grey': !isBrief}")
            .title Project Brief
            .icon(v-if="!isBrief")
              i.fas.fa-chevron-down
            .icon(v-else)
              i.fas.fa-chevron-right
          .block__data(v-if="isBrief")
            ckeditor(v-model="project.brief" :config="editorConfig" @blur="updateBrief")
            //textarea.project__text(type="text" rows="9" v-model="project.brief" @change="updateBrief")
        .project__block
          .block__header(@click="toggleBlock('isNotes')" :class="{'block__header-grey': !isNotes}")
            .title Project Notes
            .icon(v-if="!isNotes")
              i.fas.fa-chevron-down
            .icon(v-else)
              i.fas.fa-chevron-right
          .block__data(v-if="isNotes")
            ckeditor(v-model="project.notes" :config="editorConfig" @blur="updateNotes")
            //textarea.project__text(type="text" rows="9" v-model="project.notes"  @change="updateNotes")

      .project__button(v-if="!project.projectId")
        Button(
          value="Create Project"
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
	import SelectSingle from "../SelectSingle"
	import SelectMulti from "../SelectMulti"
	import ValidationErrors from "../ValidationErrors"
	import Datepicker from "../Datepicker"
	import LabelValue from "./LabelValue"
	import Button from "../Button"
	import moment from "moment"
	import { mapGetters, mapActions } from "vuex"
	import DatepickerWithTime from "../DatepickerWithTime"
  import CKEditor from "ckeditor4-vue"
  import '../../assets/scss/ckeditor.scss'

  import DatePicker from 'vue2-datepicker';
  import '../../assets/scss/datepicker.scss';

	export default {
		props: {
			project: {
				type: Object
			}
		},
		data() {
			return {
        editorConfig: {
          extraPlugins: [ 'colorbutton', 'smiley' ],
          toolbarGroups: [
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
            { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
            { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
            { name: 'forms', groups: [ 'forms' ] },
            { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
            { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
            { name: 'links', groups: [ 'links' ] },
            // { name: 'insert', groups: [ 'insert' ] },
            { name: 'styles', groups: [ 'styles' ] },
            { name: 'colors', groups: [ 'colors' ] },
            { name: 'tools', groups: [ 'tools' ] },
            { name: 'others', groups: [ 'others' ] },
            { name: 'about', groups: [ 'about' ] }
          ],
          removeButtons: 'Source,Save,NewPage,ExportPdf,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Find,Replace,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Select,ImageButton,HiddenField,Button,Superscript,Subscript,CopyFormatting,NumberedList,Blockquote,CreateDiv,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,BidiLtr,BidiRtl,Language,Anchor,HorizontalRule,Table,Flash,PageBreak,Iframe,Styles,Format,Font,FontSize,ShowBlocks,Maximize,About',
          uiColor: "#ffffff",
          height: 80
        },
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
        isBrief: false,
        isNotes: false,
			}
		},
		methods: {
			...mapActions([
				"alertToggle",
				"setProjectDate",
				"setCurrentProject"
			]),
      toggleBlock(prop) {
        this[prop] = !this[prop]
      },
      notBeforeToday(date) {
        return date < new Date(new Date().setHours(0, 0, 0, 0));
      },
      notBeforeStartDate(date) {
        return date < new Date(this.project.startDate);
      },
			async updateBrief() {
        await this.setProjectProp({ prop: 'brief', value: this.project.brief })
        // return this.$emit('setValue', { prop: 'brief', option: this.project.brief })
			},
			async updateNotes() {
        await this.setProjectProp({ prop: 'notes', value: this.project.notes })
        // return this.$emit('setValue', { prop: 'notes', option: this.project.notes })
			},
			async changeProjectName(projectName) {
				this.errors = []
				// if (!this.project.projectName || (this.project.projectName && !this.checkProjectName())) this.errors.push("Please, enter valid Project name.")
				if (!this.project.projectName) this.errors.push("Please, enter valid Project name.")
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
        await this.setProjectProp({ prop: 'isTest', value: e.target.checked })
			},
			async setSameDate(e) {
				this.isBilling = e.target.checked
					e.target.checked
              ? this.updateProjectDate(this.$refs.deadline.value, 'billingDate')
							: this.updateProjectDate(this.$refs.billingDate.value, 'billingDate')

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
				if (prop === 'customer') {
					this.selectedIndustry = ""
				}
			},
			setCustomer({ option }) {
				if (option.billingInfo.length === 1) {
					this.setBillingInfo(option.billingInfo[0])
				} else {
					this.setBillingInfo('')
				}
				this.$emit('setValue', { option, prop: 'customer' })
			},
			async choseBillingInfo({ option }) {
				const billingInfo = this.billingInfoList.find(({ name }) => name === option)
        await this.setProjectProp({ prop: 'clientBillingInfo', value: billingInfo })
        await this.setProjectProp({ prop: 'paymentProfile', value: billingInfo.paymentType })
			},
			setBillingInfo(billingInfo) {
				this.$emit('setValue', { option: billingInfo, prop: 'clientBillingInfo' })
			},
			setIndustry({ option }) {
				this.selectedIndustry = option
			},
			closeErrors() {
				this.areErrorsExist = false
			},
			checkProjectName() {
				const regex = /^([^\d\W]|[A-z])[\w \.]*$/
				return regex.test(this.project.projectName)
			},
			async checkForErrors() {
				this.errors = []
				// if (!this.project.projectName || (this.project.projectName && !this.checkProjectName())) {
				if (!this.project.projectName) {
					this.errors.push("Please, enter valid Project name.")
					// this.project.projectName = this.project.projectName.replace(/( *[^\w\s\.]+ *)+/g, ' ').trim().replace(/^\d+( ?\d*)*/g, '')
				}
				if (!this.project.startDate) this.errors.push("Please, set the start date.")
				if (!this.project.deadline) this.errors.push("Please, set the deadline date.")
				if (!this.project.customer.name) this.errors.push("Please, select a Client.")
				if (!this.selectedIndustry) this.errors.push("Please, choose an industry.")
				if (!this.project.clientBillingInfo || !this.project.clientBillingInfo.hasOwnProperty('_id')) this.errors.push("Please, choose an Billing Information.")
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
			async getCustomers() {
				try {
					if (!this.project._id) {
						if (!this.clients.length) {
							let result = await this.$http.get(`/active-clients`)
							this.clients = [ ...result.body ].sort((a, b) => {
								return a.name.localeCompare(b.name)
							})
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
				} else {
          this.isBilling = this.$refs.deadline.value.valueOf() === this.$refs.billingDate.value.valueOf()
        }
			},
			setIsBillingTrue() {
				this.isBilling = true
			}
		},
		computed: {
			...mapGetters({
				industries: "getAllIndustries",
				user: "getUser"
			}),
			existProjectAccessChangeName() {
				if (this.project) {
					const { status } = this.project
					return status === 'Draft' || status === 'Quote sent'
				}
			},
			industriesList() {
				let res = []
				if (this.project.customer.name) {
					const { customer: { services } } = this.project
					for (let industry of services.map(i => i.industries[0])) {
						if (!res.length) res.push(industry)
						if (!res.map(i => i.name).includes(industry.name)) res.push(industry)
					}
					return res
				}
			},
			billingInfoList() {
				if (this.project.customer.billingInfo && this.project.customer.billingInfo.length) {
					const billingInfo = this.project.customer.billingInfo
					return billingInfo.map(({ _id, paymentType, name }) => ({ _id, paymentType, name }))
				}
				return []
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
			}
		},
		components: {
			DatepickerWithTime,
      DatePicker,
			SelectSingle,
			SelectMulti,
			Datepicker,
			LabelValue,
			Button,
			ValidationErrors,
      ckeditor: CKEditor.component,
		},
		async created() {
			await this.getProjectData()
			this.getCustomers()
			this.isBillingDate()
			!this.project._id && this.setIsBillingTrue()
		}
	}
</script>

<style lang="scss" scoped>
  @import '../../assets/scss/colors';

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

  .project {
    display: flex;
    flex-direction: column;

    &__block {
      box-sizing: border-box;
      margin-bottom: 20px;
      border: 1px solid $light-border;
      position: relative;
      border-radius: 4px;
      background-color: white;

      &-row{
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;

        ::-webkit-input-placeholder {
          opacity: 0.4;
        }
      }
    }

    &__nameDisabled {
      display: flex;
      font-family: Myriad600;
      align-items: center;
      cursor: default;
      font-size: 19px;
      height: 42px;
      width: 488px;
      color: $text;
      border: 1px solid white;
    }

    &__input-icons {
      position: relative;

      .icon-link {
        position: absolute;
        right: 6px;
        top: 8px;
        font-size: 15px;
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
      width: 1040px;
      box-shadow: $box-shadow;
      position: relative;
      background: white;
      border-radius: 4px;
      box-sizing: border-box;
    }

    &__info-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      ::-webkit-input-placeholder {
        opacity: 0.4;
      }
    }

    &__nameBody {
      width: 100%;
      margin-bottom: 10px;
    }

    &__name {
      font-size: 19px;
      padding: 0 5px;
      height: 42px;
      width: 488px;
      border-radius: 4px;
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
      border-bottom: 1px solid $border;
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

    &__block {
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
      right: 3px;
      width: 18px;
      cursor: pointer;
      font-size: 16px;
      opacity: 0.2;
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
          border: 1px solid $border;
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
  .block {
    &__header {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      cursor: pointer;
      align-items: center;
      transition: .2s ease;
      align-items: center;
      letter-spacing: 0.2px;
      border-radius: 4px;

      &-grey {
        background-color: white;
      }

      .title {
        font-size: 16px;
      }

      .icon {
        font-size: 15px;
        color: $text;
      }
    }

    &__data {
      //padding: 20px 20px 20px;
      border-top: 2px solid $light-border;
    }
  }
  #same,
  #test {
    width: 0;
  }

</style>
