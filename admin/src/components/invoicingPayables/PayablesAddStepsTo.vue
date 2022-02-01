<template lang="pug">
  .addContainer
    .addContainer__title Available Jobs
    .addContainer__table
      GeneralTable(
        :fields="fields",
        :tableData="steps",
        :isFilterShow="false"
        :isFilterAbsolute="false"
        :isBodyShort="true"
      )

        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header(v-if="field.headerKey === 'headerCheck'")
            CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
          .table__header(v-else) {{ field.label }}

        template(slot="check" slot-scope="{ row, index }")
          .table__data
            CheckBox(:isChecked="row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

        template(slot="project" slot-scope="{ row, index }")
          .table__data
            router-link(class="link-to" target='_blank' :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
              .short {{ row.projectName }}

        template(slot="stepId" slot-scope="{ row, index }")
          .table__data {{ row.steps.stepId }}

        template(slot="vendorName" slot-scope="{ row, index }")
          .table__data {{ row.currentVendor.firstName +' '+ row.currentVendor.surname || '-' }}

        template(slot="startDate" slot-scope="{ row, index }")
          .table__data {{ formattedDate(row.startDate) }}

        template(slot="deadline" slot-scope="{ row, index }")
          .table__data {{ formattedDate(row.deadline) }}

        template(slot="service" slot-scope="{ row, index }")
          .table__data {{ row.steps.stepAndUnit.step.title }}

        template(slot="jobStatus" slot-scope="{ row, index }")
          .table__data {{ row.steps.status }}

        template(slot="langPair" slot-scope="{ row, index }")
          .table__data {{ row.steps.sourceLanguage}}
            span(style="font-size: 12px;color: #999999;margin: 0 4px;")
              i(class="fas fa-angle-double-right")
            | {{ row.steps.targetLanguage }}

        template(slot="payables" slot-scope="{ row, index }")
          .table__data
            span.currency(v-html="'&euro;'")
            span {{ row.steps.nativeFinance.Price.payables | roundTwoDigit}}

      .table__empty(v-if="!steps.length") Nothing found...

      .table__buttons
        Button(v-if="steps.length" class="add-button" value="Add Jobs" :isDisabled="!isOptionToCreateReport" @clicked="sendTasks")
        Button(class="add-button" :outline="true" value="Close" @clicked="closeTable")

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
          style: { width: "2.2%" }
        },
        {
          label: "Projects",
          headerKey: "headerProject",
          key: "project",
          style: { width: "13%" }
        },
        {
          label: "Step ID",
          headerKey: "headerStepId",
          key: "stepId",
          style: { width: "16%" }
        },
        {
          label: "Vendor",
          headerKey: "headerVendorName",
          key: "vendorName",
          style: { width: "13%" }
        },
        {
          label: "Step",
          headerKey: "headerService",
          key: "service",
          style: { width: "11%" }
        },
        {
          label: "Language Pair",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { width: "9%" }
        },
        {
          label: "Start Date",
          headerKey: "headerStartDate",
          key: "startDate",
          style: { width: "9%" }
        },
        {
          label: "Deadline",
          headerKey: "headerDeadline",
          key: "deadline",
          style: { width: "9%" }
        },
        {
          label: "Status",
          headerKey: "headerJobStatus",
          key: "jobStatus",
          style: { width: "9%" }
        },
        {
          label: "Fee",
          headerKey: "headerPayables",
          key: "payables",
          style: { width: "8.8%" }
        }
      ]
    }
  },
  methods: {
    closeTable() {
      this.$emit('closeTable')
    },
    formattedDate(date) {
      return moment(date).format('MMM D, HH:mm')
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
        await this.$http.post(`/invoicing-payables/report/${ this.invoicingEditId }/steps/add`, {
          checkedProjects: checkedProjects.map(({ steps }) => steps._id),
          createdBy: this.user._id
        })
        this.$emit('refreshReports')
      } catch (e) {
        console.log(e)
      }
    }
  },
  computed: {
    ...mapGetters({
      user: "getUser"
    }),
    isOptionToCreateReport() {
      if (this.steps.length) {
        return this.steps.some(item => item.isCheck)
      }
      return false
    }
  },
  components: {
    GeneralTable,
    CheckBox,
    Button
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.addContainer {
  &__table {
    //margin-top: 40px;
  }

  &__title {
    font-size: 16px;
    font-family: 'Myriad600';
    margin-top: 25px;
    margin-bottom: 10px;
  }
}

.add-button {
  margin-top: 20px;
}

.table {
  &__buttons {
    display: flex;
    gap: 20px;
  }

  &__header,
  &__data {
    padding: 0 7px;
  }

  &__data {
    width: 100%;
  }

  &__empty {
    margin-top: 10px;
  }

}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.short {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 165px;
}

a {
  color: inherit;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}
</style>