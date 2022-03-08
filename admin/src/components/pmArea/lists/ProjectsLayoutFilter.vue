<template lang="pug">
  .filter(v-if="Object.keys(user).length")
    template(v-for="filter in user.layoutsSettings.project.filters")
      .filter__item(v-if="filter === 'projectId'")
        label Project Id:
        .filter__input
          input(type="text" placeholder="Value" :value="projectIdValue" @change="projectIdSetFilter" @keyup.13="projectIdSetFilter")
          .clear-icon(v-if="projectIdValue.length" @click="removeSelectedInputs('projectId')")
            i.fas.fa-backspace

      .filter__item(v-if="filter === 'projectName'")
        label Project Name:
        .filter__input
          input(type="text" placeholder="Value" :value="projectNameValue" @change="projectNameSetFilter" @keyup.13="projectNameSetFilter")
          .clear-icon(v-if="projectNameValue.length" @click="removeSelectedInputs('projectName')")
            i.fas.fa-backspace

      .filter__item(v-if="filter === 'clientName'")
        label Client Name:
        .filter__input
          input(type="text" placeholder="Value" :value="clientNameValue" @change="clientNameSetFilter" @keyup.13="clientNameSetFilter")
          .clear-icon(v-if="clientNameValue.length" @click="removeSelectedInputs('clientName')")
            i.fas.fa-backspace

      .filter__item(v-if="filter === 'projectManager'")
        label Project Manager:
        .filter__input
          SelectSingle(
            :hasSearch="true"
            :selectedOption="selectedPM"
            :options="allPMs"
            placeholder="Option"
            @chooseOption="setPM"
            :isRemoveOption="true"
            @removeOption="removePM"
          )

      .filter__item(v-if="filter === 'accountManger'")
        label Account Manager:
        .filter__input
          SelectSingle(
            :hasSearch="true"
            :selectedOption="selectedAM"
            :options="allAMs"
            placeholder="Option"
            @chooseOption="setAM"
            :isRemoveOption="true"
            @removeOption="removeAM"
          )

      .filter__item(v-if="filter === 'startDate'")
        label Start Date:
        .filter__input
          DatePicker.range-with-one-panel-short(
            :value="selectedStartDateRange"
            @input="(e) => setStartDateRange(e)"
            format="DD-MM-YYYY, HH:mm"
            prefix-class="xmx"
            range-separator=" - "
            :clearable="false"
            type="datetime"
            range
            placeholder="Select datetime range"
          )
        .clear-icon-picker(v-if="!!selectedStartDateRange[0]" @click="removeSelectedStartDateRange()")
          i.fas.fa-backspace.backspace-long

      .filter__item(v-if="filter === 'deadline'")
        label Deadline:
        .filter__input
          DatePicker.range-with-one-panel-short(
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
          i.fas.fa-backspace.backspace-long

      .filter__item(v-if="filter === 'sourceLanguages'")
        label Source Languages:
        .filter__input
          SelectMulti(
            :selectedOptions="selectedSourceLanguages"
            :options="mappedLanguages | firstEnglishLanguage"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="chooseSourceLanguages"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeSourceLanguages"
          )

      .filter__item(v-if="filter === 'targetLanguages'")
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

      .filter__item(v-if="filter === 'industry'")
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

      .filter__item(v-if="filter === 'services'")
        label Services:
        .filter__input
          SelectMulti(
            :selectedOptions="selectedServices"
            :options="allServices"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setServices"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeService"
          )

      .filter__item(v-if="filter === 'tasksStatuses'")
        label Tasks Statuses:
        .filter__input
          SelectMulti(
            :selectedOptions="selectedTasksStatuses"
            :options="allTasksStatuses"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setTasksStatus"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeTasksStatus"
          )

      .filter__item(v-if="filter === 'vendors'")
        label Vendors:
        .filter__input
          SelectMulti(
            :selectedOptions="selectedVendors"
            :options="allVendors"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setVendors"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeVendors"
          )

      .filter__item(v-if="filter === 'isTest'")
        label Test:
        .filter__input
          SelectSingle(
            :selectedOption="selectedIsTest"
            :options="booleanOptions"
            placeholder="Option"
            @chooseOption="setIsTest"
            :isRemoveOption="true"
            @removeOption="removeIsTest"
          )

      .filter__item(v-if="filter === 'projectCurrency'")
        label Currency:
        .filter__input
          SelectSingle(
            :selectedOption="selectedProjectCurrency"
            :options="allCurrency"
            placeholder="Option"
            @chooseOption="setProjectCurrency"
            :isRemoveOption="true"
            @removeOption="removeProjectCurrency"
          )

      .filter__item(v-if="filter === 'paymentProfile'")
        label Payment Profile:
        .filter__input
          SelectSingle(
            :selectedOption="selectedPaymentProfile"
            :options="allPaymentProfile"
            placeholder="Option"
            @chooseOption="setPaymentProfile"
            :isRemoveOption="true"
            @removeOption="removePaymentProfile"
          )

      .filter__item(v-if="filter === 'requestId'")
        label Request Id:
        .filter__input
          input(type="text" placeholder="Value" :value="requestIdValue" @change="requestIdSetFilter" @keyup.13="requestIdSetFilter")
          .clear-icon(v-if="requestIdValue.length" @click="removeSelectedInputs('requestId')")
            i.fas.fa-backspace

</template>

<script>
import SelectSingle from "../../SelectSingle"
import { mapGetters } from "vuex"
import moment from "moment"
import SelectMulti from "../../SelectMulti"
import '../../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'

export default {
  components: { SelectMulti, DatePicker, SelectSingle },
  props: {},
  data() {
    return {
      booleanOptions: [ 'Yes', 'No' ],
      allCurrency: [ 'EUR', 'USD', 'GBP' ],
      allPaymentProfile: [],
      allTasksStatuses: [ 'Created', "Quote Sent", "Approved", "Rejected", "In progress", "Pending Approval [DR1]", "Completed", "Cancelled", "Cancelled Halfway" ],
      disabled: {
        to: moment().add(-1, 'day').endOf('day').toDate()
      },
      vendors: [],
      highlighted: {
        days: [ 6, 0 ]
      }
    }
  },
  methods: {
    removeTasksStatus() {
      this.replaceRoute('tasksStatuses', '')
    },
    removePaymentProfile() {
      this.replaceRoute('paymentProfile', '')
    },
    removeIsTest() {
      this.replaceRoute('isTest', '')
    },
    removeProjectCurrency() {
      this.replaceRoute('projectCurrency', '')
    },
    removeSelectedInputs(prop) {
      this.replaceRoute(prop, '')
    },
    removeSourceLanguages() {
      this.replaceRoute('sourceLanguages', '')
    },
    removeTargetLanguages() {
      this.replaceRoute('targetLanguages', '')
    },
    removeService() {
      this.replaceRoute('services', '')
    },
    removeVendors() {
      this.replaceRoute('vendors', '')
    },
    removeIndustry() {
      this.replaceRoute('industry', '')
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
    customFormatter(date) {
      return moment(date).format('MMMM D')
    },
    replaceRoute(key, value) {
      let query = this.$route.query
      delete query[key]
      this.$router.replace({ path: this.$route.path, query: { ...query, [key]: value } })
    },
    requestIdSetFilter(e) {
      const { value } = e.target
      this.replaceRoute('requestId', value)
    },
    projectIdSetFilter(e) {
      const { value } = e.target
      this.replaceRoute('projectId', value)
    },
    projectNameSetFilter(e) {
      const { value } = e.target
      this.replaceRoute('projectName', value)
    },
    clientNameSetFilter(e) {
      const { value } = e.target
      this.replaceRoute('clientName', value)
    },
    setPM({ option }) {
      const { _id } = this.users.find(({ firstName, lastName }) => `${ firstName } ${ lastName }` === option)
      this.replaceRoute('projectManager', _id)
    },
    setAM({ option }) {
      const { _id } = this.users.find(({ firstName, lastName }) => `${ firstName } ${ lastName }` === option)
      this.replaceRoute('accountManager', _id)
    },
    setIndustry({ option }) {
      const { _id } = this.industries.find(({ name }) => name === option)
      this.replaceRoute('industry', _id)
    },
    getServicesIdByTitle(option) {
      const { _id } = this.services.find(({ title }) => title === option)
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
    setTasksStatus({ option }) {
      if (!this.$route.query.tasksStatuses) {
        this.replaceRoute('tasksStatuses', option)
        return
      }
      let statuses = this.$route.query.tasksStatuses.split(',')
      if (statuses.includes(option)) statuses = statuses.filter(status => status !== option)
      else statuses.push(option)
      this.replaceRoute('tasksStatuses', statuses.join(','))
    },
    getVendorsIdByFullName(option) {
      const { _id } = this.vendors.find(({ firstName, surname }) => `${ firstName } ${ surname }` === option)
      return _id
    },
    setVendors({ option }) {
      if (!this.$route.query.vendors) {
        this.replaceRoute('vendors', this.getVendorsIdByFullName(option))
        return
      }
      let _ids = this.$route.query.vendors.split(',')
      if (_ids.includes(this.getVendorsIdByFullName(option))) _ids = _ids.filter(_id => _id !== this.getVendorsIdByFullName(option))
      else _ids.push(this.getVendorsIdByFullName(option))
      this.replaceRoute('vendors', _ids.join(','))
    },
    setPaymentProfile({ option }) {
      this.replaceRoute('paymentProfile', option)
    },
    setIsTest({ option }) {
      this.replaceRoute('isTest', option)
    },
    setProjectCurrency({ option }) {
      this.replaceRoute('projectCurrency', option)
    },
    removePM() {
      this.replaceRoute('projectManager', '')
    },
    removeAM() {
      this.replaceRoute('accountManager', '')
    },
    setStartDateRange(e) {
      let query = this.$route.query
      delete query.startDateFrom
      delete query.startDateTo
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...query, startDateFrom: new Date(e[0]).getTime(),
          startDateTo: new Date(e[1]).getTime()
        }
      })
    },
    setDeadlineRange(e) {
      let query = this.$route.query
      delete query.deadlineFrom
      delete query.deadlineTo
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...query, deadlineFrom: new Date(e[0]).getTime(),
          deadlineTo: new Date(e[1]).getTime()
        }
      })
    },
    removeSelectedStartDateRange() {
      let query = this.$route.query
      this.$router.replace({
        path: this.$route.path,
        query: { ...query, startDateFrom: '', startDateTo: '' }
      })
    },
    removeSelectedDeadlineRange() {
      let query = this.$route.query
      this.$router.replace({
        path: this.$route.path,
        query: { ...query, deadlineFrom: '', deadlineTo: '' }
      })
    }
  },
  async created() {
    this.vendors = (await this.$http.get('/pm-manage/vendors-for-options')).data
  },
  computed: {
    ...mapGetters({
      users: "getUsers",
      user: "getUser",
      languages: "getAllLanguages",
      services: "getAllServices",
      industries: "getAllIndustries"
    }),
    mappedLanguages() {
      return this.languages.map(({ lang }) => lang)
    },
    requestIdValue() {
      return this.$route.query.requestId || ''
    },
    projectIdValue() {
      return this.$route.query.projectId || ''
    },
    projectNameValue() {
      return this.$route.query.projectName || ''
    },
    selectedPaymentProfile() {
      return this.$route.query.paymentProfile || ''
    },
    selectedIsTest() {
      return this.$route.query.isTest || ''
    },
    selectedProjectCurrency() {
      return this.$route.query.projectCurrency || ''
    },
    clientNameValue() {
      return this.$route.query.clientName || ''
    },
    selectedPM() {
      if (this.$route.query.projectManager && this.users.length) {
        const { firstName, lastName } = this.users.find(({ _id }) => `${ _id }` === `${ this.$route.query.projectManager }`)
        return `${ firstName } ${ lastName }`
      }
      return ''
    },
    selectedAM() {
      if (this.$route.query.accountManager && this.users.length) {
        const { firstName, lastName } = this.users.find(({ _id }) => `${ _id }` === `${ this.$route.query.accountManager }`)
        return `${ firstName } ${ lastName }`
      }
      return ''
    },
    allPMs() {
      return this.users
          .filter(({ group }) => group.name === 'Project Managers')
          .map(({ firstName, lastName }) => `${ firstName } ${ lastName }`)
    },
    allAMs() {
      return this.users
          .filter(({ group }) => group.name === 'Account Managers')
          .map(({ firstName, lastName }) => `${ firstName } ${ lastName }`)
    },
    allIndustries() {
      return this.industries.map(({ name }) => name)
    },
    allVendors() {
      return this.vendors.map(({ firstName, surname }) => `${ firstName } ${ surname }`)
    },
    allServices() {
      return this.services.map(({ title }) => title)
    },
    selectedStartDateRange() {
      return this.$route.query.startDateFrom
          ? [ new Date(+this.$route.query.startDateFrom), new Date(+this.$route.query.startDateTo) ]
          : [ null, null ]
    },
    selectedDeadlineRange() {
      return this.$route.query.deadlineFrom
          ? [ new Date(+this.$route.query.deadlineFrom), new Date(+this.$route.query.deadlineTo) ]
          : [ null, null ]
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
    selectedServices() {
      return this.$route.query.services && this.services.length
          ? this.$route.query.services.split(',').map(_id => this.services.find(service => _id === service._id).title)
          : []
    },
    selectedTasksStatuses() {
      return this.$route.query.tasksStatuses
          ? this.$route.query.tasksStatuses.split(',')
          : []
    },
    selectedVendors() {
      return this.$route.query.vendors && this.vendors.length
          ? this.$route.query.vendors.split(',').map(_id => {
            const vendor = this.vendors.find(vendor => _id === vendor._id)
            return vendor ? `${ vendor.firstName } ${ vendor.surname }` : ''
          })
          : []

    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";
@import "../../../assets/scss/LayoutFilters";


.filter {
  //display: flex;
  //flex-wrap: wrap;

  &__item {
    position: relative;
    margin-bottom: 15px;
    //margin-right: 25px;
    width: 220px;
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
  border-radius: 2px;
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

.range-with-one-panel-short {
  width: 220px !important;
}

.backspace-long {
  position: absolute;
  right: 8px !important;
  top: 27px !important;
  background: white;
}

</style>