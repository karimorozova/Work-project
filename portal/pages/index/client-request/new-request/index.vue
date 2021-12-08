<template lang="pug">
  .component
    FormTemplate(
      v-if="isShowTemplateStep && clientInfo.hasOwnProperty('_id')"
      :clientId="clientInfo._id"
      @selectedTemplate="setTemplateData"
    )
    .test(v-if="!isShowTemplateStep")
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
                  DatePicker(
                    placeholder="Suggested Deadline"
                    :value="currentDeadline"
                    @confirm="(e) => updateDeadline(e)"
                    format="DD-MM-YYYY, HH:mm"
                    type="datetime"
                    ref="deadline"
                    :clearable="false"
                    :confirm="true"
                    confirm-text="Set date"
                    :disabled-date="notBeforeToday"
                    prefix-class="xmx"
                  )
            .form__row
              .form__col
                .form__select(style="margin-top: 20px;")
                  .form__input-title Service:
                  .width-220
                    SelectSingle(
                      :selectedOption="selectedService"
                      :options="mappedService"
                      placeholder="Option"
                      @chooseOption="(e) => setServices(e)"
                    )
              .form__col
                .form__select( style="margin-top: 20px;")
                  .form__input-title Industry:
                  .width-220
                    SelectSingle(
                      :isDisabled="selectedService === ''"
                      :selectedOption="currentIndustries.name"
                      :options="mappedIndustries"
                      placeholder="Option"
                      @chooseOption="(e) => setIndustry(e)"
                    )


          .form__title(v-if="Object.keys(currentIndustries).length") Languages
          .form__part(v-if="Object.keys(currentIndustries).length")
            TasksLangDuo(
              :isServiceDuo="isDuoLangService"
              :mappedSourceLanguages="mappedSourceLanguages"
              :mappedTargetLanguages="mappedTargetLanguages"
              :source="currentSourceLang.lang"
              :targets="currentTargetLang"

              @selectSourceLang="(e) => setSelectedOptionLanguages(e, 'currentSourceLang')"
              @selectTargetLang="setSelectedTargetLanguages"
            )
              //.form__col(v-if="isDuoLangService")
                .form__select
                  .form__input-title Source Language:
                  .width-220
                    SelectSingle(
                      //:selectedOption="currentSourceLang.lang"
                      //:options="mappedSourceLanguages"
                      //:hasSearch="true"
                      //placeholder="Option"
                      //@chooseOption="(e) => setSelectedOptionLanguages(e, 'currentSourceLang')"
                    )
              //.form__col
                .form__select
                  .form__input-title Target Language:
                  .width-220
                    SelectMulti(
                      //:isDisabled="this.isDuoLangService && !currentSourceLang.hasOwnProperty('lang')"
                      //:selectedOptions="currentTargetLang.map(({lang})=> lang)"
                     //:options="mappedTargetLanguages"
                     //:hasSearch="true"
                     //placeholder="Option"
                     //@chooseOptions="setSelectedTargetLanguages"
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

          .form__title Instructions
          .form__part

            .form__row
              Instructions(:instructions="getInstructions" @changedInstructions="setInstructions")
              //.form__col
                .form__select-block
                  .form__input-title-margin9 Enter a short brief:
                  .form__details(id="instructions" contenteditable="true" @input="selectOnlyExisted" )
              //.form__col
                .form__select-block(v-if="selectedService" style="width: 240px")
                  .form__input-title-margin9 Select instructions:
                  .form__checked(v-for=" ( instruction, index) of instructions[selectedService]" style="width: 50%")
                    CheckBox(:isChecked="instruction.isActive" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")
                    span {{instruction.name}}

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
            //Button(@clicked="checkError" value="Submit" :isDisabled="!isCompleteForm || isRequestSend")
            Button(@clicked="checkError" value="Submit" )

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

          .component__order(v-if="Object.keys(selectedService).length")
            .form__title--order Your Order

            .order__row(v-if="!!currentProjectName")
              .order__subTitle Project:
              .order__value {{currentProjectName}}
                //.order__details(v-if="!!startOption") {{ startOption === 'Send' && '(Send a Quote)' || startOption === 'Start' && '(Start Immediately)'  }}

            .order__row
              .order__subTitle Service:
              .order__value {{selectedService}}

            .order__row(v-if="Object.keys(currentIndustries).length")
              .order__subTitle Industry:
              .order__value {{currentIndustries.name}}

            .order__row(v-if="Object.keys(currentSourceLang).length")
              .order__subTitle Source:
              .order__value {{currentSourceLang.lang}}
            .order__row(v-if="Object.keys(currentTargetLang).length")
              .order__subTitle Target:
              .order__value {{currentTargetLang.map(({lang}) => lang).join('; ')}}

            .order__row(v-if="!!currentDeadline")
              .order__subTitle Deadline:
              .order__value {{ customFormatter(currentDeadline) }}

      //client-request-completed(v-else :values="groupAllData()")


</template>

<script>
  import { mapActions, mapGetters } from "vuex"
	import SelectSingle from "../../../../components/pangea/SelectSingle"
	import SelectMulti from "../../../../components/pangea/SelectMulti"
	// import DatepickerWithTime from "../../../../components/pangea/DatepickerWithTime"
	import moment from "moment"
	import UploadFileButton from "../../../../components/buttons/UploadFileButton"
	import TextRadio from "../../../components/forms/TextRadio"
	import Instructions from "../../../components/forms/Instructions"
	import DataTable from "../../../../components/Tables/DataTable"
	import Add from "../../../../components/pangea/Add"
	import ClientTable from "../../../../components/ClientTable"
	import Button from "../../../../components/buttons/Button"
	import ClientRequestCompleted from "../../../../components/completedOrder/clientRequestCompleted"
	// import ValidationErrors from "../../../../components/ValidationErrors"
	import GeneralTable from "../../../../components/pangea/GeneralTable"
  import ValidationErrors from "../../../../components/pangea/ValidationErrors"
  import CheckBox from "../../../../components/CheckBox"
  import { instructions } from "../../../../../admin/enums"
  import { getUser } from "../../../../store/actions"

  import DatePicker from 'vue2-datepicker'
  // import 'vue2-datepicker/index.css';
  import '../../../../assets/scss/datepicker.scss'
  // import '../../../../assets/scss/datepicker.scss'

  import FormTemplate from "../../../components/forms/FormTemplate"
  import TasksLangDuo from "../../../components/forms/TasksLangDuo"


	export default {
		data() {
			return {
        editorData: '',
        isSecondStep: false,
        selectedService: '',
				isRequestSend: false,
				currentDeadline: '',
				currentProjectName: '',
				currentSourceLang: {},
				currentTargetLang: [],
				currentIndustries: {},
				refFiles: [],
				sourceFiles: [],
				currentBrief: '',
				startOption: 'Send',
				currentComplianceTemplate: '',
				currentContacts: [],
        servicesRequireFile: ['Translation', 'Compliance'],

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
        selectedInstructions: '',
				instructions: instructions,
      }
		},
		methods: {
		  ...mapActions({
        getLanguages: "getLanguages",
        getUser: "getUser"
      }),
      notBeforeToday(date) {
        return date < new Date();
      },
      selectOnlyExisted(){
		    if (!this.selectedService) return []
        const allIds = document.querySelectorAll('#instructions > p')
        const current =  allIds ? [...allIds].map(({id}) => id) : []
         this.instructions[this.selectedService].forEach((instruction, index) => {
          // instruction.isActive = current.includes(instruction.name)
           this.$set(this.instructions[this.selectedService][index], 'isActive', current.includes(instruction.name))
          return instruction
        })
        // this.instructions
        // this.$set(this.instructions, this.selectedService, selectExistedInEditor)

      },
			groupAllData() {
				return {
					currentProjectName: this.currentProjectName,
					currentDeadline: this.customFormatter(this.currentDeadline),
					currentIndustries: this.currentIndustries,
					currentSourceLang: this.currentSourceLang,
					currentTargetLang: this.currentTargetLang,
          selectedInstructions: this.selectedInstructions,
					files: this.files,
					startOption: this.startOption
				}
			},

      // toggleCheck(index, status ) {
		  //   const toggledInstruction = this.instructions[this.selectedService][index]
		  //   if (status) {
		  //     document.querySelector('#instructions').innerHTML += `<p id='${toggledInstruction.name}'> ${toggledInstruction.pattern}</p>`
      //     // this.editorData += `<ast data-test='tadsadas'> ${toggledInstruction.pattern}</ast>`
      //   } else {
		  //     document.querySelector(`#${toggledInstruction.name}`).remove()
      //     // this.editorConfig.replace('<.* id=".*>.*>')
      //   }
      //
		  //   this.$set(toggledInstruction, "isActive", status)
      // },

			closeErrors() {

				this.showError = false
				this.errors = []
			},
			checkError() {
				this.closeErrors()

        if (!this.currentProjectName) this.errors.push("Please, enter valid Project name.")
				if (!this.currentDeadline) this.errors.push("Please, enter valid Deadline.")
				if (!this.selectedService) this.errors.push("Please, select valid Service.")
				if (!this.currentIndustries.hasOwnProperty('name')) this.errors.push("Please, select valid Industry.")
				if (this.isDuoLangService && !this.currentSourceLang.hasOwnProperty('lang')) this.errors.push("Please, select valid Source language.")
				if (!this.currentTargetLang.length) this.errors.push("Please, select valid Target language.")
				if (new Set(this.files.map(({ name }) => name)).size !== this.files.length) this.errors.push("Please, do not select the same files.")
				if (this.selectedService && this.getServiceInfo.steps.some(({step}) => this.servicesRequireFile.includes(step.title)) && !this.sourceFiles.length ) this.errors.push("Please, select Source files.")

				if (this.errors.length > 0) {
					this.showError = true
				} else {
					this.addService()
				}
			},
			async addService() {
        this.isRequestSend = true
				let formData = new FormData()

				formData.append('service', this.selectedService)
				formData.append('deadline', this.currentDeadline)
				formData.append('projectName', this.currentProjectName)
				formData.append('sourceLanguage', JSON.stringify(this.currentSourceLang))
				formData.append('targetLanguages', JSON.stringify(this.currentTargetLang))
				formData.append('industry', JSON.stringify(this.currentIndustries))
				formData.append('instructions', this.selectedInstructions )
				formData.append('notes', this.selectedInstructions.length ? JSON.parse(this.selectedInstructions).map(({description, title}) => `<b>${title}</b> ${description}`).join('') : '' )
				// formData.append('brief', this.currentBrief)
				formData.append('startOption', this.startOption)
				formData.append('complianceTemplate', JSON.stringify(this.currentComplianceTemplate))
				formData.append('clientContacts', JSON.stringify(this.currentContacts))
				formData.append('createdBy', JSON.stringify({ _id: this.user._id, firstName: this.user.firstName, surname: this.user.surname, email: this.user.email }))

				if (this.refFiles.length) for (let file of this.refFiles) formData.append('refFiles', file)
				if (this.sourceFiles.length) for (let file of this.sourceFiles) formData.append('sourceFiles', file)

				try {
					const response =  await this.$axios.post('/portal/new-client-service-request', formData)
					this.isSent = true
					this.isRequestSend = false
          this.$router.push('/client-request/details/' + response.data.id)
				} catch (err) {
					this.isRequestSend = false
				}
			},
			removeContact(index) {
				this.currentContacts.splice(index, 1)
			},
			setContact(index, { option }) {
				this.currentContacts.splice(index,1, this.clientInfo.contacts.find(item => `${ item.firstName } ${ item.surname }` === option))
			},
			addContact(data) {
				this.currentContacts.push(data)
			},
			// setComplianceTemplate({ option }) {
			// 	this.currentComplianceTemplate = this.complianceTemplates.find(({ title }) => title === option)
			// },
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
									.filter(({services}) => services[0].title === this.selectedService)
									.map(i => i.industries[0])
					)
				]
        this.currentIndustries = servicesIndustries.find(({ name }) => name === option)
				this.currentSourceLang = {}
				this.currentTargetLang = []
			},
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY, HH:mm')
			},
			openCalendar() {
				this.$refs.deadline.showCalendar()
			},
			setSelectedOptionLanguages(option , value) {
				this[value] = this.allLanguages.find(({ lang }) => lang === option)
        this.currentTargetLang = []
			},
      setSelectedTargetLanguages(targetLang) {
		    this.currentTargetLang = targetLang
        // const clickedLang = this.allLanguages.find(({ lang }) => lang === option)
        // const position = this.currentTargetLang.findIndex(({ lang }) => lang === clickedLang.lang)
        // if (position !== -1) {
        //   this.currentTargetLang.splice(position, 1)
        // } else {
        //   this.currentTargetLang.push(clickedLang)
        // }
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
			},
      setInstructions(instructions) {
		    this.selectedInstructions = instructions
      },
      setServices({option}){
        this.selectedService = option
        this.currentTargetLang = []
        this.currentSourceLang = {}
        this.currentIndustries = {}
      },
      setTemplateData(selectedTemplate) {
		    this.isSecondStep = true

        if(selectedTemplate.hasOwnProperty('groupName')) {
          this.selectedService = selectedTemplate.service.title
          this.currentIndustries = selectedTemplate.industry
          this.currentSourceLang = selectedTemplate.source
          this.currentTargetLang = selectedTemplate.target
        }
      }
		},
		computed: {
			...mapGetters({
				user: "getUserInfo",
				allLanguages: 'allLanguages',
				clientInfo: "getClientInfo",
        services: "getAllServices"
			}),
      isShowTemplateStep() {
			  return this.clientInfo.servicesGroups && this.clientInfo.servicesGroups.length >= 1 && !this.isSecondStep
      },
      getInstructions() {
			  if (!this.selectedService) return []
        if (this.clientInfo.name === 'eToro (Europe) Limited' && this.selectedService === 'Compliance') return this.instructions['ComplianceEtoro']
        return this.instructions[this.selectedService]
      },
      getServiceInfo() {
        if (this.selectedService === '') return ''
        return this.services.find(({title}) => title === this.selectedService)
      },
      isDuoLangService() {
        if (this.selectedService === '') return ''
        return this.getServiceInfo.languageForm === 'Duo'
      },
			isCompleteForm() {
				return this.currentContacts.length &&
						// !!this.currentComplianceTemplate &&
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
				if (this.clientInfo.services && this.clientInfo.services.length) {
					return [
						...new Set(
								this.clientInfo.services
										.filter(i => i.industries[0].name === this.currentIndustries.name)
										.filter(i => i.services[0].title === this.selectedService)
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
										.filter(i => i.services[0].title === this.selectedService)
                    .filter(i =>  !this.isDuoLangService || (i.sourceLanguage.lang === this.currentSourceLang.lang))
										.map(i => i.targetLanguages[0].lang)
										.filter(i => i !== "English" && i !== "English (United States)")
						)
					]
				}
			},
      mappedService() {
        if (!this.clientInfo.services) return []
        const services = [
          ...new Set(
              this.clientInfo.services.filter(({services}) => services.length ).map(({ services })=> services[0].title)
          )
        ]
        return services
      },
			mappedIndustries() {
				if (this.clientInfo.services) {
					const servicesIndustries = [
						...new Set(
								this.clientInfo.services
										.filter(i => i.services.length ? i.services[0].title === this.selectedService : false)
										.map(i => i.industries[0].name)
						)
					]
					if (servicesIndustries.length === 1 && servicesIndustries[0].hasOwnProperty('name')) this.setIndustry({ option: servicesIndustries[0].name })
					return servicesIndustries
				}
			},
			// mappedComplianceTemplates() {
			// 	return this.complianceTemplates.map(i => i.title)
			// }
		},
    created() {
      // this.getLanguages()
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
			// DatepickerWithTime,
			SelectSingle,
			ClientTable,
      CheckBox,
      Instructions,
      SelectMulti,
      DatePicker,
      FormTemplate,
      TasksLangDuo,
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
    box-shadow: $box-shadow;
    border-radius: 4px;
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
      color: #d66f58;
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
      width: 220px;
    }

    &__projectName {
      font-size: 16px;
      color: #d66f58;
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

    &__select-block {
      min-height: 30px;
      position: relative;
    }

    &__checked {
      display: flex;
      margin: 10px 0;
      & span {
        margin-left: 5px;
      }
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
      font-size: 16px;
      padding-top: 30px;
      padding-bottom: 8px;
      font-family: 'Myriad600';

      &--order {
        font-size: 16px;
        padding-top: 20px;
        padding-bottom: 15px;
        font-family: 'Myriad600';
        border-bottom: 1px solid $border;
        margin-bottom: 15px;
      }
    }
    &__details {
      width: 500px;
      height: 400px;
      margin-top: 4px;
      border-radius: 4px;
      border: 1px solid #bfbfbf;
      padding: 5px;
      color: #333;
      box-sizing: border-box;
      word-wrap: break-word;
      overflow-x: auto;
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
      border: 1px solid $light-border;
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
      padding: 0 25px 25px 25px;
      width: 790px;
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
