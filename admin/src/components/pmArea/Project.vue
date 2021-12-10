<template lang="pug">
  .project
    .project__all-info
      .project__info-row
        input.project__name(v-if="existProjectAccessChangeName" type="text" v-model="project.projectName" @change="changeProjectName(project.projectName)" placeholder="Project Name")
        .project__name(style="border: 1px solid white;" v-else) {{ project.projectName }}

        .textCheckbox(v-if="!isProjectFinished")
          CheckBox(
            :isChecked="project.isTest"
            :isWhite="true"
            @check="() => setTest(true)"
            @uncheck="() => setTest(false)"
          )
          .textCheckbox__label Test
        .textCheckbox(v-else)
          .textCheckbox__label {{ project.isTest  ? 'Test project' : '' }}

      .project__detailsRow
        .project__detailsRow-client
          .client
            .client__pie(v-if="hasSomeStepsVendor")
              .pie-chart(:style="{'--percentage' : getPayablesPercent + '%'}")
                .inner
                  .pieText
                    .pieDescription
                      .pieDescription__icon(style="background: #EAC0BB;")
                      .pieDescription__text {{getPayablesPercent}}%
                    .pieDescription
                      .pieDescription__icon(style="background: #A9D3D1;")
                      .pieDescription__text {{getMargin}}%

            .client__details
              .project__detailsRow-client-title
                router-link(class="link-to" :to="{path: `/pangea-clients/all/details/${ project.customer._id }`}" target="_blank")
                  span {{ project.customer.name }}
              .project__detailsRow-client-subtitle {{ project.clientBillingInfo.name }}
              .project__detailsRow-client-text {{ project.industry.name }}
              .project__detailsRow-client-text Start at {{ customFormatter( project.startDate ) }}

        .project__detailsRow-finance
          .project__detailsRow-finance-blocks
            .block
              .block__value
                .block__value-title {{getPayables}}
                .block__value-icon( v-html="returnIconCurrencyByStringCode(project.projectCurrency)")
              .block__key Payables
            .block
              .block__value
                .block__value-title {{getProfit}}
                .block__value-icon(v-html="returnIconCurrencyByStringCode(project.projectCurrency)")
              .block__key Profit

          .project__detailsRow-finance-blocks
            .block
              .block__value
                .block__value-title {{getReceivables}}
                .block__value-icon(v-html="returnIconCurrencyByStringCode(project.projectCurrency)")
              .block__key Receivables
            .block
              .block__value
                .block__value-title {{getMargin}}
                .block__value-icon(v-if="getMargin !== '-'") %
              .block__key Margin

          .project__detailsRow-finance-blocks
            .block
              .block__value
                .block__value-title {{getTotalClient}}
                .block__value-icon(v-html="returnIconCurrencyByStringCode(project.projectCurrency)")
              .block__key Total
            .block
              .block__value
                .block__value-title {{getROI}}
                .block__value-icon(v-if="getROI !== '-'") %
              .block__key Roi

        .project__detailsRow-dates
          .project__date(style="margin-bottom: 12px; margin-top: -6px;")
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
              :disabled="isProjectFinished"
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
              prefix-class="xmx"
              :disabled="isProjectFinished"
            )

      .project__block-row.project_no-margin
        .project__block
          .block__header(@click="toggleBlock('isBrief')")
            .title Project Instructions
            .icon(v-if="!isBrief")
              i.fas.fa-chevron-down
            .icon(v-else)
              i.fas.fa-chevron-right
          .block__data(v-if="isBrief")
            ckeditor(v-model="project.brief" :config="editorConfig" @blur="updateBrief")
        .project__block
          .block__header(@click="toggleBlock('isNotes')")
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
import SelectSingle from "../SelectSingle"
import SelectMulti from "../SelectMulti"
import ValidationErrors from "../ValidationErrors"
import Datepicker from "../Datepicker"
import LabelValue from "./LabelValue"
import Button from "../Button"
import CheckBox from "../CheckBox"
import moment from "moment"
import { mapGetters, mapActions } from "vuex"
import DatepickerWithTime from "../DatepickerWithTime"
import currencyIconDetected from "../../mixins/currencyIconDetected"
import CKEditor from "ckeditor4-vue"
import '../../assets/scss/ckeditor.scss'

import DatePicker from 'vue2-datepicker'
import '../../assets/scss/datepicker.scss'

