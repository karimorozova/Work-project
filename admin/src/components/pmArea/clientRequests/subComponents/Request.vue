<template lang="pug">
  .project(v-if="user._id && project._id" )
    .project__all-info
      .project__info-row
        input.project__name(type="text" v-model="project.projectName" @change="changeProjectName(project.projectName)" placeholder="Project Name" :disabled="!canUpdateRequest")


      .project__detailsRow
        .project__detailsRow-client
          .client
            .client__details
              .project__detailsRow-client-title
                router-link(class="link-to" :to="{path: `/pangea-clients/all/details/${ project.customer._id }`}" target="_blank")
                  span {{ project.customer.name }}
              .project__detailsRow-client-subtitle {{ project.clientBillingInfo && project.clientBillingInfo.name || 'Billing information absent...' }}
              .project__detailsRow-client-text {{ project.industry.name }}

        .project__detailsRow-dates
          .project__date
            .input-title
              .input-title__text Deadline:
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
              :disabled="!canUpdateRequest"
              prefix-class="xmx"
            )

            //DatepickerWithTime(
            //  v-model="project.deadline"
            //  @selected="(e) => updateProjectDate(e, 'deadline')"
            //  monday-first=true
            //  inputClass="datepicker-custom-project-info"
            //  calendarClass="calendar-custom"
            //  :format="customFormatter"
            //  :disabledPicker="!canUpdateRequest"
            //  :disabled="disabled"
            //  ref="deadline"
            //)
            //.project__calendar-icon( @click="deadlineOpen")
            //  i.far.fa-calendar-alt


      .project__block-row.project_no-margin
        .project__block
          .block__header(@click="toggleBlock('isBrief')" )
            .title Project Instructions
            .icon(v-if="!isBrief")
              i.fas.fa-chevron-down
            .icon(v-else)
              i.fas.fa-chevron-right
          .block__data(v-if="isBrief")
            ckeditor(v-model="project.brief" :config="editorConfig" @blur="updateBrief")
        .project__block
          .block__header(@click="toggleBlock('isNotes')" )
            .title Project Notes
            .icon(v-if="!isNotes")
              i.fas.fa-chevron-down
            .icon(v-else)
              i.fas.fa-chevron-right
          .block__data(v-if="isNotes")
            ckeditor(v-model="project.notes" :config="editorConfig" @blur="updateNotes")

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

import DatePicker from 'vue2-datepicker'
import '../../../../assets/scss/datepicker.scss'

