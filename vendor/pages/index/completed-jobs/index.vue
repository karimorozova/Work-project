<template lang="pug">
  .jobs-layout
    .table
      LayoutsTable(
        :fields="fields"
        :tableData="projects"
        @bottomScrolled="bottomScrolled"
      )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="jobId" slot-scope="{ row, index }")
          .table__data
            router-link(class="link-to" :to="{path: `/completed-jobs/job-details/${row.steps._id}_${row._id}`}")
              span {{row.steps.stepId}}

        template(slot="projectName" slot-scope="{ row, index }")
          .table__data
            .table__projectName
              .short {{ row.projectName }}
              .tooltip(v-if="row.projectName.length >= 18")
                .tooltip-data(v-html="row.projectName")
                i(class="fa-solid fa-info")

        template(slot="status" slot-scope="{ row, index }")
          .table__data
            span {{row.steps.status}}

        template(slot="service" slot-scope="{ row, index }")
          .table__data
            span {{row.steps.step.title}}

        template(slot="languages" slot-scope="{ row, index }")
          .table__data
            span(v-html="getStepPair(row.steps)")

        template(slot="start" slot-scope="{ row, index }")
          .table__data
            span {{customFormatter(row.startDate)}}

        template(slot="deadline" slot-scope="{ row, index }")
          .table__data
            span {{customFormatter(row.deadline)}}

        template(slot="total" slot-scope="{ row, index }")
          .table__data
            span.currency(v-html="currencyIconDetected('EUR')" )
            span {{ +(row.steps.nativeFinance.Price.payables).toFixed(2) }}


    .filters
      .filter__item
        label Job ID:
        .filter__input
          input(type="text" placeholder="Value" :value="jobIdValue" @change="jobIdSetFilter" @keyup.13="jobIdSetFilter")
          .clear-icon(v-if="jobIdValue.length" @click="removeSelectedInputs('jobId')")
            i.fas.fa-backspace
      .filter__item
        label Project Name:
        .filter__input
          input(type="text" placeholder="Value" :value="projectNameValue" @change="projectNameSetFilter" @keyup.13="projectNameSetFilter")
          .clear-icon(v-if="projectNameValue.length" @click="removeSelectedInputs('projectName')")
            i.fas.fa-backspace
      .filter__item
        label Source Languages:
        .filter__input
          SelectMulti(
            :selectedOptions="selectedSourceLanguages"
            :options="mappedLanguages"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="chooseSourceLanguages"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeSourceLanguages"
          )
      .filter__item
        label Target Languages:
        .filter__input
          SelectMulti(
            :selectedOptions="selectedTargetLanguages"
            :options="mappedLanguages"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="chooseTargetLanguages"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeTargetLanguages"
          )
      .filter__item
        label Services:
        .filter__input
          SelectMulti(
            :selectedOptions="selectedServices"
            :options="allServicesMapped"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setServices"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeService"
          )
      .filter__item
        label Industry:
        .filter__input
          SelectSingle(
            :hasSearch="true"
            :selectedOption="selectedIndustry"
            :options="allIndustries"
            placeholder="Option"
            @chooseOption="setIndustry"
            :isRemoveOption="true"
            @removeOption="removeIndustry"
          )

      .filter__item
        label Start Date Range:
        .filter__input
          DatePicker.range-with-one-panel(
            :value="selectedStartRange"
            @input="(e) => setStartRange(e)"
            format="DD-MM-YYYY, HH:mm"
            prefix-class="xmx"
            range-separator=" - "
            :clearable="false"
            type="datetime"
            range
            placeholder="Datetime range"
          )
          .clear-icon-picker(v-if="!!selectedStartRange[0]" @click="removeSelectedStartRange()")
            i.fas.fa-backspace

      .filter__item
        label Deadline Range:
        .filter__input
          DatePicker.range-with-one-panel(
            :value="selectedDeadlineRange"
            @input="(e) => setDeadlineRange(e)"
            format="DD-MM-YYYY, HH:mm"
            prefix-class="xmx"
            range-separator=" - "
            :clearable="false"
            type="datetime"
            range
            placeholder="Datetime range"
          )
          .clear-icon-picker(v-if="!!selectedDeadlineRange[0]" @click="removeSelectedDeadlineRange()")
            i.fas.fa-backspace

      .clear-filter(@click="clearFilters")
        i(class="fas fa-broom")

</template>

