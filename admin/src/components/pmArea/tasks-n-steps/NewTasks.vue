<template lang="pug">
  .tasks
    GeneralTable(
      :fields="fields"
      :tableData="tasks"
    )

      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header(v-if="field.headerKey === 'headerCheck'")
          CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        //.table__header(v-if="field.headerKey === 'headerCheck' && isEdit")
        .table__header(v-else) {{ field.label }}

      template(slot="check" slot-scope="{ row, index }")
        .table__data
          CheckBox(:isChecked="row.isChecked" @check="(e)=>toggleCheck(e, index, true)" @uncheck="(e)=>toggleCheck(e, index, false)" customClass="tasks-n-steps")
      template(slot="fileDetails" slot-scope="{row, index}")
        .table__data(style="cursor: pointer;" @click="showFileDetails(index)")
          img(src="../../../assets/images/latest-version/files.png")
      template(slot="taskId" slot-scope="{ row }")
        .table__data {{ row.taskId.substring(row.taskId.length - 3) }}
      template(slot="service" slot-scope="{ row }")
        .table__data {{ row.service.title }}
      template(slot="language" slot-scope="{ row }")
        .table__data(v-html="getPair(row)")
      template(slot="status" slot-scope="{ row, index }")
        .table__statusAndProgress
          .status {{ row.status | stepsAndTasksStatusFilter }}
          .progress
            ProgressLine(:progress="progress(row.progress)" :status="row.status")

      template(slot="receivables" slot-scope="{ row }")
        .table__data
          span -
          //span(v-if="row.finance.Price.receivables || row.finance.Price.receivables === 0")
          //  span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          //span(v-if="row.finance.Price.receivables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.receivables).toFixed(2) }}
          //span(v-if="row.finance.Price.halfReceivables && row.status === 'Cancelled Halfway'") {{ (row.finance.Price.halfReceivables).toFixed(2) }}

      template(slot="payables" slot-scope="{ row }")
        .table__data
            span -
        //  span(v-if="row.finance.Price.payables || row.finance.Price.payables === 0")
        //    span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
        //  span(v-if="row.finance.Price.payables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.payables).toFixed(2) }}
        //  span(v-if="row.finance.Price.halfPayables && row.status === 'Cancelled Halfway'") {{ (row.finance.Price.halfPayables).toFixed(2) }}

      template(slot="margin" slot-scope="{ row, index }")
        .table__data
          span -
          //span(v-if="marginCalc(row)")
          //  span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          //span(v-if="marginCalc(row)") {{ marginCalc(row) }}
          //sup(:class="{'red-color': (+marginCalcPercent(row) > 1 && +marginCalcPercent(row) < 50) || +marginCalcPercent(row) < 0  }" v-if="marginCalc(row)") {{ marginCalcPercent(row) }}%

      template(slot="delivery" slot-scope="{ row }")
        .table__data
          img.tasks__delivery-image(v-if="row.status.indexOf('Pending Approval') !== -1" src="../../../assets/images/latest-version/delivery-list.png" @click="reviewForDelivery(row)")

</template>

<script>
import GeneralTable from '../../GeneralTable'
import CheckBox from '../../CheckBox'
import ProgressLine from '../../ProgressLine'
export default {
  name: "NewTasks",
  props: {
    tasks: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      fields: [
        { label: "check", headerKey: "headerCheck", key: "check", style: { "width": "3%" } },
        { label: "Service", headerKey: "headerService", key: "service", style: { "width": "10%" } },
        { label: "Languages", headerKey: "headerLanguage", key: "language", style: { "width": "11%" } },
        { label: "Status", headerKey: "headerStatus", key: "status", style: { "width": "11%" } },
        { label: "Rec.", headerKey: "headerReceivables", key: "receivables", style: { "width": "8%" } },
        { label: "Pay.", headerKey: "headerPayables", key: "payables", style: { "width": "8%" } },
        { label: "Margin", headerKey: "headerMargin", key: "margin", style: { "width": "9%" } },
        { label: "", headerKey: "headerDelivery", key: "delivery", style: { "width": "4%" } }
      ],
    }
  },
  methods: {
    getPair(task) {
      return `<span>${ task.sourceLanguage }</span><span> &#8811; </span><span>${ task.targetLanguage }</span>`
    },
    progress(task) {
      let progress = 20

      return progress.toFixed(2)
    },
    toggleCheck(e, index, val) {
      this.tasks[index].isChecked = val
      // this.setProjectProp({ value: this.tasks, prop: 'tasks' })
    },
    toggleAll(e, val) {
      const tasks = this.tasks.reduce((acc, cur) => {
        acc.push({ ...cur, isChecked: val })
        return acc
      }, [])
      // this.setProjectProp({ value: tasks, prop: 'tasks' })
    },
  },
  components: {
    GeneralTable,
    CheckBox,
    ProgressLine,
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