<template lang="pug">
  .allProjects
    .table
      .clear-filter(v-if="isFilterShow" @click="clearFilters")
        i(class="fas fa-broom")

      .show-filter(@click="toggleFilters")
        span(v-if="!isFilterShow" ) Show filters
        span(v-else) Hide filters


      .table__filters(ref="filter")
        .filter(v-if="isFilterShow")
          .filter__item
            label Project Id:
            .filter__input
              input(type="text" placeholder="Value" :value="projectIdValue" @change="projectIdSetFilter" @keyup.13="projectIdSetFilter")
              .clear-icon(v-if="projectIdValue.length" @click="removeSelectedInputs('projectId')")
                i.fas.fa-backspace

          .filter__item
            label Project Name:
            .filter__input
              input(type="text" placeholder="Value" :value="projectNameValue" @change="projectNameSetFilter" @keyup.13="projectNameSetFilter")
              .clear-icon(v-if="projectNameValue.length" @click="removeSelectedInputs('projectName')")
                i.fas.fa-backspace

          .filter__item
            label Created By:
            .filter__input
              input(type="text" placeholder="Value" :value="createdByValue" @change="createdBySetFilter" @keyup.13="createdBySetFilter")
              .clear-icon(v-if="createdByValue.length" @click="removeSelectedInputs('createdBy')")
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
            label Status:
            .filter__input
              SelectSingle(
                :selectedOption="selectedStatus"
                :options="allStatuses"
                placeholder="Option"
                @chooseOption="setStatus"
                :isRemoveOption="true"
                @removeOption="removeStatus"
              )

          .filter__itemLong
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
                placeholder="Select datetime range"
              )
            .clear-icon-picker(v-if="!!selectedStartRange[0]" @click="removeSelectedStartRange()")
              i.fas.fa-backspace

          .filter__itemLong
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
                placeholder="Select datetime range"
              )
            .clear-icon-picker(v-if="!!selectedDeadlineRange[0]" @click="removeSelectedDeadlineRange()")
              i.fas.fa-backspace

      .table__result
        LayoutsTable(
          :fields="fields"
          :tableData="projects"
          @bottomScrolled="bottomScrolled"
          :isProjectsFilterShow="isFilterShow"
        )
          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .table__header {{ field.label }}

          template(slot="projectId" slot-scope="{ row, index }")
            .table__data
              router-link(class="link-to" :to="{path: `/projects/details/${row._id}`}")
                span {{row.projectId}}

          template(slot="projectName" slot-scope="{ row, index }")
            .table__data
              router-link(class="link-to" :to="{path: `/projects/details/${row._id}`}")
                .table__projectName
                  .short {{  row.projectName.length >= 30 ? row.projectName.substr(0,30) + '...' : row.projectName }}
                  .tooltip(v-if="row.projectName.length >= 30")
                    .tooltip-data(v-html="row.projectName")
                    i(class="fas fa-info")

          template(slot="status" slot-scope="{ row, index }")
            .table__data
              span {{row.status}}

          template(slot="start" slot-scope="{ row, index }")
            .table__data
              span {{customFormatter(row.startDate)}}

          template(slot="deadline" slot-scope="{ row, index }")
            .table__data
              span {{customFormatter(row.deadline)}}

          template(slot="total" slot-scope="{ row, index }")
            .table__data
              span.currency(v-html="currencyIconDetected(row.projectCurrency)" )
              span {{ getTotalCost(row) }}

          template(slot="createdBy" slot-scope="{ row, index }")
            .table__dataImage(v-if="Object.keys(row.createdBy).length" )
              .tooltip.user__image
                .tooltip-data.user(v-html="row.createdBy.firstName + ' ' + row.createdBy.surname || ''")
                img(v-if="getContactPhoto(row.createdBy)" :src="domain+getContactPhoto(row.createdBy)")
                .user__fakeImage(:style="{'--bgColor': getBgColor(row.createdBy._id)[0], '--color':getBgColor(row.createdBy._id)[1]  }" v-else) {{ row.createdBy.firstName[0].toUpperCase() }}
            .table__dataImage(v-else)
              .tooltip.user__image(v-if="row.accountManager && Object.keys(row.accountManager).length" )
                .tooltip-data.user(v-html="'AM: ' + row.accountManager.firstName + ' ' + row.accountManager.lastName || ''")
                img(v-if="row.accountManager.photo && !row.accountManager.photo.includes('https://')" :src="domain+row.accountManager.photo")
                .user__fakeImage(:style="{'--bgColor': getBgColor(row.accountManager._id)[0], '--color':getBgColor(row.accountManager._id)[1]  }" v-else) {{ row.accountManager.firstName[0].toUpperCase() }}

        .table__empty(v-if="!projects.length") No data...