import CKEditor from "ckeditor4-vue"
import '../../../../assets/scss/ckeditor.scss'

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
      managers: [],
      isBrief: false,
      isNotes: false,
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
          { name: 'styles', groups: [ 'styles' ] },
          { name: 'colors', groups: [ 'colors' ] },
          { name: 'tools', groups: [ 'tools' ] },
          { name: 'others', groups: [ 'others' ] },
          { name: 'about', groups: [ 'about' ] }
        ],
        removeButtons: 'Source,Save,NewPage,ExportPdf,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Find,Replace,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Select,ImageButton,HiddenField,Button,Superscript,Subscript,CopyFormatting,NumberedList,Blockquote,CreateDiv,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,BidiLtr,BidiRtl,Language,Anchor,HorizontalRule,Table,Flash,PageBreak,Iframe,Styles,Format,Font,FontSize,ShowBlocks,Maximize,About',
        uiColor: "#ffffff",
        height: 240
      }
    }
  },
  methods: {
    ...mapActions([
      "alertToggle",
      "setProjectDate",
      "setCurrentProject",
      "updateClientsRequestsProps"
    ]),
    notBeforeStartDate(date) {
      return date < new Date()
    },
    toggleBlock(prop) {
      if (this[prop]) {
        this.updateBrief()
        this.updateNotes()
      }
      this[prop] = !this[prop]
    },
    // async choseBillingInfo({ option }) {
    //   const billingInfo = this.billingInfoList.find(({ name }) => name === option)
    //   await this.setRequestProp({ prop: 'clientBillingInfo', value: billingInfo })
    //   await this.setRequestProp({ prop: 'paymentProfile', value: billingInfo.paymentType })
    // },
    async updateBrief() {
      await this.setRequestProp({ prop: 'brief', value: this.project.brief })
    },
    async updateNotes() {
      await this.setRequestProp({ prop: 'notes', value: this.project.notes })
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
    // async setSameDate(e) {
    // 	this.isBilling = e.target.checked
    // 	e.target.checked ?
    // 			this.updateProjectDate(this.$refs.deadline.value, 'billingDate') :
    // 			this.updateProjectDate(this.$refs.billingDate.value, 'billingDate')
    // },
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
    }
    // async checkForErrors() {
    //   this.errors = []
    //   if (!this.project.projectName) {
    //     this.errors.push("Please, enter valid Project name.")
    //     this.project.projectName = this.project.projectName.replace(/( *[^\w\s\.]+ *)+/g, ' ').trim().replace(/^\d+( ?\d*)*/g, '')
    //   }
    //   if (!this.project.startDate) this.errors.push("Please, set the start date.")
    //   if (!this.project.deadline) this.errors.push("Please, set the deadline date.")
    //   if (!this.project.customer.name) this.errors.push("Please, select a Client.")
    //   if (!this.selectedIndustry) this.errors.push("Please, choose an industry.")
    //   if (this.errors.length) {
    //     this.areErrorsExist = true
    //     return
    //   }
    //   try {
    //     await this.createProject()
    //     await this.clientCreateProjectDate()
    //   } catch (err) {
    //     this.alertToggle({ message: "Server error on creating a new Project", isShow: true, type: "error" })
    //   }
    // },
    // async clientCreateProjectDate() {
    //   const formatDate = moment(new Date().getTime()).format('DD-MM-YYYY')
    //   await this.$http.post('/clientsapi/client-project-date', {
    //     date: formatDate,
    //     clientId: this.project.customer
    //   })
    // },
    // async createProject() {
    //   this.project.dateFormatted = moment(this.project.startDate).format('YYYY MM DD')
    //   this.project.industry = this.selectedIndustry._id
    //   const customer = { ...this.project.customer }
    //   this.project.customer = customer._id
    //   this.project.isTest = this.isTest
    //   try {
    //     const newProject = await this.$http.post("/pm-manage/new-project", { project: this.project, user: this.user })
    //     this.$emit('projectCreated', { project: newProject.data, customer: customer })
    //     this.alertToggle({ message: "New Project has been created", isShow: true, type: "success" })
    //   } catch (err) {
    //     this.alertToggle({ message: "Server error on creating a new Project", isShow: true, type: "error" })
    //   }
    // },
    // startOpen() {
    //   this.$refs.start.showCalendar()
    // },
    // deadlineOpen() {
    //   this.$refs.deadline.showCalendar()
    // },
    // billingOpen() {
    //   this.$refs.billingDate.showCalendar()
    // },
    // goToClientInfo() {
    //   const route = this.$router.resolve({ path: `/pangea-clients/all/details/${ this.project.customer._id }` })
    //   window.open(route.href, "_blank")
    // }
    // isBillingDate() {
    //   if (this.project.deadline === "") {
    //     this.isBilling = false
    //   } else {
    //     this.isBilling = this.project.deadline === this.project.billingDate
    //   }
    // },
    // async setDefaultClientBI() {
    //   if (this.billingInfoList.length === 1) {
    //     const [ billingInfo ] = this.billingInfoList
    //     await this.setRequestProp({ prop: 'clientBillingInfo', value: billingInfo })
    //     await this.setRequestProp({ prop: 'paymentProfile', value: billingInfo.paymentType })
    //   }
    // }
  },
  computed: {
    ...mapGetters({
      industries: "getAllIndustries",
      user: "getUser"
    }),
    // billingInfoList() {
    //   if (this.project.customer.billingInfo && this.project.customer.billingInfo.length) {
    //     const billingInfo = this.project.customer.billingInfo
    //     return billingInfo.map(({ _id, officialName, paymentType, name }) => ({ _id, officialName, paymentType, name }))
    //   }
    //   return []
    // },
    // existProjectAccessChangeName() {
    //   if (this.project) {
    //     const { status } = this.project
    //     return status === 'Draft' || status === 'Quote sent'
    //   }
    // },
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
    // nameOfProject() {
    //   return this.project.isUrgent ? this.project.projectName + " URGENT" : this.project.projectName
    // },
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
          || this.project.accountManager._id === this.user._id
    }
  },
  components: {
    SelectSingle,
    SelectMulti,
    Datepicker,
    LabelValue,
    Button,
    ValidationErrors,
    DatePicker,
    ckeditor: CKEditor.component

  },
  mounted() {
    // this.isBillingDate()
    // this.setDefaultClientBI()
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.client {
  display: flex;

  &__details {
    border-left: 2px solid $light-border;
    padding-left: 20px;
    height: fit-content;
  }
}

.input-title {
  display: flex;

  &__text {
    margin-bottom: 3px;
  }
}


.block {
  &__header {
    display: flex;
    justify-content: space-between;
    padding: 0px 10px;
    cursor: pointer;
    -webkit-box-align: center;
    transition: .2s ease;
    align-items: center;
    letter-spacing: .2px;
    border-radius: 4px;
    height: 36px;

    &-grey {
      background-color: white;
    }

    .title {
      font-size: 14px;
    }

    .icon {
      font-size: 13px;
      color: $text;
      margin-top: 2px;
    }
  }

  &__data {
    position: absolute;
    z-index: 300;
    box-shadow: $box-shadow;
    margin-top: 15px;
  }
}

.project {
  display: flex;
  flex-direction: column;
  width: 1040px;

  &__block {
    box-sizing: border-box;
    border: 1px solid $light-border;
    position: relative;
    border-radius: 4px;
    background-color: white;
    width: 482px;

    &-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      ::-webkit-input-placeholder {
        opacity: 0.5;
      }
    }
  }

  &__detailsRow {
    display: flex;
    margin-bottom: 25px;
    align-items: baseline;
    gap: 25px;

    &-finance {
      margin-left: 10px;
      display: flex;
    }

    &-client {

      &-title {
        font-size: 18px;
        font-family: 'Myriad900';
        margin-bottom: 7px;
        margin-top: 7px;
      }

      &-subtitle {
        font-family: 'Myriad600';
        margin-bottom: 7px;
        font-size: 14px;
      }

      &-text {
        margin-bottom: 7px;
        font-size: 14px;
      }
    }

    &-dates {
      width: 220px;
      margin-left: 20px;
    }
  }

  &__name {
    font-size: 18px;
    padding: 0 10px;
    height: 44px;
    width: 970px;
    border-radius: 4px;
    border: 1px solid $light-border;
    outline: none;
    color: $text;
    transition: .1s ease-out;
    font-family: Myriad600;
    display: flex;
    align-items: center;
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
    padding: 25px;
    box-shadow: $box-shadow;
    position: relative;
    background: white;
    border-radius: 4px;
  }

  &__info-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;

    ::-webkit-input-placeholder {
      opacity: 0.5;
    }
  }

  &__nameBody {
    width: 100%;
    margin-bottom: 10px;
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

  a {
    color: $text;
    text-decoration: none;
    transition: .2s ease-out;

    &:hover {
      text-decoration: underline;
    }
  }
}

#same,
#test {
  width: 0;
}

</style>
