<template lang="pug">
  .component
    .title(v-if="!isSent") Compliance Request Form
    .component__body(v-if="!isSent")
      .component__form
        Validation-errors(v-if="showError"
          :errors="errors"
          :isAbsolute="true"
          @closeErrors="closeErrors")
        .form__title General Information
        .form__part
          .form__row
            .form__col
              .form__select
                .form__input-title Project Name:
                .width-220
                  input(type="text" placeholder="Value" v-model="currentProjectName")
            .form__col
              .form__select
                .form__input-title Project Deadline:
                span(@click="openCalendar")
                  i.calendar.far.fa-calendar-alt
                DatepickerWithTime(
                  placeholder="Suggested Deadline"
                  v-model="currentDeadline"
                  @selected="(e) => updateDeadline(e)"
                  monday-first=true
                  :format="customFormatter"
                  inputClass="datepicker-custom-project-info"
                  calendarClass="calendar-custom"
                  :disabled="disabled"
                  ref="deadline"
                )
            .form__col
              .form__select(style="margin-top: 20px;")
                .form__input-title Industry:
                .width-220
                  SelectSingle(
                    :selectedOption="currentIndustries.name"
                    :options="mappedIndustries"
                    placeholder="Option"
                    @chooseOption="(e) => setIndustry(e)"
                  )

        .form__title(v-if="Object.keys(currentIndustries).length") Languages
        .form__part(v-if="Object.keys(currentIndustries).length")
          .form__row
            .form__col
              .form__select
                .form__input-title Source Language:
                .width-220
                  SelectSingle(
                    :selectedOption="currentSourceLang.lang"
                    :options="mappedSourceLanguages"
                    :hasSearch="true"
                    placeholder="Option"
                    @chooseOption="(e) => setSelectedOptionLanguages(e, 'currentSourceLang')"
                  )
            .form__col
              .form__select
                .form__input-title Target Language:
                .width-220
                  SelectSingle(
                    :selectedOption="currentTargetLang.lang"
                    :options="mappedTargetLanguages"
                    :hasSearch="true"
                    placeholder="Option"
                    @chooseOption="(e) => setSelectedOptionLanguages(e, 'currentTargetLang')"
                  )

        .form__title Files Preparation
        .form__part
          .fileModal(v-if="isFileModal" id="modal")
            span.fileModal__close(@click="closeFileModal") &#215;
            .fileModal__btns
              .fileModal__btn
                UploadFileButton(label="Source File(s)" @uploadedFile="setSourceFiles" inputName="sourceFiles")
              .fileModal__btn
                UploadFileButton(label="Reference File(s)" @uploadedFile="setRefFiles" inputName="refFiles")

            .fileModal__tooltip Each uploaded file can be <= 50Mb

          .form__row
            .table
              GeneralTable(
                :fields="fields"
                :tableData="files"
              )
                .table__header(slot="headerFile" slot-scope="{ field }") {{ field.label }}
                .table__header(slot="headerType" slot-scope="{ field }") {{ field.label }}
                .table__header(slot="headerIcon" slot-scope="{ field }") {{ field.label }}

                .table__data(slot="file" slot-scope="{ row }") {{row.name}}
                .table__data(slot="type" slot-scope="{ row }") {{row.type}}
                .table__dataIcon(slot="icon" slot-scope="{ row }")
                  span(@click="(e) => deleteFile(e, row.name, row.type)")
                    i.fas.fa-trash

            Add(@add="openFileModal" id="add")

        .form__title Project Details
        .form__part
          .form__row
            .form__col
              .form__select
                .form__input-title Template:
                .width-220
                  SelectSingle(
                    :selectedOption="currentComplianceTemplate.title"
                    :options="mappedComplianceTemplates"
                    :hasSearch="true"
                    placeholder="Option"
                    @chooseOption="(e) => setComplianceTemplate(e)"
                  )
            .form__col
              .form__select
                .width-310
                  ul(v-html="currentComplianceTemplate.description")

          .form__row
            .form__col
              .form__select(style="margin-top: 20px;")
                .form__input-title-margin9 Enter a short brief:
                div(style="width: 625px")
                  textarea.form__textarea(rows="4" v-model="currentBrief")

        //.form__ckeckbox
        //  TextRadio(
        //    :isChecked="startOption === 'Send'"
        //    title="Send a Quote"
        //    text="I approve for the project to begin immediately and I'll review the quote later."
        //    @check="(e) => setQuoteDecision('Send')"
        //  )
        //  TextRadio(
        //    :isChecked="startOption === 'Start'"
        //    title="Start Immediately"
        //    text="I approve for the project to begin immediately and to receive the quote just for reference."
        //    @check="(e) => setQuoteDecision('Start')"
        //  )
        .form__submit
          Button(@clicked="checkError" value="Submit" :isDisabled="!isCompleteForm || isRequestSend")

      div(v-if="!isSent")
        .component__order

          div(v-if="Object.keys(user).length" style="padding-top: 20px;")
            ClientTable(
              :currentContacts="currentContacts"
              :clientInfo="clientInfo"
              :user="user"
              @addContact="addContact"
              @setContact="setContact"
              @removeContact="removeContact"
            )

        .component__order
          .form__title--order Your Order

          .order__row(v-if="!!currentProjectName")
            .order__subTitle Project:
            .order__value {{currentProjectName}}
              //.order__details(v-if="!!startOption") {{ startOption === 'Send' && '(Send a Quote)' || startOption === 'Start' && '(Start Immediately)'  }}

          .order__row
            .order__subTitle Service:
            .order__value Compliance
              .order__details(v-if="!!currentComplianceTemplate") {{currentComplianceTemplate.title}}

          .order__row(v-if="Object.keys(currentIndustries).length")
            .order__subTitle Industry:
            .order__value {{currentIndustries.name}}

          .order__row(v-if="Object.keys(currentSourceLang).length")
            .order__subTitle Source:
            .order__value {{currentSourceLang.lang}}
          .order__row(v-if="Object.keys(currentTargetLang).length")
            .order__subTitle Target:
            .order__value {{currentTargetLang.lang}}

          .order__row(v-if="!!currentDeadline")
            .order__subTitle Deadline:
            .order__value {{ customFormatter(currentDeadline) }}

    client-request-completed(v-else :values="groupAllData()")


