<template lang="pug">
  .tableMatrix
    GeneralTable(
      :fields="fields"
      :tableData="tableData"
      :isBodyShort="true"
    )
      template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
        .tableMatrix__head-title {{ field.label }}
      template(slot="empty", slot-scope="{ row, index }")
        .tableMatrix__data {{ row.text }}
      template(slot="1", slot-scope="{ row, index }")
        .tableMatrix__data(v-if="selectedTab === 'Receivables'") {{ row.client }}
        .tableMatrix__data(v-if="selectedTab === 'Payables'") {{ row.vendor }}
      template(slot="2", slot-scope="{ row, index }")
        .tableMatrix__data {{ row.value }}
      template(slot="3", slot-scope="{ row, index }")
        .tableMatrix__data(v-if="selectedTab === 'Receivables'") {{ calculatedRate(row.client, row.value) }}
        .tableMatrix__data(v-if="selectedTab === 'Payables'") {{ calculatedRate(row.vendor, row.value) }}
</template>

<script>
import { mapGetters } from "vuex"
import { isInteger } from "lodash"
import GeneralTable from "../../../GeneralTable"

export default {
  props: {
    step: {
      type: Object
    },
    selectedTab: {
      type: String
    },
    task: {
      type: Object
    }
  },
  data() {
    return {
      fields: [
        {
          label: "",
          headerKey: "headerEmpty",
          key: "empty",
          style: { width: "40%" }
        },
        {
          label: "%",
          headerKey: "headerTranslated",
          key: "1",
          style: { width: "20%" }
        },
        {
          label: "Source Word",
          headerKey: "headerRepetitions",
          key: "2",
          style: { width: "20%" }
        },
        {
          label: "Rate",
          headerKey: "headerContextMatch",
          key: "3",
          style: { width: "20%" }
        }
      ],
      tableData: []
    }
  },
  components: {
    GeneralTable
  },
  methods: {
    // findCurrentTask() {
    //   return this.currentProject.tasks.find(task => task.taskId === this.step.taskId)
    // },
    getStepMetrics() {
      const { metrics } = this.task
      return metrics
    },
    changeFormatForMetrics() {
      let arrayOfMetrics = []
      const subtitles = {
        subtitles: [ "%", "Source Word", "Rate" ]
      }
      for (let iterator in this.getStepMetrics()) {
        arrayOfMetrics.push(
            Object.assign(this.getStepMetrics()[iterator], subtitles)
        )
      }
      return arrayOfMetrics
    },
    calculatedRate(rate, wordCount) {
      rate === undefined && this.findCurrentTask()
      const currentNumber = (rate * wordCount) / 100
      return isInteger(currentNumber) ? currentNumber : currentNumber.toFixed(1)
    },
    buildMatrixArray() {
      let matrixArr = this.changeFormatForMetrics()
      if (!matrixArr[matrixArr.length - 1].hasOwnProperty('client')) {
        matrixArr.pop()
      }
      this.tableData = matrixArr
    }
  },
  computed: {
    // ...mapGetters({
    //   currentProject: "getCurrentProject"
    // })
  },
  mounted() {
    this.buildMatrixArray()
  }

}
</script>

<style lang="scss" scoped>
.tableMatrix {
  &__data,
  &__head-title {
    padding: 0 7px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }
}
</style>
