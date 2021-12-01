<template lang="pug">
  .allProjects
    .table {{ services }}
      .table__filters(ref="filter")
        .filter
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
                span {{ row.projectName }}

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

export default {
  data() {
    return {
      allStatuses: [ 'Cost Quote', 'Quote sent', 'Approved', 'Rejected', 'In progress', 'Cancelled', 'Closed' ],
      projects: [],
      isDataRemain: true,
      lastDate: '',

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
          style: { "width": "140px" }
        },
        {
          label: "Project Name",
          headerKey: "headerProjectName",
          key: "projectName",
          style: { "width": "170px" }
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
    projectDetails(data) {
      // this.project = data.project;
      // this.jobsById = data.jobs;
      this.$router.push(`/projects/details/${ id }`)
    },
    async getAllProjects() {
      const { projects } = (await this.$axios.get(`/portal/all-projects?token=${ this.token }`)).data
      this.projects.push(...projects)
      this.isDataRemain = projects.length === 25
      this.lastDate = this.getLastDateFromRes(projects)
      console.log('created All', this.projects)
    },
    async bottomScrolled() {
      if (this.isDataRemain && this.lastDate) {
        const { projects } = (await this.$axios.get(`/portal/all-projects?token=${ this.token }`)).data
        this.projects.push(...projects)
        this.isDataRemain = projects.length === 25
        this.lastDate = this.getLastDateFromRes(projects)

        console.log('bottom next', this.projects)
      }
    },
    getLastDateFromRes(data) {
      return (data && data.length) ? data[data.length - 1].startDate : ""
    },
    /// filters ======================>>
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
    await this.getIndustries()
    await this.getLanguages()
    await this.getAllProjects()
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

<style scoped lang="scss">
@import "../../../assets/scss/colors.scss";

.allProjects {
  width: 980px;
  box-sizing: border-box;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: $box-shadow;
  padding: 25px;
}

.table {
  &__empty {
    margin-top: 10px;
    color: $dark-border;
  }

  &__header {
    padding: 0 0 0 7px;
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

  &__item {
    position: relative;
    margin-bottom: 10px;
    margin-right: 25px;
    width: 200px;
  }

  &__itemLong {
    position: relative;
    margin-bottom: 10px;
    margin-right: 25px;
    width: 330px;
  }

  &__input {
    position: relative;
    height: 32px;
  }
}

label {
  display: block;
  margin-bottom: 3px;
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
  width: 200px;
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


</style>