</template>

<script>
	import { mapGetters } from "vuex"
	import SelectSingle from "../../../../components/pangea/SelectSingle"
	import DatepickerWithTime from "../../../../components/pangea/DatepickerWithTime"
	import moment from "moment"
	import UploadFileButton from "../../../../components/buttons/UploadFileButton"
	import TextRadio from "../../../components/forms/TextRadio"
	import DataTable from "../../../../components/Tables/DataTable"
	import Add from "../../../../components/pangea/Add"
	import ClientTable from "../../../../components/ClientTable"
	import Button from "../../../../components/buttons/Button"
	import ClientRequestCompleted from "../../../../components/completedOrder/clientRequestCompleted"
	import ValidationErrors from "../../../../components/ValidationErrors"
	import GeneralTable from "../../../../components/pangea/GeneralTable"

	export default {
		data() {
			return {
				isRequestSend: false,
				currentDeadline: '',
				currentProjectName: '',
				currentSourceLang: {},
				currentTargetLang: {},
				currentIndustries: {},
				refFiles: [],
				sourceFiles: [],
				currentBrief: '',
				startOption: 'Send',
				currentComplianceTemplate: '',
				currentContacts: [],

				isSent: false,

				isFileModal: false,
				disabled: {
					to: moment().add(-1, 'day').endOf('day').toDate()
				},
				fields: [
					{ label: "File Name", headerKey: "headerFile", key: "file", style: { width: "70%" } },
					{ label: "File Type", headerKey: "headerType", key: "type", style: { width: "20%" } },
					{ label: "", headerKey: "headerIcon", key: "icon", style: { width: "10%" } }
				],

				errors: [],
				showError: false,

				complianceTemplates: [
					{
						title: '[1] POI (Proof of Identity Documents)',
						description: '<li>Full name</li><li>DOB</li><li>Issue date</li><li>Expiry date if there is any</li>'
					},
					{
						title: '[2] POA (Proof of Address Documents)',
						description: '<li>Full name</li><li>Address</li><li>Issue date</li><li>Who Issued</li>'
					},
					{
						title: '[3] Tax declarations',
						description: '<li>Name</li><li>Net annual declared income</li><li>Year of declaration</li><li>Issue date</li><li>Currency</li>'
					},
					{
						title: '[4] Salary certificates / letters of employment',
						description: '<li>Name</li><li>Net salary</li><li>Employer</li><li>Issue date</li><li>Currency</li>'
					},
					{
						title: '[5] Sales / purchase agreements',
						description: '<li>Name of seller</li><li>Name of buyer if any</li><li>Amount of the sale</li><li>Date of agreement</li><li>Issuing authority</li><li>Currency</li>'
					},
					{
						title: '[6] Cancellation letters of bank accounts / CCs',
						description: '<li>Account holder name</li><li>Account number</li><li>Issuing credit institution</li><li>CC digits</li><li>Issue date</li>'
					},
					{
						title: '[7] Specific transactions on bank statements',
						description: '<li>Brief description of specific transaction</li>'
					},
					{
						title: '[8] Proof of relation documents (eg birth certificates, marriage certificates)',
						description: '<li>Type of doc</li><li>Names involved</li><li>Relation</li>'
					},
					{
						title: '[9] Corporate: Company Info',
						description: '<li>Registered name</li><li>Incorporation date</li><li>Directors and Authorised Signatories</li><li>Shareholders/ Beneficial Owners</li><li>Registered AND Business address (if available)</li><li>Share capital</li><li>Any information on Directors and Shareholders</li>'
					},
					{
						title: '[10] Corporate: Financial statements',
						description: '<li>Profit & Loss: line by line translation</li><li>Balance sheet: line by line translation</li><li>Additional notes: line by line for all table type notes</li><li>Any information regarding payments to shareholders and directors</li>'
					},
					{
						title: 'N/A - no template',
						description: ''
					}
				]
			}
		},
		methods: {
			groupAllData() {
				return {
					currentProjectName: this.currentProjectName,
					currentDeadline: this.customFormatter(this.currentDeadline),
					currentIndustries: this.currentIndustries,
					currentSourceLang: this.currentSourceLang,
					currentTargetLang: this.currentTargetLang,
					files: this.files,
					currentBrief: this.currentBrief,
					currentComplianceTemplate: this.currentComplianceTemplate,
					startOption: this.startOption
				}
			},

			closeErrors() {

				this.showError = false
				this.errors = []
			},
			checkError() {
				this.closeErrors()

				if (!this.currentProjectName) this.errors.push("Please, enter valid Project name.")
				if (new Set(this.files.map(({ name }) => name)).size !== this.files.length) this.errors.push("Please, do not select the same files.")

				if (this.errors.length > 0) {
					this.showError = true
				} else {
					this.addService()
				}
			},
			async addService() {
				this.isRequestSend = true
				let formData = new FormData()
				formData.append('deadline', this.currentDeadline)
				formData.append('projectName', this.currentProjectName)
				formData.append('sourceLanguage', JSON.stringify(this.currentSourceLang))
				formData.append('targetLanguages', JSON.stringify(this.currentTargetLang))
				formData.append('industry', JSON.stringify(this.currentIndustries))
				formData.append('brief', this.currentBrief)
				formData.append('startOption', this.startOption)
				formData.append('complianceTemplate', JSON.stringify(this.currentComplianceTemplate))
				formData.append('clientContacts', JSON.stringify(this.currentContacts))
				formData.append('createdBy', JSON.stringify({ _id: this.user._id, firstName: this.user.firstName, surname: this.user.surname, email: this.user.email }))

				if (this.refFiles.length) for (let file of this.refFiles) formData.append('refFiles', file)
				if (this.sourceFiles.length) for (let file of this.sourceFiles) formData.append('sourceFiles', file)

				try {
					await this.$axios.post('/portal/compliance-service-request', formData)
					this.isSent = true
					this.isRequestSend = false
				} catch (err) {
					this.isRequestSend = false
				}
			},
			removeContact(index) {
				this.currentContacts.splice(index, 1)
			},
			setContact(index, { option }) {
				this.currentContacts.splice(index, 1, this.clientInfo.contacts.find(item => `${ item.firstName } ${ item.surname }` === option))
			},
			addContact(data) {
				this.currentContacts.push(data)
			},
			setComplianceTemplate({ option }) {
				this.currentComplianceTemplate = this.complianceTemplates.find(({ title }) => title === option)
			},
			outsideClickListener(e) {
				const layout = document.getElementById("modal")
				const add = document.getElementById("add")
				let { target } = e
				do {
					if (target === layout) return
					if (target === add) return
					target = target.parentNode
				} while (target)

				this.closeFileModal()
			},
			openFileModal() {
				this.isFileModal = true
				document.addEventListener('click', this.outsideClickListener)
			},
			closeFileModal() {
				this.isFileModal = false
				document.removeEventListener('click', this.outsideClickListener)
			},
			setQuoteDecision(prop) {
				this.startOption = prop
			},
			updateDeadline(e) {
				this.currentDeadline = e
			},
			setIndustry({ option }) {
				const servicesIndustries = [
					...new Set(
							this.clientInfo.services
									.filter(i => i.services[0].title === "Compliance")
									.map(i => i.industries[0])
					)
				]

				this.currentIndustries = servicesIndustries.find(({ name }) => name === option)
				this.currentSourceLang = {}
				this.currentTargetLang = {}
			},
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY, HH:mm')
			},
			openCalendar() {
				this.$refs.deadline.showCalendar()
			},
			setSelectedOptionLanguages({ option }, value) {
				this[value] = this.allLanguages.find(({ lang }) => lang === option)
			},
			setSourceFiles({ files }) {
				const filteredFiles = Array.from(files).filter(item => item.size < 50000000).filter(item => !this.sourceFiles.map(item => item.name).includes(item.name))
				this.sourceFiles.push(...filteredFiles)
				this.clearFileInput('sourceFiles')
				this.closeFileModal()
			},
			setRefFiles({ files }) {
				const filteredFiles = Array.from(files).filter(item => item.size < 50000000).filter(item => !this.refFiles.map(item => item.name).includes(item.name))
				this.refFiles.push(...filteredFiles)
				this.clearFileInput('refFiles')
				this.closeFileModal()
			},
			clearFileInput(name) {
				const fileInput = document.querySelector(`input[name=${ name }]`)
				fileInput.value = ""
			},
			deleteFileByIdx(arr) {
				const idx = Array.from(arr).findIndex(item => item.name === name)
				arr.splice(idx, 1)
			},
			deleteFile(e, name, type) {
				if (type === 'Source') this.deleteFileByIdx(this.sourceFiles)
				if (type === 'Reference') this.deleteFileByIdx(this.refFiles)
			}
		},
		computed: {
			...mapGetters({
				user: "getUserInfo",
				allLanguages: 'allLanguages',
				getClientIndustries: "getClientIndustries",
				clientInfo: "getClientInfo"
			}),
			isCompleteForm() {
				return this.currentContacts.length &&
						!!this.currentComplianceTemplate &&
						!!this.startOption &&
						(this.refFiles.length || this.sourceFiles.length) &&
						Object.keys(this.currentIndustries).length &&
						Object.keys(this.currentTargetLang).length &&
						Object.keys(this.currentSourceLang).length &&
						!!this.currentProjectName &&
						!!this.currentDeadline
			},
			files() {
				return [
					...Array.from(this.sourceFiles).map(item => ({ type: 'Source', name: item.name })),
					...Array.from(this.refFiles).map(item => ({ type: 'Reference', name: item.name }))
				]
			},
			mappedSourceLanguages() {
				if (this.clientInfo.services) {
					return [
						...new Set(
								this.clientInfo.services
										.filter(i => i.industries[0].name === this.currentIndustries.name)
										.filter(i => i.services[0].title === "Compliance")
										.map(i => i.sourceLanguage.lang)
										.filter(i => i !== "English" && i !== "English (United States)")
						)
					]
				}
			},
			mappedTargetLanguages() {
				if (this.clientInfo.services) {
					return [
						...new Set(
								this.clientInfo.services
										.filter(i => i.industries[0].name === this.currentIndustries.name)
										.filter(i => i.services[0].title === "Compliance")
										.map(i => i.targetLanguages[0].lang)
										.filter(i => i !== "English" && i !== "English (United States)")
						)
					]
				}
			},
			mappedIndustries() {
				if (this.clientInfo.services) {
					const servicesIndustries = [
						...new Set(
								this.clientInfo.services
										.filter(i => i.services[0].title === "Compliance")
										.map(i => i.industries[0].name)
						)
					]
					if (servicesIndustries.length === 1 && servicesIndustries[0].hasOwnProperty('name')) this.setIndustry({ option: servicesIndustries[0].name })
					return servicesIndustries
				}
			},
			mappedComplianceTemplates() {
				return this.complianceTemplates.map(i => i.title)
			}
		},
		components: {
			GeneralTable,
			ValidationErrors,
			ClientRequestCompleted,
			Button,
			Add,
			DataTable,
			TextRadio,
			UploadFileButton,
			DatepickerWithTime,
			SelectSingle,
			ClientTable
		}

	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors";

  .table {
    width: 100%;

    &__header {
      padding: 0 0 0 7px;
    }

    &__data {
      padding: 0 7px;
      width: 100%;
      display: flex;
      justify-content: space-between;
    }

    &__dataIcon {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .fa-trash {
      cursor: pointer;
    }
  }

  .fileModal {
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    position: absolute;
    z-index: 9999;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    padding: 30px 20px 20px;
    background: rgb(255, 255, 255);


    &__tooltip {
      text-align: center;
      opacity: 0.6;
      margin-top: 15px;
    }

    &__btns {
      display: flex;
      justify-content: space-around;
      margin-top: 10px;
    }

    &__btn {
      width: 100px;
    }

    &__close {
      position: absolute;
      top: 5px;
      right: 7px;
      font-size: 22px;
      cursor: pointer;
      height: 22px;
      width: 22px;
      justify-content: center;
      display: flex;
      align-items: center;
      font-family: Myriad900;
      opacity: 0.8;
      transition: ease 0.2s;

      &:hover {
        opacity: 1
      }
    }
  }

  .order {
    &__files-item {
      border-radius: 4px;
      border: 1px solid #ddd;
      background-color: transparent;
      font-size: 12px;
      padding: 6px;
      margin: 0;
      justify-content: space-between;
      align-items: center;
      position: relative;
      margin-bottom: 7px;
      color: #d15f45;
      display: flex;
    }

    &__details {
      font-size: 12px;
      font-family: 'Myriad400';
      opacity: 0.6;
    }

    &__project {
      margin-bottom: 12px;
    }

    &__subTitle {
      width: 80px;
      font-family: Myriad600;
    }

    &__value {
      font-size: 14px;
    }

    &__projectName {
      font-size: 16px;
      color: #d15f45;
      margin-top: 10px;
      font-family: 'Myriad600';
    }

    &__projectOption {
      opacity: 0.6;
    }

    &__delete {
      color: #67573e;
      cursor: pointer;
      transform: 0.2s ease;
      font-size: 14px;

      &:hover {
        font-weight: bold;
        cursor: pointer;
      }
    }

    &__title {
      margin-top: 10px;
      margin-bottom: 2px;
    }

    &__row {
      display: -webkit-box;
      margin-top: 10px;
    }

  }

  .form {
    &__row {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }

    &__submit {
      margin-top: 30px;
      display: flex;
      justify-content: center;
    }

    &__dataIcon {
      text-align: center;
      cursor: pointer;
    }

    &__col {
      /*width: 50%;*/
      /*justify-content: center;*/
      /*display: flex;*/
    }

    &__ckeckbox {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }

    &__select {
      display: flex;
      min-height: 30px;
      position: relative;
    }

    &__input-title {
      align-items: center;
      display: flex;
      min-width: 130px;
    }

    &__input-title-margin9 {
      margin-top: 9px;
      display: flex;
      min-width: 130px;
    }

    &__title {
      font-size: 14px;
      padding-top: 30px;
      padding-bottom: 8px;
      font-family: 'Myriad600';

      &--order {
        font-size: 14px;
        padding-top: 20px;
        padding-bottom: 15px;
        font-family: 'Myriad600';
        border-bottom: 1px solid $border;
        margin-bottom: 15px;
      }
    }

    &__textarea {
      width: 100%;
      border: none;
      padding: 5px;
      outline: none;
      box-sizing: border-box;
      font-size: 14px;
      border: 1px solid $border;
      border-radius: 4px;
    }

    &__part {
      padding: 30px 20px;
      border: 2px solid $light-border;
      border-radius: 4px;
      position: relative;
    }
  }

  .component {
    &__body {
      display: flex;
      margin-bottom: 50px;
    }

    &__order {
      box-shadow: $box-shadow;
      padding: 0 20px 20px 20px;
      width: 300px;
      height: fit-content;
      margin-left: 40px;
      margin-bottom: 40px;
      background-color: white;
      border-radius: 4px;
    }


    &__form {
      border-radius: 4px;
      box-shadow: $box-shadow;
      padding: 0 20px 20px 20px;
      width: 800px;
      background-color: white;
      position: relative;
    }
  }

  .title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 10px;
  }

  .width-220 {
    width: 220px;
    position: relative;
  }

  .width-310 {
    width: 310px;
    position: relative;
  }

  input {
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

  ::-webkit-input-placeholder {
    opacity: 0.5;
  }

  .calendar {
    z-index: 10;
    position: absolute;
    right: 5px;
    font-size: 18px;
    top: 6px;
    cursor: pointer;
  }


  ul {
    margin-block-start: 0em !important;
    margin-block-end: 0em !important;
    margin-inline-start: 0px !important;
    margin-inline-end: 0px !important;
    padding-inline-start: 0px !important;
  }
</style>
