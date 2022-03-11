<template lang="pug">
  .addContainer
    .addContainer__icons
      .addContainer__icons-icon
        IconButton(@clicked="clearFilters")
          i(class="fa-solid fa-broom")
      .addContainer__icons-icon
        IconButton(@clicked="toggleFilters")
          i(v-if="isFilter" class="fa-solid fa-filter-circle-xmark")
          i(v-else class="fa-solid fa-filter")
    ValidationErrors(
      v-if="errors.length"
      :errors="errors"
      :isAbsolute="true"
      @closeErrors="closeErrors"
    )
    .addContainer__title Available Jobs
    .addContainer__content
      .addContainer__table
        GeneralTable(
          :fields="fields",
          :tableData="filteredSteps",
        )

          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .table__header(v-if="field.headerKey === 'headerCheck'")
              CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
            .table__header(v-else) {{ field.label }}

          template(slot="check" slot-scope="{ row, index }")
            .table__data
              CheckBox(:isChecked="row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

          template(slot="projectId" slot-scope="{ row, index }")
            .table__data
              router-link(class="link-to" target='_blank' :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
                span {{ row.projectId }}

          template(slot="project" slot-scope="{ row, index }")
            .table__data
              router-link(class="link-to" target='_blank' :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
                .short {{ row.projectName }}

          template(slot="stepId" slot-scope="{ row, index }")
            .table__data {{ row.steps.stepId || '-' }}

          template(slot="name" slot-scope="{row}" )
            .table__data {{ row.selectedBillingInfo.name }}

          template(slot="deadline" slot-scope="{ row, index }")
            .table__data {{ formattedDate(row.deadline) }}

          template(slot="service" slot-scope="{ row, index }")
            .table__data {{ row.type === 'Classic' ? row.steps.stepAndUnit.step.title : row.steps.title }}

          template(slot="jobStatus" slot-scope="{ row, index }")
            .table__data {{ row.steps.status || 'Completed' }}

          template(slot="langPair" slot-scope="{ row, index }")
            span(v-if="row.type === 'Classic'" )
              .table__data(v-if="row.steps.sourceLanguage === row.steps.targetLanguage") {{ row.steps.targetLanguage }}
              .table__data(v-else) {{ row.steps.sourceLanguage }}
                span(style="font-size: 12px;color: #9c9c9c;margin: 0 4px;")
                  i(class="fas fa-angle-double-right")
                | {{ row.steps.targetLanguage }}
            span(v-else) -

          template(slot="receivables" slot-scope="{ row, index }")
            .table__data
              span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
              span {{ +(row.steps.finance.Price.receivables).toFixed(2)}}

      .addContainer__filters(v-if="isFilter")
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
            label Deadline Range:
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

    .table__buttons
      Button(
        v-if="steps.length"
        class="add-button"
        value="Add Jobs"
        :isDisabled="!isOptionToCreateReport || !!isRequestNow"
        @clicked="sendSteps"
      )
      Button(
        class="add-button"
        :outline="true"
        value="Close"
        :isDisabled="!!isRequestNow"
        @clicked="closeTable"
      )

</template>

<script>
import GeneralTable from '../GeneralTable'
import CheckBox from '../CheckBox'
import Button from '../Button'
import moment from "moment"
import { mapGetters } from "vuex"
import currencyIconDetected from "../../mixins/currencyIconDetected"
import ValidationErrors from "../ValidationErrors"
import IconButton from "../IconButton"
import '../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'
import SelectMulti from "../SelectMulti"

export default {
  mixins: [ currencyIconDetected ],
  props: {
    paymentType: {
      type: String
    },
    steps: {
      type: Array,
      default: []
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
      isAllSelected: false,
      errors: [],
      fields: [
        {
          label: "",
          headerKey: "headerCheck",
          key: "check",
          style: { width: "3%" }
        },
        {
          label: "Billing Name",
          headerKey: "headerVendorName",
          key: "name",
          style: { width: "12%" }
        },
        {
          label: "Projects ID",
          headerKey: "headerProjectId",
          key: "projectId",
          style: { width: "11%" }
        },
        {
          label: "Project",
          headerKey: "headerProject",
          key: "project",
          style: { width: "17%" }
        },
        {
          label: "Step ID",
          headerKey: "headerStepId",
          key: "stepId",
          style: { width: "15%" }
        },
        {
          label: "Step",
          headerKey: "headerService",
          key: "service",
          style: { width: "9%" }
        },
        {
          label: "Language",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { width: "9%" }
        },
        {
          label: "Deadline",
          headerKey: "headerDeadline",
          key: "deadline",
          style: { width: "8%" }
        },
        {
          label: "Status",
          headerKey: "headerJobStatus",
          key: "jobStatus",
          style: { width: "8%" }
        },
        {
          label: "Fee",
          headerKey: "headerPayables",
          key: "receivables",
          style: { width: "8%" }
        }
      ]
    }
  },
  methods: {
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
    clearFilters() {
      this.filterProjectId = ''
      this.filterProjectName = ''
      this.filterStep = ''
      this.filterDateRange = [ null, null ]
      this.filterSources = []
      this.filterTargets = []
    },
    closeErrors() {
      this.errors = []
    },
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
    async sendSteps() {
      try {
        this.errors = []
        const checkedSteps = this.steps.filter(i => i.isCheck)
        const projectIds = [ ...new Set(checkedSteps.map(i => i.projectId)) ]
        if (projectIds.length > 1 && this.paymentType === 'PPP') this.errors.push('Only one Project for "PPP" Payment type')
        if (this.errors.length) return

        await this.$http.post(`/invoicing-receivables/report/${ this.$route.params.id }/add`, {
          checkedSteps: checkedSteps.map(({ steps }) => steps._id),
          createdBy: this.user._id
        })
        this.$emit('refreshReports')
      } catch (e) {
        console.log(e)
      }
    },
    getLangId(lang) {
      return this.languages.find(j => j.lang === lang)._id.toString()
    }
  },
  computed: {
    ...mapGetters({
      user: "getUser",
      isRequestNow: 'getRequestCounter',
      languages: 'getAllLanguages'
    }),
    isOptionToCreateReport() {
      if (this.steps.length) {
        return this.steps.some(item => item.isCheck)
      }
      return false
    },
    filteredSteps() {
      if (!this.steps.length) return []
      const sources = this.filterSources.map(i => this.getLangId(i))
      const targets = this.filterTargets.map(i => this.getLangId(i))

      return this.steps.filter(item => {
            const deadline = new Date(item.deadline).getTime()
            return item.projectId.includes(this.filterProjectId)
                && item.projectName.toLowerCase().includes(this.filterProjectName.toLowerCase())
                && (!!item?.steps.title
                    ? item.steps.title.toLowerCase().includes(this.filterStep.toLowerCase())
                    : item.steps.stepAndUnit.step.title.toLowerCase().includes(this.filterStep.toLowerCase()))
                && (this.filterDateRange[0]
                    ? (deadline > this.filterDateRange[0] && deadline < this.filterDateRange[1])
                    : item)
                && (sources.length ? sources.includes(item.steps.fullSourceLanguage) : item)
                && (targets.length ? targets.includes(item.steps.fullTargetLanguage) : item)
                && item
          }
      )
    }
  },
  components: {
    SelectMulti,
    IconButton,
    ValidationErrors,
    GeneralTable,
    CheckBox,
    Button,
    DatePicker
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";
@import "../../assets/scss/LayoutFilters";

.addContainer {
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
  }

  &__table {
    width: 100vw;
    overflow-x: auto;
    height: fit-content;
  }
}

.add-button {
  margin-top: 20px;
}

.table {
  &__buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 5px;
  }

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
  max-width: 225px;
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