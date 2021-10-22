<template lang="pug">
  .steps
    GeneralTable(
      :fields="fields"
      :tableData="steps"
    )

      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header(v-if="field.headerKey === 'headerCheck'")
          CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        //.table__header(v-if="field.headerKey === 'headerCheck' && isEdit")
        .table__header(v-else) {{ field.label }}
      template(slot="check" slot-scope="{ row, index }")
        .table__data
          CheckBox(:isChecked="row.check" @check="(e)=>toggleCheck(e, index, true)" @uncheck="(e)=>toggleCheck(e, index, false)" customClass="tasks-n-steps")

      //template(slot="id" slot-scope="{ row }")
        .table__data {{ row.taskId.substring(row.taskId.length - 3) }}
      template(slot="name" slot-scope="{ row }")
        .table__data {{ row.stepAndUnit.step.title }}
      template(slot="language" slot-scope="{ row }")
        .table__data(v-html="getStepPair(row)")

      template(slot="vendor" slot-scope="{ row, index }")
        //.table__drop(v-if="isVendorSelect(row.status)")
        //  PersonSelect(
        //    :persons="extendedVendors(index)"
        //    :selectedPerson="vendorName(row.vendor)"
        //    :isExtended="isAllShow"
        //    :isAdditionalShow="isAdditionalShow"
        //    @setPerson="(person) => setVendor(person, index)"
        //    @togglePersonsData="toggleVendors"
        //    @scrollDrop="personSelectDrop(row)"
        //    @removeVendorFromStep="removeVendorFromStep"
        //  )

        .table__data(v-if="row.vendor") {{ vendorName(row.vendor) }}
          //.steps__vendor-replace(v-if="row.vendor && row.status === 'Started'")
          //  .steps__replace-icon(@click="showReassignment(index)")
          //    i.fas.fa-exchange-alt
          //  .steps__tooltip Reassign Vendor
        .table__data(v-else) No Vendor

      template(slot="start" slot-scope="{ row, index }")
        .table__data
          Datepicker(
            @selected="(e) => changeDate(e, 'start', row.stepId)"
            v-model="row.start"
            inputClass="steps__custom-input"
            calendarClass="steps__calendar-custom"
            :format="customFormatter"
            monday-first=true
            :disabledPicker="isDatePickDisabled"
            :highlighted="highlighted"
            @scrollDrop="scrollDrop"
          )

      template(slot="deadline" slot-scope="{ row, index }")
        .table__data
          Datepicker(
            @selected="(e) => changeDate(e, 'deadline', row.stepId)"
            v-model="row.deadline"
            inputClass="steps__custom-input"
            calendarClass="steps__calendar-custom"
            :format="customFormatter"
            monday-first=true
            :disabled="disabled"
            :disabledPicker="isDatePickDisabled"
            :highlighted="highlighted"
            @scrollDrop="scrollDrop"
          )

      //template(slot="progress" slot-scope="{ row, index }")
        .table__data(style="width: 100%")

      template(slot="status" slot-scope="{ row, index }")
        .table__statusAndProgress
          .status {{ row.status | stepsAndTasksStatusFilter }}
          .progress
            ProgressLineStep(:progress="progress(row.progress)" :status="row.status" :lastProgress="lastProgress(row, index)")

      template(slot="receivables" slot-scope="{ row }")
        .table__finance
          //span(v-if="isShowValue(row, 'receivables')")
          //  span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          //  span(v-if="row.finance.Price.receivables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.receivables).toFixed(2) }}
          //  span(v-if="row.finance.Price.hasOwnProperty('halfReceivables')") {{ (row.finance.Price.halfReceivables).toFixed(2) }}

      template(slot="payables" slot-scope="{ row }")
        .table__finance
          //span(v-if="isShowValue(row, 'payables')")
          //  span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          //  span(v-if="row.finance.Price.payables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.payables).toFixed(2) }}
          //  span(v-if="row.finance.Price.hasOwnProperty('halfPayables')") {{ (row.finance.Price.halfPayables).toFixed(2) }}

      template(slot="margin" slot-scope="{ row, index }")
        .table__finance(:id="'margin'+index")
          //span(v-if="marginCalc(row)")
          //  span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          //span(v-if="marginCalc(row)") {{ marginCalc(row) }}
          //sup(:class="{'red-color': (+marginCalcPercent(row) > 1 && +marginCalcPercent(row) < 50) || +marginCalcPercent(row) < 0  }" v-if="marginCalc(row)") {{ marginCalcPercent(row) }}%

      template(slot="info" slot-scope="{row, index}")
        .table__space-between
          img(src="../../../assets/images/latest-version/view-details.png" style="cursor: pointer;" @click="showStepDetails(index)")
          img(src="../../../assets/images/latest-version/view-details.png" style="cursor: pointer;" @click="showFinanceEditing(index)")
