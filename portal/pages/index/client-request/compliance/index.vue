<template lang="pug">
  .content

    .title(v-if="!isSent") Compliance form
    .content__body(v-if="!isSent")
      .content__form
        Validation-errors(v-if="showError"
          :errors="errors"
          :isAbsolute="true"
          @closeErrors="closeErrors")
        .form__title general information
        .form__part
          .form__row
            .form__col
              .form__select
                .form__input-title Project Name:
                .width-191
                  input(type="text" placeholder="Name" v-model="currentProjectName")
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
                  :bootstrapStyling="true"
                  :format="customFormatter"
                  inputClass="datepicker-custom-project-info"
                  calendarClass="calendar-custom"
                  :disabled="disabled"
                  ref="deadline"
                )
            .form__col
              .form__select(style="margin-top: 20px;")
                .form__input-title Industry:
                .width-191
                  SelectSingle(
                    :selectedOption="currentIndustries.name"
                    :options="mappedIndustries"
                    placeholder="Industry"
                    @chooseOption="(e) => setIndustry(e)"
                  )

        .form__title languages
        .form__part
          .form__row
            .form__col
              .form__select
                .form__input-title Source Language:
                .width-191
                  SelectSingle(
                    :selectedOption="currentSourceLang.lang"
                    :options="mappedSourceLanguages"
                    :hasSearch="true"
                    placeholder="Language"
                    @chooseOption="(e) => setSelectedOptionLanguages(e, 'currentSourceLang')"
                  )
            .form__col
              .form__select
                .form__input-title Target Language:
                .width-191
                  SelectSingle(
                    :selectedOption="currentTargetLang.lang"
                    :options="mappedTargetLanguages"
                    :hasSearch="true"
                    placeholder="Language"
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
            DataTable(
              :fields="fields"
              :tableData="files"
              :bodyClass="['review-body', {'tbody_visible-overflow': files.length < 6}]"
              :tableheadRowClass="files.length < 6 ? 'tbody_visible-overflow' : ''"
              :headCellClass="'padding-with-check-box'"
            )
              .form__header(slot="headerFile" slot-scope="{ field }") {{ field.label }}
              .form__header(slot="headerType" slot-scope="{ field }") {{ field.label }}
              .form__header(slot="headerIcon" slot-scope="{ field }") {{ field.label }}

              .form__data(slot="file" slot-scope="{ row }") {{row.name}}
              .form__data(slot="type" slot-scope="{ row }") {{row.type}}
              .form__dataIcon(slot="icon" slot-scope="{ row }")
                span(@click="(e) => deleteFile(e, row.name, row.type)")
                  i.fas.fa-trash

            Add(@add="openFileModal" id="add")

        .form__title Project Details
        .form__part
          .form__row
            .form__col
              .form__select
                .form__input-title Compliance Template:
                .width-191
                  SelectSingle(
                    :selectedOption="currentComplianceTemplate.title"
                    :options="mappedComplianceTemplates"
                    :hasSearch="true"
                    placeholder="Template"
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
                div(style="width: 575px")
                  textarea.form__textarea(rows="4" v-model="currentBrief")

        .form__ckeckbox
          TextRadio(
            :isChecked="startOption === 'Send'"
            title="Send a Quote"
            text="I approve for the project to begin immediately and I'll review the quote later."
            @check="(e) => setQuoteDecision('Send')"
          )
          TextRadio(
            :isChecked="startOption === 'Start'"
            title="Start Immediately"
            text="I approve for the project to begin immediately and to receive the quote just for reference."
            @check="(e) => setQuoteDecision('Start')"
          )
        .form__submit
          Button(@clicked="checkError" value="Submit" :isDisabled="!isCompleteForm")

      div(v-if="!isSent")
        .content__order
          .form__title Project contacts
          div(v-if="Object.keys(user).length")
            ClientTable(
              :currentContacts="currentContacts"
              :clientInfo="clientInfo"
              :user="user"
              @addContact="addContact"
              @setContact="setContact"
              @removeContact="removeContact"
            )

        .content__order
          .form__title--order your order

          .order__row(v-if="!!currentProjectName")
            .order__subTitle Project:
            .order__value {{currentProjectName}}
              .order__details(v-if="!!startOption") {{ startOption === 'Send' && '(Send a Quote)' || startOption === 'Start' && '(Start Immediately)'  }}

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
import SelectSingle from "../../../../components/dropdowns/SelectSingle"
import DatepickerWithTime from "../../../../components/DatepickerWithTime"
import moment from "moment"
import UploadFileButton from "../../../../components/buttons/UploadFileButton"
import TextRadio from "../../../components/forms/TextRadio"
import DataTable from "../../../../components/Tables/DataTable"
import Add from "../../../../components/buttons/Add"
import ClientTable from "../../../../components/ClientTable"
import Button from "../../../../components/buttons/Button"
import ClientRequestCompleted from "../../../../components/completedOrder/clientRequestCompleted"
import ValidationErrors from "../../../../components/ValidationErrors"
import error from "../../../../../vendor/layouts/error"

export default {
  data() {
    return {
      currentDeadline: '',
      currentProjectName: '',
      currentSourceLang: {},
      currentTargetLang: {},
      currentIndustries: {},
      refFiles: [],
      sourceFiles: [],
      currentBrief: '',
      startOption: '',
      currentComplianceTemplate: '',
      currentContacts: [],

      isSent: false,

      isFileModal: false,
      disabled: {
        to: moment().add(-1, 'day').endOf('day').toDate()
      },
      fields: [
        { label: "File Name", headerKey: "headerFile", key: "file", width: "70%" },
        { label: "File Type", headerKey: "headerType", key: "type", width: "20%" },
        { label: "", headerKey: "headerIcon", key: "icon", width: "10%" }
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
          description: '<li>Full name</li><li>Address</li><li>Issue date</li>'
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
    checkProjectName() {
      const regex = /^[A-Za-z][A-Za-z0-9\-\_ ]+((([A-Za-z0-9])+([\-\_])?)* *)*$/
      return regex.test(this.currentProjectName)
    },
    closeErrors() {

      this.showError = false
      this.errors = []
    },
    checkError() {
      this.closeErrors()

      if (!this.currentProjectName || (this.currentProjectName && !this.checkProjectName())) this.errors.push("Please, enter valid Project name.")
      if (new Set(this.files.map(({ name }) => name)).size !== this.files.length) this.errors.push("Please, do not select the same files.")

      if (this.errors.length > 0) {
        this.showError = true
      } else {
        this.addService()
      }
    },
    async addService() {
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

      if (this.refFiles.length) for (let file of this.refFiles) formData.append('refFiles', file)
      if (this.sourceFiles.length) for (let file of this.sourceFiles) formData.append('sourceFiles', file)

      try {
        await this.$axios.post('/portal/compliance-service', formData)
        this.isSent = true
      } catch (err) {

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

      this.currentIndustries = this.getClientIndustries.find(({ name }) => name === option)
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
      const filteredFiles = Array.from(files).filter(item => item.size < 50000000)
      this.sourceFiles = [ ...filteredFiles ]
      this.clearFileInput('sourceFiles')
    },
    setRefFiles({ files }) {
      const filteredFiles = Array.from(files).filter(item => item.size < 50000000)
      this.refFiles = [ ...filteredFiles ]
      this.clearFileInput('refFiles')
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
      clientSourceLanguages: "clientSourceLanguages",
      clientTargetLanguages: "clientTargetLanguages",
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
    	if(this.clientInfo.services){
    		return [...new Set(this.clientInfo.services.map(i => i.sourceLanguage.lang).filter(i => i !== 'English' && i !== 'English (United States)'))]
	    }
    },
    mappedTargetLanguages() {
	    if(this.clientInfo.services){
		    return [...new Set(this.clientInfo.services.map(i => i.targetLanguages[0].lang).filter(i => i !== 'English' && i !== 'English (United States)'))]
	    }
    },
    mappedIndustries() {
      if (this.getClientIndustries && this.getClientIndustries.length === 3) this.setIndustry({option: this.getClientIndustries[0].name})

      return this.getClientIndustries && this.getClientIndustries.map(i => i.name)
    },
    selectByDefault() {
      if(!this.mappedIndustries || this.mappedIndustries.length !== 1) return false
      // return this.getClientIndustries[0]
      return false
    },
    mappedComplianceTemplates() {
      return this.complianceTemplates.map(i => i.title)
    }
  },
  components: {
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
  },

}
</script>

<style lang="scss" scoped>

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
    margin-bottom: 10px;
  }

  &__subTitle {
    opacity: 0.6;
    width: 70px;
  }

  &__value {
    font-family: 'Myriad600';
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
    min-width: 140px;
  }

  &__input-title-margin9 {
    margin-top: 9px;
    display: flex;
    min-width: 140px;
  }

  &__title {
    font-size: 16px;
    padding-top: 20px;
    padding-bottom: 10px;
    text-transform: uppercase;
    font-family: 'Myriad900';

    &--order {
      font-size: 16px;
      padding-top: 20px;
      padding-bottom: 10px;
      text-transform: uppercase;
      font-family: 'Myriad900';
      border-bottom: 2px solid #f4f2f1;
    }
  }

  &__textarea {
    width: 100%;
    border: none;
    padding: 5px;
    outline: none;
    box-sizing: border-box;
    font-size: 14px;
    border: 1px solid #67573e;
    border-radius: 4px;
  }

  &__part {
    padding: 20px 10px;
    border: 2px solid #f4f2f1;
    border-radius: 4px;
    position: relative;
  }
}

.content {
  color: #67573e;

  &__body {
    display: flex;
    margin-bottom: 50px;
  }

  &__order {
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    padding: 0 20px 20px 20px;
    width: 240px;
    height: fit-content;
    margin-left: 40px;
    margin-bottom: 40px;
    /*position: fixed;*/
    /*left: 990px;*/
  }


  &__form {
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    padding: 0 20px 20px 20px;
    width: 740px;
    position: relative;
  }
}

.title {
  margin: 30px 0 10px;
  font-family: Myriad400;
  font-size: 20px;
  color: #67573e;
}

.width-191 {
  width: 191px;
  position: relative;
}

.width-310 {
  width: 310px;
  position: relative;
}

input {
  color: #67573e;
  border: 1px solid #67573e;
  border-radius: 4px;
  padding: 0 5px;
  outline: none;
  width: 191px;
  height: 30px;
  box-sizing: border-box;
}

::-webkit-input-placeholder {
  opacity: 0.5;
  color: #67573e;
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