export default {
  mixins: [ currencyIconDetected ],
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
          { name: 'styles', groups: [ 'styles' ] },
          { name: 'colors', groups: [ 'colors' ] },
          { name: 'tools', groups: [ 'tools' ] },
          { name: 'others', groups: [ 'others' ] },
          { name: 'about', groups: [ 'about' ] }
        ],
        removeButtons: 'Source,Save,NewPage,ExportPdf,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Find,Replace,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Select,ImageButton,HiddenField,Button,Superscript,Subscript,CopyFormatting,NumberedList,Blockquote,CreateDiv,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,BidiLtr,BidiRtl,Language,Anchor,HorizontalRule,Table,Flash,PageBreak,Iframe,Styles,Format,Font,FontSize,ShowBlocks,Maximize,About',
        uiColor: "#ffffff",
        height: 240
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
      isNotes: false
    }
  },
  methods: {
    ...mapActions([
      "alertToggle",
      "setProjectDate",
      "setCurrentProject"
    ]),
    toggleBlock(prop) {
      if (this[prop] && !this.isProjectFinished) {
        this.updateBrief()
        this.updateNotes()
      }
      this[prop] = !this[prop]
    },
    // notBeforeToday(date) {
    //   return date < new Date(new Date().setHours(0, 0, 0, 0));
    // },
    notBeforeStartDate(date) {
      return date < new Date(this.project.startDate)
    },
    async updateBrief() {
      if (this.isProjectFinished) return
      await this.setProjectProp({ prop: 'brief', value: this.project.brief })
    },
    async updateNotes() {
      if (this.isProjectFinished) return
      await this.setProjectProp({ prop: 'notes', value: this.project.notes })
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
      const date = { [prop]: e }
      await this.setProjectDate({ date, projectId: this.project._id })
    },
    async setTest(bool) {
      await this.setProjectProp({ prop: 'isTest', value: bool })
    },
    // async setSameDate(e) {
    // 	this.isBilling = e.target.checked
    // 		e.target.checked
    //         ? this.updateProjectDate(this.$refs.deadline.value, 'billingDate')
    // 				: this.updateProjectDate(this.$refs.billingDate.value, 'billingDate')

    // },
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
    // setCustomer({ option }) {
    // 	if (option.billingInfo.length === 1) {
    // 		this.setBillingInfo(option.billingInfo[0])
    // 	} else {
    // 		this.setBillingInfo('')
    // 	}
    // 	this.$emit('setValue', { option, prop: 'customer' })
    // },
    // async choseBillingInfo({ option }) {
    // 	const billingInfo = this.billingInfoList.find(({ name }) => name === option)
    //   await this.setProjectProp({ prop: 'clientBillingInfo', value: billingInfo })
    //   await this.setProjectProp({ prop: 'paymentProfile', value: billingInfo.paymentType })
    // },
    // setBillingInfo(billingInfo) {
    // 	this.$emit('setValue', { option: billingInfo, prop: 'clientBillingInfo' })
    // },
    // setIndustry({ option }) {
    // 	this.selectedIndustry = option
    // },
    closeErrors() {
      this.areErrorsExist = false
    },
    async checkForErrors() {
      debugger
      this.errors = []
      if (!this.project.projectName) {
        this.errors.push("Please, enter valid Project name.")
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
    }
    // isBillingDate() {
    // 	if (this.$refs.deadline.value === "") {
    // 		this.isBilling = false
    // 	} else {
    //     this.isBilling = this.$refs.deadline.value.valueOf() === this.$refs.billingDate.value.valueOf()
    //   }
    // },
    // setIsBillingTrue() {
    // 	this.isBilling = true
    // }
  },
  computed: {
    ...mapGetters({
      industries: "getAllIndustries",
      user: "getUser"
    }),
    getMargin() {
      const { payables, receivables } = this.project.finance.Price
      const margin = Math.round(100 - (payables / receivables) * 100)
      return isNaN(margin) || !isFinite(margin) ? '-' : margin
    },
    getROI() {
      const { payables, receivables } = this.project.finance.Price
      const roi = Math.round(((receivables - payables) / payables) * 100)
      return isNaN(roi) || !isFinite(roi) ? '-' : roi
    },
    getReceivables() {
      const { receivables } = this.project.finance.Price
      return +(receivables.toFixed(2))
    },
    getPayables() {
      const { payables } = this.project.finance.Price
      return +(payables.toFixed(2))
    },
    getPayablesPercent() {
      const { payables, receivables } = this.project.finance.Price
      return Math.round((payables / receivables) * 100)
    },
    getProfit() {
      const { payables, receivables } = this.project.finance.Price
      return +(receivables - payables).toFixed(2)
    },
    getTotalClient() {
      const { receivables } = this.project.finance.Price
      const additionsStepsSum = this.project.additionsSteps.reduce((acc, { finance }) => acc += finance.Price.receivables, 0)
      return +(+receivables + +additionsStepsSum).toFixed(2)
    },
    hasSomeStepsVendor() {
      return this.project.steps.some((step) => step.hasOwnProperty('vendor') && !!step.vendor)
    },
    existProjectAccessChangeName() {
      if (this.project) {
        const { status } = this.project
        return status === 'Draft' || status === 'Quote sent' || status === 'Cost Quote'
      }
    },
    billingInfoList() {
      if (this.project.customer.billingInfo && this.project.customer.billingInfo.length) {
        const billingInfo = this.project.customer.billingInfo
        return billingInfo.map(({ _id, paymentType, name }) => ({ _id, paymentType, name }))
      }
      return []
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
    CheckBox,
    ValidationErrors,
    ckeditor: CKEditor.component
  },
  async created() {
    // await this.getProjectData()
    // this.getCustomers()
    // this.isBillingDate()
    // !this.project._id && this.setIsBillingTrue()
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/scss/colors';

.pieDescription {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 2px 0;

  &__icon {
    height: 5px;
    width: 5px;
  }

  &__text {
    color: #9999;
    font-size: 12px;
  }
}

.pieText {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.client {
  display: flex;

  &__pie {
    margin-right: 20px;
  }

  &__details {
    border-left: 2px solid $light-border;
    padding-left: 20px;
    height: fit-content;
  }
}

.block {
  width: 100px;
  border: 1px dotted $border;
  flex-direction: column;
  align-items: center;
  padding: 6px 0px 4px 0px;
  border-radius: 4px;
  display: flex;
  margin: 10px 5px;

  &__value {
    display: flex;

    &-icon {
      font-size: 14px;
      color: $dark-border;
      margin-left: 3px;
    }
  }

  &__key {
    font-size: 12px;
    color: #3333;
    font-family: Myriad600;
    letter-spacing: .2px;
    text-transform: uppercase;
    margin-top: 2px;
  }
}

.input-title {
  display: flex;

  &__text {
    margin-bottom: 2px;
  }

  .require {
    color: $red;
    padding-left: 2px;
  }
}

.project {
  display: flex;
  flex-direction: column;

  &__detailsRow {
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px;
    align-items: center;

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

  &__block {
    box-sizing: border-box;
    border: 1px solid $light-border;
    position: relative;
    border-radius: 4px;
    background-color: white;

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
    margin-bottom: 25px;

    ::-webkit-input-placeholder {
      opacity: 0.5;
    }
  }

  &__nameBody {
    width: 100%;
    margin-bottom: 10px;
  }

  &__name {
    font-size: 18px;
    padding: 0 10px;
    height: 44px;
    width: 880px;
    border-radius: 4px;
    border: 1px solid $light-border;
    outline: none;
    color: $text;
    transition: .1s ease-out;
    font-family: Myriad600;
    display: flex;
    align-items: center;

    // &:focus {
    //   border: 1px solid $border-focus;
    // }
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
    width: 482px;
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
}

.textCheckbox {
  padding: 0 8px;
  // border: 1px solid $light-border;
  border-radius: 4px;
  height: 42px;
  transition: .2s ease-out;
  justify-content: center;
  color: $dark-border;
  cursor: default;
  display: flex;
  align-items: center;

  &__label {
    display: flex;
    align-items: center;
    margin-left: 6px;
    margin-bottom: 2px;
  }

  &:hover {
    color: $text;
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

#same,
#test {
  width: 0;
}

a {
  color: $text;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}

.pie-chart {
  font-size: 14px;
  display: grid;
  place-items: center;
  background: conic-gradient(#EAC0BB 0, #EAC0BB var(--percentage), #A9D3D1 0, #A9D3D1 100%);
  position: relative;
  width: 102px;
  height: 102px;
  margin: 0;
  border-radius: 50%;
}

.inner {
  position: relative;
  background: white;
  width: 90px;
  height: 90px;
  border-radius: 50%;
}

</style>