</template>

<script>
import GeneralTable from '../../GeneralTable'
import CheckBox from '../../CheckBox'
import Datepicker from '../../Datepicker'
import ProgressLineStep from '../../ProgressLineStep'
import scrollDrop from "../../../mixins/scrollDrop"

export default {
  mixins: [ scrollDrop],
  name: "NewSteps",
  props: {
    steps: {
      type: Array,
      default: []
    }
  },
  data() {
    return {

      fields: [
        { label: "Check", headerKey: "headerCheck", key: "check", style: { "width": "3%" } },
        // { label: "Id", headerKey: "headerId", key: "id", style: { "width": "4%" } },
        { label: "Step", headerKey: "headerName", key: "name", style: { "width": "10%" } },
        { label: "Languages", headerKey: "headerLanguage", key: "language", style: { "width": "10%" } },
        { label: "Vendor", headerKey: "headerVendor", key: "vendor", style: { "width": "18%" } },
        { label: "Status", headerKey: "headerStatus", key: "status", style: { "width": "10%" } },
        // { label: "Progress", headerKey: "headerProgress", key: "progress", style: { "width": "8%" } },
        { label: "Start", headerKey: "headerStart", key: "start", style: { "width": "10%" } },
        { label: "Deadline", headerKey: "headerDeadline", key: "deadline", style: { "width": "10%" } },
        { label: "Rec.", headerKey: "headerReceivables", key: "receivables", style: { "width": "8%" } },
        { label: "Pay.", headerKey: "headerPayables", key: "payables", style: { "width": "8%" } },
        { label: "Margin", headerKey: "headerMargin", key: "margin", style: { "width": "11%" } },
        { label: "", headerKey: "headerInfo", key: "info", style: { "width": "6%" } },
      ],
    }
  },
  methods: {
    getStepPair(step) {
      return `<span>${ step.sourceLanguage }</span><span> &#8811; </span><span>${ step.targetLanguage }</span>`
    },
    progress(prog) {
      return prog.hasOwnProperty('totalWordCount') ? +((prog.wordsDone / prog.totalWordCount) * 100).toFixed(2) : +prog
    },
    lastProgress(step, index) {
      if (step.stepId.includes('R')) {
        const prevStep = this.currentProject.steps[index - 1]
        if (prevStep.finance.Price.hasOwnProperty('halfReceivables') && prevStep.finance.Price.halfReceivables > 0) {
          return ((prevStep.progress.wordsDone / prevStep.progress.totalWordCount) * 100).toFixed(2)
        }
      }
      return 0
    },
    vendorName(vendor) {
      const surname = vendor && (vendor.surname && vendor.surname !== "undefined") ? vendor.surname : ""
      return vendor ? vendor.firstName + ' ' + surname : ""
    },
  },
  components: {
    GeneralTable,
    CheckBox,
    Datepicker,
    ProgressLineStep,
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";
.table {
  width: 100%;

  &__data {
    padding: 0 7px;
  }

  &__header {
    padding: 0 7px;
  }

  &__drop {
    position: relative;
    height: 32px;
    max-width: 220px;
    margin: 0 7px;
    width: 100%;
    background: white;
    border-radius: 4px;
  }

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 8px;
  }

  &__icon {
    cursor: pointer;
    opacity: 0.5;
  }

  &__opacity {
    opacity: 1;
  }

  &__input {
    width: 100%;
    padding: 0 7px;
  }

  &__statusAndProgress {
    width: 100%;
    padding: 0 6px;
  }
  &__space-between {
    padding: 0 6px;
    word-break: break-word;
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  width: 100%;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}
</style>