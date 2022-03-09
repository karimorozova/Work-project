<template lang="pug">
  .list-of-jobs
    GeneralTable(
      :fields="fields",
      :tableData="steps",
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header {{ field.label }}

      template(slot="project" slot-scope="{ row, index }")
        .table__data
          router-link(class="link-to" target= '_blank' :to="{path: `/pangea-projects/all-projects/All/details/${row.projectNativeId}`}")
            .short {{ row.projectName }}

      template(slot="stepId" slot-scope="{ row, index }")
        .table__data {{ row.stepId || '-' }}

      template(slot="service" slot-scope="{ row, index }")
        .table__data
          div(v-if="enumOfReports === 'vendor'" ) {{ row.stepAndUnit.step.title }}
          div(v-else) {{ row.type === 'Classic' ? row.stepAndUnit.step.title : row.title }}

      template(slot="langPair" slot-scope="{ row, index }")
        .table__data(v-if="row.sourceLanguage" )
          span {{ row.sourceLanguage }}
          span(style="font-size: 12px;color: #999999; margin: 0 4px;")
            i(class="fas fa-angle-double-right")
          span {{ row.targetLanguage }}
        .table__data(v-else) -

      template(slot="deadline" slot-scope="{ row, index }")
        .table__data {{ formattedDate(row.deadline) }}

      template(slot="status" slot-scope="{ row, index }")
        .table__data {{ row.status || 'Completed' }}

      template(slot="fee" slot-scope="{ row, index }")
        .table__data
          div(v-if="enumOfReports === 'vendor'" )
            span.currency(v-html="'&euro;'")
            span {{ +(row.nativeFinance.Price.payables).toFixed(2) }}
          div(v-else)
            span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
            span {{ +(row.finance.Price.receivables).toFixed(2) }}

      template(slot="icons", slot-scope="{ row, index }")
        .table__icons(
          v-if="isAvailableDeleting"
          :class="{'not-editable-icon': !!getRequestCounter}"
        )
          i(class="fas fa-trash" @click="requestToDelete(row._id)")

</template>

<script>
import GeneralTable from "../GeneralTable"
import moment from "moment"
import currencyIconDetected from "../../mixins/currencyIconDetected"
import { mapGetters } from "vuex"

export default {
  name: "ReportDetailsJobsList",
  mixins: [ currencyIconDetected ],
  components: { GeneralTable },
  props: {
    enumOfReports: {
      type: String
    },
    steps: {
      type: Array
    },
    isAvailableDeleting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Project",
          headerKey: "headerStepId",
          key: "project",
          style: { width: "20%" }
        },
        {
          label: "Step ID",
          headerKey: "headerStepId",
          key: "stepId",
          style: { width: "20%" }
        },
        {
          label: "Step",
          headerKey: "headerService",
          key: "service",
          style: { width: "12%" }
        },
        {
          label: "Pr. Deadline",
          headerKey: "headerDeadline",
          key: "deadline",
          style: { width: "11%" }
        },
        {
          label: "Language Pair",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { width: "12%" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { width: "11%" }
        },
        {
          label: "Fee",
          headerKey: "headerFee",
          key: "fee",
          style: { width: "10%" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: { width: "5%" }
        }
      ]
    }
  },
  methods: {
    formattedDate(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    requestToDelete(stepId) {
      if (!!this.getRequestCounter) return
      this.deleteInfo = { reportId: this.$route.params.id, stepsId: [ stepId ] }
      this.$emit('deleteStep', this.deleteInfo)
    }
  },
  computed: {
    ...mapGetters({
      getRequestCounter: 'getRequestCounter'
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.list-of-jobs {
  position: relative;
}

.table {
  &__header,
  &__data {
    padding: 0 7px;
  }

  &__data {
    width: 100%;

    a {
      color: inherit;
      text-decoration: none;
      transition: .2s ease-out;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__icons {
    width: 100%;
    height: 40px;
    align-items: center;
    display: flex;
    justify-content: center;
  }
}

.fa-trash {
  cursor: pointer;
  font-size: 15px;
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.short {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 180px;
}

.not-editable-icon {
  opacity: 0.5;
  cursor: default !important;
}
</style>