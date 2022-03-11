<template lang="pug">
  .list-of-jobs
    .list-of-jobs__icons
      .list-of-jobs__icons-icon
        IconButton(@clicked="clearFilters")
          i(class="fa-solid fa-broom")
      .list-of-jobs__icons-icon
        IconButton(@clicked="toggleFilters")
          i(v-if="isFilter" class="fa-solid fa-filter-circle-xmark")
          i(v-else class="fa-solid fa-filter")

    .list-of-jobs__title Jobs
    .list-of-jobs__content
      .list-of-jobs__content-table
        GeneralTable(
          :fields="fields",
          :tableData="filteredSteps",
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
            .table__data(v-if="enumOfReports === 'client'" ) {{ formattedDate(row.billingDate) }}
            .table__data(v-else) {{ formattedDate(row.deadline) }}

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

      .list-of-jobs__content-filters(v-if="isFilter")
        .filter
          .filter__item
            label Project ID:
            .filter__input
              input(type="text" placeholder="Value" v-model="filterProjectId")
              .clear-icon(v-if="filterProjectId.length" @click="clearFilter('filterProjectId')")
                i.fas.fa-backspace
          .filter__item
            label Project Name:
            .filter__input
              input(type="text" placeholder="Value" v-model="filterProjectName")
              .clear-icon(v-if="filterProjectName.length" @click="clearFilter('filterProjectName')")
                i.fas.fa-backspace
          .filter__item
            label Step:
            .filter__input
              input(type="text" placeholder="Value" v-model="filterStep")
              .clear-icon(v-if="filterStep.length" @click="clearFilter('filterStep')")
                i.fas.fa-backspace
          .filter__item
            label {{ enumOfReports === 'client' ? 'Billing Date Range:' : 'Deadline Range:' }}
            .filter__input
              DatePicker.range-with-one-panel(
                :value="!!filterDateRange[0] ? [new Date(filterDateRange[0]), new Date(filterDateRange[1])] : filterDateRange"
                @input="(e) => setDateRange(e)"
                format="DD-MM-YYYY, HH:mm"
                prefix-class="xmx"
                range-separator=" - "
                :clearable="false"
                type="datetime"
                range
                placeholder="Datetime range"
              )
            .clear-icon-picker(v-if="!!filterDateRange[0]" @click="unsetDateRange()")
              i.fas.fa-backspace.backspace
          .filter__item
            label Source Languages:
            .filter__input
              SelectMulti(
                :selectedOptions="filterSources"
                :options="languages.map(i => i.lang)"
                :hasSearch="true"
                placeholder="Options"
                @chooseOptions="setSource"
                :isSelectedWithIcon="true"
                :isRemoveOption="true"
                @removeOption="removeSource"
              )
          .filter__item
            label Target Languages:
            .filter__input
              SelectMulti(
                :selectedOptions="filterTargets"
                :options="languages.map(i => i.lang)"
                :hasSearch="true"
                placeholder="Options"
                @chooseOptions="setTarget"
                :isSelectedWithIcon="true"
                :isRemoveOption="true"
                @removeOption="removeTarget"
              )


</template>

<script>
import GeneralTable from "../GeneralTable"
import moment from "moment"
import currencyIconDetected from "../../mixins/currencyIconDetected"
import { mapGetters } from "vuex"
import IconButton from "../IconButton"
import '../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'
import SelectMulti from "../SelectMulti"

export default {
  name: "ReportDetailsJobsList",
  mixins: [ currencyIconDetected ],
  components: { SelectMulti, IconButton, GeneralTable, DatePicker },
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
      filterProjectId: '',
      filterProjectName: '',
      filterStep: '',
      filterDateRange: [ null, null ],
      filterSources: [],
      filterTargets: [],

      isFilter: false,
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
          label: this.enumOfReports !== 'client' ? "Pr. Deadline" : "Billing Date",
          headerKey: "headerDeadline",
          key: "deadline",
          style: { width: "11%" }
        },
        {
          label: "Language",
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
    clearFilters() {
      this.filterProjectId = ''
      this.filterProjectName = ''
      this.filterStep = ''
      this.filterDateRange = [ null, null ]
      this.filterSources = []
      this.filterTargets = []
    },
    setSource({ option }) {
      const position = this.filterSources.indexOf(option)
      if (position !== -1) this.filterSources.splice(position, 1)
      else this.filterSources.push(option)
    },
    setTarget({ option }) {
      const position = this.filterTargets.indexOf(option)
      if (position !== -1) this.filterTargets.splice(position, 1)
      else this.filterTargets.push(option)
    },
    removeSource() {
      this.filterSources = []
    },
    removeTarget() {
      this.filterTargets = []
    },
    setDateRange(e) {
      this.filterDateRange = [ new Date(e[0]).getTime(), new Date(e[1]).getTime() ]
    },
    clearFilter(prop) {
      this[prop] = ''
    },
    unsetDateRange() {
      this.filterDateRange = [ null, null ]
    },
    toggleFilters() {
      this.isFilter = !this.isFilter
    },
    formattedDate(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    requestToDelete(stepId) {
      if (!!this.getRequestCounter) return
      this.deleteInfo = { reportId: this.$route.params.id, stepsId: [ stepId ] }
      this.$emit('deleteStep', this.deleteInfo)
    },
    getLangId(lang) {
      return this.languages.find(j => j.lang === lang)._id.toString()
    }
  },
  computed: {
    ...mapGetters({
      getRequestCounter: 'getRequestCounter',
      languages: 'getAllLanguages'
    }),
    filteredSteps() {
      if (!this.steps.length) return []
      const sources = this.filterSources.map(i => this.getLangId(i))
      const targets = this.filterTargets.map(i => this.getLangId(i))

      return this.steps.filter(item => {
            return item.projectId.includes(this.filterProjectId)
                && item.projectName.toLowerCase().includes(this.filterProjectName.toLowerCase())
                && (!!item?.title
                    ? item.title.toLowerCase().includes(this.filterStep.toLowerCase())
                    : item.stepAndUnit.step.title.toLowerCase().includes(this.filterStep.toLowerCase()))
                && (
                    this.filterDateRange[0]
                        ? this.enumOfReports === 'client'
                            ? (new Date(item.billingDate).getTime() > this.filterDateRange[0] && new Date(item.billingDate).getTime() < this.filterDateRange[1])
                            : (new Date(item.deadline).getTime() > this.filterDateRange[0] && new Date(item.deadline).getTime() < this.filterDateRange[1])
                        : item
                )
                && (sources.length ? sources.includes(item.fullSourceLanguage) : item)
                && (targets.length ? targets.includes(item.fullTargetLanguage) : item)
                && item
          }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/LayoutFilters";

.list-of-jobs {
  position: relative;

  &__icons {
    position: absolute;
    right: 0;
    display: flex;
    gap: 12px;
    margin-top: -10px;
  }

  &__title {
    font-size: 16px;
    font-family: 'Myriad600';
    margin-bottom: 10px;
  }

  &__content {
    display: flex;
    gap: 25px;

    &-table {
      width: 100vw;
      overflow-x: auto;
      height: fit-content;
    }
  }
}

.table {
  &__header,
  &__data {
    padding: 0 7px;
  }

  &__data {
    min-width: 85px;
  }

  &__data {
    //width: 100%;

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
    height: 42px;
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