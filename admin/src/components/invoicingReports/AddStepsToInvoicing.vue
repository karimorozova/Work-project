<template lang="pug">
  .invoicing-reports-add
    .invoicing-reports-add__table
      GeneralTable(
        :fields="fields",
        :tableData="steps",
        :isFilterShow="false"
        :isFilterAbsolute="false"
      )

        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header(v-if="field.headerKey === 'headerCheck'")
            CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
          .table__header(v-else) {{ field.label }}

        template(slot="check" slot-scope="{ row, index }")
          .table__data
            CheckBox(:isChecked="row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

        template(slot="stepId" slot-scope="{ row, index }")
          .table__data {{ row.steps.stepId }}

        template(slot="vendorName" slot-scope="{ row, index }")
          .table__data {{ row.currentVendor.firstName +' '+ row.currentVendor.surname|| '-' }}

        template(slot="startDate" slot-scope="{ row, index }")
          .table__data {{ formattedDate(row.startDate) }}

        template(slot="deadline" slot-scope="{ row, index }")
          .table__data {{ formattedDate(row.deadline) }}

        template(slot="billingDate" slot-scope="{ row, index }")
          .table__data {{ formattedDate(row.billingDate) }}


        template(slot="service" slot-scope="{ row, index }")
          .table__data {{ row.steps.service.title }}


        template(slot="jobStatus" slot-scope="{ row, index }")
          .table__data {{ row.steps.status }}


        template(slot="langPair" slot-scope="{ row, index }")
          .table__data {{ row.steps.sourceLanguage}}
            span(style="font-size: 12px;color: #9c9c9c;margin: 0 2px;")
              i(class="fas fa-angle-double-right")
            | {{ row.steps.targetLanguage }}

        template(slot="payables" slot-scope="{ row, index }")
          .table__data {{ row.steps.nativeFinance.Price.payables | roundTwoDigit}}

      .table__empty(v-if="!steps.length") Nothing found...

      Button(class="add-button" value="Add Steps" @clicked="sendTasks")
</template>

<script>
import GeneralTable from '../GeneralTable'
import CheckBox from '../CheckBox'
import Button from '../Button'
import moment from "moment"
import { mapGetters } from "vuex"
import { getUser } from "../../vuex/general/getters"
export default {
  props: {
    invoicingEditId: {
      type: String,
      default: '0'
    },
    steps: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      isAllSelected: false,
      isDataRemain: true,
      fields: [
        {
          label: "",
          headerKey: "headerCheck",
          key: "check",
          style: { width: "2%" }
        },
        {
          label: "Step Id",
          headerKey: "headerStepId",
          key: "stepId",
          style: { width: "12%" }
        },
        {
          label: "Vendor Name",
          headerKey: "headerVendorName",
          key: "vendorName",
          style: { width: "12%" }
        },
        {
          label: "Project Start Date",
          headerKey: "headerStartDate",
          key: "startDate",
          style: { width: "11%" }
        },
        {
          label: "Project deadline",
          headerKey: "headerDeadline",
          key: "deadline",
          style: { width: "11%" }
        },
        {
          label: "Billing Date",
          headerKey: "headerBillingDate",
          key: "billingDate",
          style: { width: "11%" }
        },
        {
          label: "Step",
          headerKey: "headerService",
          key: "service",
          style: { width: "11%" }
        },
        {
          label: "Job Status",
          headerKey: "headerJobStatus",
          key: "jobStatus",
          style: { width: "11%" }
        },
        {
          label: "Language Pair",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { width: "11%" }
        },
        {
          label: "Fee ",
          headerKey: "headerPayables",
          key: "payables",
          style: { width: "11%" }
        },
      ]
    }
  },
  methods: {
    formattedDate(date) {
      return moment(date).format("DD-MM-YYYY");
    },

    toggleCheck(index, val) {
      this.steps[index].isCheck = val
    },
    toggleAll(val) {
      this.steps = this.steps.reduce((acc, cur) => {
        acc.push({ ...cur, isCheck: val })
        return acc
      }, [])
      this.isAllSelected = val
    },
    async sendTasks() {
      const checkedProjects = this.steps.filter(step => step.isCheck)
      try {
        await this.$http.post(`/invoicing-reports/report/${this.invoicingEditId}/steps/add`, {checkedProjects: checkedProjects.map(({ steps })=> steps._id), createdBy: this.user._id})
        this.$emit('refreshReports')
      }catch (e) {
        console.log(e)
      }
    },
  },
  computed: {
    ...mapGetters({
      user: "getUser"
    })

  },
  components: {
    GeneralTable,
    CheckBox,
    Button,
  }
}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";
  .invoicing-reports-add {
    //width: 1200px;
    //background: #fff;
    &__table {
      margin-top: 40px;
      //border-radius: 4px;
      //padding: 20px;
      //box-sizing: border-box;
      //box-shadow: 0 1px 2px 0 rgba(99,99,99,.3),0 1px 3px 1px rgba(99,99,99,.15);
    }
    &__title {
      display: flex;
      justify-content: end;
      margin-bottom: 10px;
    }
  }

  .add-button {
    margin-top: 10px;
  }

  .table {
    &__header,
    &__data {
      padding: 0 6px;
    }

    &__data {
      width: 100%;
    }

    &__icons {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 7px;
      width: 100%;
      height: 40px;

      &-info {
        cursor: help;
        color: $red;
        font-size: 16px;
      }

      &-link {
        cursor: pointer;
        font-size: 16px;
      }

      &-link-opacity {
        cursor: default;
        font-size: 16px;
        opacity: 0.5;
      }
    }
  }
  .icon-button {
    font-size: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: .2s ease-out;
    justify-content: center;
    color: $dark-border;

    &:hover {
      color: $text;

    }
  }
</style>