<script>
import currencyIconDetected from "../../../mixins/currencyIconDetected"
import { mapGetters } from "vuex"
import LayoutsTable from "../../../components/general/LayoutsTable"
import '../../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'
import moment from 'moment'
import SelectMulti from "../../../components/general/SelectMulti"
import SelectSingle from "../../../components/general/SelectSingle"


export default {
  name: "index",
  components: { SelectSingle, SelectMulti, LayoutsTable, DatePicker },
  mixins: [ currencyIconDetected ],
  data() {
    return {
      projects: [],
      isDataRemain: true,
      lastDate: new Date(),
      domain: '',
      fields: [
        {
          label: "Job ID",
          headerKey: "headerID",
          key: "jobId",
          style: { "width": "200px" }
        },
        {
          label: "Project Name",
          headerKey: "headerProjectName",
          key: "projectName",
          style: { "width": "200px" }
        },
        {
          label: "Status",
          headerKey: "headerID2",
          key: "status",
          style: { "width": "120px" }
        },
        {
          label: "Service",
          headerKey: "headerID2",
          key: "service",
          style: { "width": "120px" }
        },
        {
          label: "Languages",
          headerKey: "headerID2",
          key: "languages",
          style: { "width": "120px" }
        },
        {
          label: "Project Start",
          headerKey: "headerID3",
          key: "start",
          style: { "width": "120px" }
        },
        {
          label: "Project Deadline",
          headerKey: "headerID4",
          key: "deadline",
          style: { "width": "120px" }
        },
        {
          label: "Total Cost",
          headerKey: "headerID5",
          key: "total",
          style: { "width": "100px" }
        }
      ],

      jobId: '',
      projectName: '',
      sourceLanguages: '',
      targetLanguages: '',
      services: '',
      industry: '',
      startDateFrom: '',
      startDateTo: '',
      deadlineFrom: '',
      deadlineTo: '',

      dataVariables: [
        'jobId',
        'projectName',
        'sourceLanguages',
        'targetLanguages',
        'services',
        'industry',
        'startDateFrom',
        'startDateTo',
        'deadlineFrom',
        'deadlineTo'
      ]
    }
  },
  methods: {
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    defaultSetter() {
      for (let variable of this.dataVariables) this[variable] = ''
    },
    querySetter(vm, to) {
      for (let variable of this.dataVariables) if (to.query[variable] != null) vm[variable] = to.query[variable]
    },
    async getAllProjects() {
      this.lastDate = new Date()
      this.lastDate.setDate(this.lastDate.getDate() + 1)

      const projects = await this.$axios.post(`/vendor/all-vendor-jobs`, {
        ...this.filters,
        stepsStatuses: { $in: [ 'Completed', 'Cancelled Halfway' ] },
        lastDate: this.lastDate,
        vendor: this.vendor._id,
        isFilterZeroFinance: true,
        isLimit: true
      })
      this.projects = projects.data
      this.isDataRemain = projects.data.length === 25
      if (this.isDataRemain) {
        this.lastDate = this.getLastDateFromRes(projects.data)
      }
    },
    async bottomScrolled() {
      if (this.isDataRemain && this.lastDate) {
        const projects = (await this.$axios.post(`/vendor/all-vendor-jobs`, {
              ...this.filters,
              stepsStatuses: { $in: [ 'Completed', 'Cancelled Halfway' ] },
              lastDate: this.lastDate,
              vendor: this.vendor._id,
              isFilterZeroFinance: true,
              isLimit: true
            })
        ).data
        this.projects.push(...projects)
        this.isDataRemain = projects.length === 25
        this.lastDate = this.getLastDateFromRes(projects)
      }
    },
    getLastDateFromRes(data) {
      return (data && data.length) ? data[data.length - 1].startDate : ""
    },
    getStepPair(step) {
      return step.sourceLanguage === step.targetLanguage
          ? `${ step.targetLanguage }`
          : `<span>${ step.sourceLanguage }</span><span style="font-size: 12px;color: #9c9c9c;margin: 0 4px;"><i class="fa-solid fa-angle-double-right"></i></span><span>${ step.targetLanguage }</span>`
    },
    // filters ==>>
    clearFilters() {
      this.$router.replace({ 'query': null }).catch((err) => err)
      this.defaultSetter()
    },
    replaceRoute(key, value) {
      let query = this.$route.query
      delete query[key]
      this.$router.replace({ path: this.$route.path, query: { ...query, [key]: value } })
    },
    removeSelectedInputs(prop) {
      this.replaceRoute(prop, '')
    },
    jobIdSetFilter(e) {
      const { value } = e.target
      this.replaceRoute('jobId', value)
    },
    projectNameSetFilter(e) {
      const { value } = e.target
      this.replaceRoute('projectName', value)
    },
    removeSourceLanguages() {
      this.replaceRoute('sourceLanguages', '')
    },
    removeTargetLanguages() {
      this.replaceRoute('targetLanguages', '')
    },
    chooseSourceLanguages({ option }) {
      if (!this.$route.query.sourceLanguages) {
        this.replaceRoute('sourceLanguages', this.getLanguageIdByLang(option))
        return
      }
      let _ids = this.$route.query.sourceLanguages.split(',')
      if (_ids.includes(this.getLanguageIdByLang(option))) _ids = _ids.filter(_id => _id !== this.getLanguageIdByLang(option))
      else _ids.push(this.getLanguageIdByLang(option))
      this.replaceRoute('sourceLanguages', _ids.join(','))
    },
    chooseTargetLanguages({ option }) {
      if (!this.$route.query.targetLanguages) {
        this.replaceRoute('targetLanguages', this.getLanguageIdByLang(option))
        return
      }
      let _ids = this.$route.query.targetLanguages.split(',')
      if (_ids.includes(this.getLanguageIdByLang(option))) _ids = _ids.filter(_id => _id !== this.getLanguageIdByLang(option))
      else _ids.push(this.getLanguageIdByLang(option))
      this.replaceRoute('targetLanguages', _ids.join(','))
    },
    getLanguageIdByLang(option) {
      const { _id } = this.languages.find(({ lang }) => lang === option)
      return _id
    },
    getServicesIdByTitle(option) {
      const { _id } = this.allSteps.find(({ title }) => title === option)
      return _id
    },
    setServices({ option }) {
      if (!this.$route.query.services) {
        this.replaceRoute('services', this.getServicesIdByTitle(option))
        return
      }
      let _ids = this.$route.query.services.split(',')
      if (_ids.includes(this.getServicesIdByTitle(option))) _ids = _ids.filter(_id => _id !== this.getServicesIdByTitle(option))
      else _ids.push(this.getServicesIdByTitle(option))
      this.replaceRoute('services', _ids.join(','))
    },
    removeService() {
      this.replaceRoute('services', '')
    },
    removeIndustry() {
      this.replaceRoute('industry', '')
    },
    setIndustry({ option }) {
      const { _id } = this.industries.find(({ name }) => name === option)
      this.replaceRoute('industry', _id)
    },
    setStartRange(e) {
      let query = this.$route.query
      delete query.startDateFrom
      delete query.startDateTo
      this.$router.replace({ path: this.$route.path, query: { ...query, startDateFrom: new Date(e[0]).getTime(), startDateTo: new Date(e[1]).getTime() } })
    },
    setDeadlineRange(e) {
      let query = this.$route.query
      delete query.deadlineFrom
      delete query.deadlineTo
      this.$router.replace({ path: this.$route.path, query: { ...query, deadlineFrom: new Date(e[0]).getTime(), deadlineTo: new Date(e[1]).getTime() } })
    },
    removeSelectedStartRange() {
      let query = this.$route.query
      this.$router.replace({ path: this.$route.path, query: { ...query, startDateFrom: '', startDateTo: '' } })
    },
    removeSelectedDeadlineRange() {
      let query = this.$route.query
      this.$router.replace({ path: this.$route.path, query: { ...query, deadlineFrom: '', deadlineTo: '' } })
    }
    // filters <<==
  },
  computed: {
    ...mapGetters({
      token: 'getToken',
      vendor: 'getVendor',
      languages: 'getAllLanguages',
      allSteps: 'getAllSteps',
      industries: 'getAllIndustries'
    }),
    allIndustries() {
      if (!this.industries.length) return []
      return this.industries.map(({ name }) => name)
    },
    mappedLanguages() {
      if (!this.languages.length) return []
      return this.languages.map(({ lang }) => lang)
    },
    allServicesMapped() {
      if (!this.allSteps.length) return []
      return this.allSteps.map(({ title }) => title)
    },
    filters() {
      const filters = {}
      for (let variable of this.dataVariables) filters[variable] = this[variable]
      return filters
    },
    jobIdValue() {
      return this.$route.query.jobId || ''
    },
    projectNameValue() {
      return this.$route.query.projectName || ''
    },
    selectedSourceLanguages() {
      return this.$route.query.sourceLanguages && this.languages.length
          ? this.$route.query.sourceLanguages.split(',').map(_id => this.languages.find(language => _id === language._id).lang)
          : []
    },
    selectedTargetLanguages() {
      return this.$route.query.targetLanguages && this.languages.length
          ? this.$route.query.targetLanguages.split(',').map(_id => this.languages.find(language => _id === language._id).lang)
          : []
    },
    selectedServices() {
      return this.$route.query.services && this.allSteps.length
          ? this.$route.query.services.split(',').map(_id => this.allSteps.find(step => _id === step._id).title)
          : []
    },
    selectedIndustry() {
      if (this.$route.query.industry && this.industries.length) {
        const { name } = this.industries.find(({ _id }) => `${ _id }` === `${ this.$route.query.industry }`)
        return name
      }
      return ''
    },
    selectedStartRange() {
      return this.$route.query.startDateFrom
          ? [ new Date(+this.$route.query.startDateFrom), new Date(+this.$route.query.startDateTo) ]
          : [ null, null ]
    },
    selectedDeadlineRange() {
      return this.$route.query.deadlineFrom
          ? [ new Date(+this.$route.query.deadlineFrom), new Date(+this.$route.query.deadlineTo) ]
          : [ null, null ]
    }
  },
  async created() {
    this.domain = process.env.domain
    this.defaultSetter()
    this.querySetter(this, this.$route)
    await this.getAllProjects()
  },
  watch: {
    $route(to, from) {
      if (to.path === from.path) {
        this.querySetter(this, to)
        this.getAllProjects()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.jobs-layout {
  display: flex;
  gap: 25px;
}

.filters {
  padding: 25px;
  background-color: white;
  height: fit-content;
  position: relative;
  box-shadow: $box-shadow;
  border-radius: 4px;
  margin-right: 50px;
}

.table {
  width: 1170px;
  box-sizing: border-box;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: $box-shadow;
  padding: 25px;
  position: relative;
  height: fit-content;

  @media all and (max-width: 1400px) {
    width: 700px;
  }

  &__projectName {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  &__empty {
    margin-top: 10px;
    color: $dark-border;
  }

  &__header {
    padding: 0 0 0 7px;
  }

  &__dataImage {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  &__data {
    width: 100%;
  }
}

.clear-icon-picker,
.clear-icon {
  position: absolute;
  right: 25px;
  top: 19px;

  font-size: 16px;
  transition: .2s ease-out;
  color: $dark-border;
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 8px;
  background-color: white;

  &:hover {
    color: $text;
  }
}

.clear-icon-picker {
  right: 30px;
}

.filter {
  &__item {
    position: relative;
    margin-bottom: 12px;
    width: 220px;
  }

  &__input {
    position: relative;
    height: 32px;
  }
}

label {
  display: block;
  margin-bottom: 2px;
  font-family: 'Roboto600';
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  height: 32px;
  transition: .1s ease-out;
  width: 220px;
  font-family: 'Roboto400';

  &:focus {
    border: 1px solid $border-focus;
  }
}

.clear-filter {
  width: fit-content;
  background: #fff;
  border: 1px solid $border;
  border-radius: 4px;
  cursor: pointer;
  padding: 5px;
  transition: .2s ease-out;
  color: $dark-border;

  &:hover {
    color: $text !important;
  }
}

.tooltip {
  position: relative;
  display: flex;
  cursor: help;
  color: $dark-border;
  text-align: center;


  &.user {
    height: 32px;
    width: 32px;
    background: $light-border;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    color: $dark-border;
  }

  &-data {
    visibility: hidden;
    font-size: 14px;
    max-width: 280px;
    min-width: 140px;
    background: white;
    border-radius: 4px;
    right: 15px;
    top: -7px;
    padding: 8px 8px 6px 8px;
    position: absolute;
    z-index: 555;
    opacity: 0;
    transition: opacity .3s;
    border: 1px solid $text;
    color: $text;

    &.user {
      right: 40px;
      top: 1px;
      color: $text;
    }

    &::after {
      content: "";
      position: absolute;
      top: 8px;
      right: -12px;
      transform: rotate(270deg);
      border-width: 6px;
      border-style: solid;
      border-color: $text transparent transparent;
    }
  }

  &:hover {
    .tooltip-data {
      visibility: visible;
      opacity: 1;
    }
  }
}

.short {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 170px;
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.range-with-one-panel {
  width: 220px;
}

a {
  color: $text;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}

</style>