</template>
<script>
import { mapActions, mapGetters } from "vuex"
import LayoutsTable from "../../../components/LayoutsTable"
import SelectMulti from "../../../components/pangea/SelectMulti"
import SelectSingle from "../../../components/pangea/SelectSingle"
import LabelValue from "../../../components/LabelValue"
import '../../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'
import moment from 'moment'
import getBgColor from "../../../mixins/getBgColor"
import currencyIconDetected from '../../../mixins/currencyIconDetected'

export default {
  mixins: [ getBgColor, currencyIconDetected ],
  data() {
    return {
      domain: '',
      isFilterShow: false,
      allStatuses: [ 'Cost Quote', 'Quote sent', 'Approved', 'Rejected', 'In progress', 'Cancelled', 'Closed' ],
      projects: [],
      isDataRemain: true,
      lastDate: new Date(),

      projectId: '',
      projectName: '',
      createdBy: '',
      sourceLanguages: '',
      targetLanguages: '',
      industry: '',
      services: '',
      startDateFrom: '',
      startDateTo: '',
      deadlineFrom: '',
      deadlineTo: '',
      status: '',

      dataVariables: [
        'projectId',
        'projectName',
        'createdBy',
        'sourceLanguages',
        'targetLanguages',
        'industry',
        'services',
        'startDateFrom',
        'startDateTo',
        'deadlineFrom',
        'deadlineTo',
        'status'
      ],
      fields: [
        {
          label: "Project ID",
          headerKey: "headerID",
          key: "projectId",
          style: { "width": "145px" }
        },
        {
          label: "Project Name",
          headerKey: "headerProjectName",
          key: "projectName",
          style: { "width": "250px" }
        },
        {
          label: "Status",
          headerKey: "headerID2",
          key: "status",
          style: { "width": "110px" }
        },
        {
          label: "Start",
          headerKey: "headerID3",
          key: "start",
          style: { "width": "110px" }
        },
        {
          label: "Deadline",
          headerKey: "headerID4",
          key: "deadline",
          style: { "width": "110px" }
        },
        {
          label: "Total Cost",
          headerKey: "headerID5",
          key: "total",
          style: { "width": "100px" }
        },
        {
          label: "Created By",
          headerKey: "headerID6",
          key: "createdBy",
          style: { "width": "85px" }
        }
      ]
    }
  },
  methods: {
    ...mapActions({
      getServices: 'getServices',
      getLanguages: 'getLanguages',
      getIndustries: 'getIndustries'
    }),
    getTotalCost(project) {
      const { additionsSteps, minimumCharge, steps } = project
      const total = minimumCharge.isUsed
          ? minimumCharge.value
          : steps.reduce((acc, curr) => acc += +curr.finance.Price.receivables, 0)

      if (additionsSteps.length) {
        const sum = additionsSteps.reduce((acc, curr) => acc += +curr.finance.Price.receivables, 0)
        return +(total + sum).toFixed(2)
      }
      return +(total).toFixed(2)
    },
    getContactPhoto({ email }) {
      const { contacts } = this.client
      return contacts.find(item => item.email === email)
          ? contacts.find(item => item.email === email).photo
          : undefined
    },
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    toggleFilters() {
      if (this.isFilterShow) {
        this.clearFilters()
      }
      this.isFilterShow = !this.isFilterShow
    },
    clearFilters() {
      this.$router.replace({ 'query': null }).catch((err) => err)
      this.defaultSetter()
    },
    async getAllProjects() {
      this.lastDate = new Date()
      this.lastDate.setDate(this.lastDate.getDate() + 1)
      const projects = await this.$axios.post(`/portal/all-projects?token=${ this.token }`, { ...this.filters, lastDate: this.lastDate, customer: this.client._id })
      this.projects = projects.data
      this.isDataRemain = projects.data.length === 25
      if (this.isDataRemain) {
        this.lastDate = this.getLastDateFromRes(projects.data)
      }
    },
    async bottomScrolled() {
      if (this.isDataRemain && this.lastDate) {
        const projects = (await this.$axios.post(`/portal/all-projects?token=${ this.token }`, { ...this.filters, lastDate: this.lastDate, customer: this.client._id })).data
        this.projects.push(...projects)
        this.isDataRemain = projects.length === 25
        this.lastDate = this.getLastDateFromRes(projects)
      }
    },
    getLastDateFromRes(data) {
      return (data && data.length) ? data[data.length - 1].startDate : ""
    },
    defaultSetter() {
      for (let variable of this.dataVariables) this[variable] = ''
    },
    querySetter(vm, to) {
      for (let variable of this.dataVariables) if (to.query[variable] != null) vm[variable] = to.query[variable]
    },

    // filters ======================>
    removeSelectedInputs(prop) {
      this.replaceRoute(prop, '')
    },
    projectIdSetFilter(e) {
      const { value } = e.target
      this.replaceRoute('projectId', value)
    },
    createdBySetFilter(e) {
      const { value } = e.target
      this.replaceRoute('createdBy', value)
    },
    projectNameSetFilter(e) {
      const { value } = e.target
      this.replaceRoute('projectName', value)
    },
    replaceRoute(key, value) {
      let query = this.$route.query
      delete query[key]
      this.$router.replace({ path: this.$route.path, query: { ...query, [key]: value } })
    },
    getLanguageIdByLang(option) {
      const { _id } = this.languages.find(({ lang }) => lang === option)
      return _id
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
    removeSourceLanguages() {
      this.replaceRoute('sourceLanguages', '')
    },
    removeTargetLanguages() {
      this.replaceRoute('targetLanguages', '')
    },
    setIndustry({ option }) {
      const { _id } = this.industries.find(({ name }) => name === option)
      this.replaceRoute('industry', _id)
    },
    removeService() {
      this.replaceRoute('services', '')
    },
    removeIndustry() {
      this.replaceRoute('industry', '')
    },
    removeSelectedStartRange() {
      let query = this.$route.query
      this.$router.replace({ path: this.$route.path, query: { ...query, startDateFrom: '', startDateTo: '' } })
    },
    removeSelectedDeadlineRange() {
      let query = this.$route.query
      this.$router.replace({ path: this.$route.path, query: { ...query, deadlineFrom: '', deadlineTo: '' } })
    },
    getServicesIdByTitle(option) {
      const { _id } = this.allServices.find(({ title }) => title === option)
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
    setStatus({ option }) {
      this.replaceRoute('status', option)
    },
    removeStatus() {
      this.replaceRoute('status', '')
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
    }
    // filters <======================
  },
  computed: {
    ...mapGetters({
      user: "getUserInfo",
      client: "getClientInfo",
      token: "getToken",
      languages: "allLanguages",
      industries: "getAllIndustries",
      allServices: "getAllServices"
    }),
    mappedLanguages() {
      if (!this.languages.length) return []
      return this.languages.map(({ lang }) => lang)
    },
    allServicesMapped() {
      if (!this.allServices.length) return []
      return this.allServices.map(({ title }) => title)
    },
    allIndustries() {
      if (!this.industries.length) return []
      return this.industries.map(({ name }) => name)
    },
    filters() {
      const filters = {}
      for (let variable of this.dataVariables) filters[variable] = this[variable]
      return filters
    },
    projectIdValue() {
      return this.$route.query.projectId || ''
    },
    projectNameValue() {
      return this.$route.query.projectName || ''
    },
    createdByValue() {
      return this.$route.query.createdBy || ''
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
    selectedIndustry() {
      if (this.$route.query.industry && this.industries.length) {
        const { name } = this.industries.find(({ _id }) => `${ _id }` === `${ this.$route.query.industry }`)
        return name
      }
      return ''
    },
    selectedStatus() {
      return this.$route.query.status || ''
    },
    selectedServices() {
      return this.$route.query.services && this.allServices.length
          ? this.$route.query.services.split(',').map(_id => this.allServices.find(service => _id === service._id).title)
          : []
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
    if (Object.keys(this.$route.query).length) this.isFilterShow = true
    this.domain = process.env.domain
    await this.getIndustries()
    await this.getLanguages()
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
  },
  components: {
    DatePicker,
    LabelValue,
    SelectSingle,
    SelectMulti,
    LayoutsTable
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.user {
  &__fakeImage {
    height: 32px;
    width: 32px;
    border-radius: 32px;
    background-color: var(--bgColor);
    color: var(--color);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }

  &__image {
    height: 32px;
    width: 32px;
    border-radius: 32px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 32px;
    }
  }
}

.allProjects {
  width: 980px;
  box-sizing: border-box;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: $box-shadow;
  padding: 25px;
  position: relative;
}

.table {
  margin-top: 25px;

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

a {
  color: $text;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}

.filter {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  &__item {
    position: relative;
    margin-bottom: 10px;
    width: 220px;
  }

  &__itemLong {
    position: relative;
    margin-bottom: 30px;
    width: 457px;
  }

  &__input {
    position: relative;
    height: 32px;
  }
}

label {
  display: block;
  margin-bottom: 2px;
  font-family: 'Myriad600';
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
  font-family: 'Myriad400';

  &:focus {
    border: 1px solid $border-focus;
  }
}

.fa-backspace {
  font-size: 16px;
  transition: .2s ease-out;
  color: $dark-border;
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 8px;

  &:hover {
    color: $text;
  }
}

.show-filter {
  position: absolute;
  right: 25px;
  top: 12px;
  background: #fff;
  border: 1px solid $border;
  border-radius: 4px;
  cursor: pointer;
  padding: 5px;
  transition: .2s ease-out;
  color: $dark-border;
  width: 90px;
  text-align: center;

  &:hover {
    color: $text !important;
  }
}

.clear-icon-picker {
  position: absolute;
  right: 25px;
  top: 19px;
}

.clear-filter {
  position: absolute;
  right: 135px;
  top: 12px;
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
  max-width: 90%;
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

</style>
