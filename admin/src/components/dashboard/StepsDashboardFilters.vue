<template lang="pug">
  .filter
    .filter__item
      label Project Id:
      .filter__input
        input(type="text" placeholder="Value" :value="projectIdValue" @change="(e) => setFilter(e, 'projectId')" @keyup.13="(e) => setFilter(e, 'projectId')")
        .clear-icon(v-if="projectIdValue.length" @click="removeFromRoute('projectId')")
          i.fas.fa-backspace

    .filter__item
      label Project Name:
      .filter__input
        input(type="text" placeholder="Value" :value="projectNameValue" @change="(e) => setFilter(e, 'projectName')" @keyup.13="(e) => setFilter(e, 'projectName')")
        .clear-icon(v-if="projectNameValue.length" @click="removeFromRoute('projectName')")
          i.fas.fa-backspace

    .filter__item
      label Project Manager:
      .filter__input
        SelectSingle(
          :isDisabled="isPm"
          :hasSearch="true"
          :selectedOption="selectedPM"
          :options="allPMs"
          placeholder="Option"
          @chooseOption="setPM"
          :isRemoveOption="true"
          @removeOption="removeFromRoute('projectManager')"
        )

    .filter__item
      label Account Manager:
      .filter__input
        SelectSingle(
          :hasSearch="true"
          :selectedOption="selectedAM"
          :options="allAMs"
          placeholder="Option"
          @chooseOption="setAM"
          :isRemoveOption="true"
          @removeOption="removeFromRoute('accountManager')"
        )

    .filter__item
      label Statuses:
      .filter__input
        SelectMulti(
          :selectedOptions="selectedStepsStatuses"
          :options="stepStatuses"
          :hasSearch="true"
          placeholder="Options"
          @chooseOptions="setTasksStatus"
          :isSelectedWithIcon="true"
          :isRemoveOption="true"
          @removeOption="removeFromRoute('stepsStatuses')"
        )

    .filter__item

    .filter__item
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
          @removeOption="removeFromRoute('sourceLanguages')"
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
          @removeOption="removeFromRoute('targetLanguages')"
        )

    .filter__item
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
          @removeOption="removeFromRoute('services')"
        )

    .filter__item
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
          @removeOption="removeFromRoute('vendors')"
        )
    .filter__item
      label Clients:
      .filter__input
        SelectMulti(
          :selectedOptions="selectedClients"
          :options="allClients"
          :hasSearch="true"
          placeholder="Options"
          @chooseOptions="setClients"
          :isSelectedWithIcon="true"
          :isRemoveOption="true"
          @removeOption="removeFromRoute('clients')"
        )

    .filter__item
    .filter__item
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
        i.fas.fa-backspace.backspace-long

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
        i.fas.fa-backspace.backspace-long

</template>

<script>
import { mapGetters } from "vuex"
import SelectSingle from "../SelectSingle"
import SelectMulti from "../SelectMulti"
import '../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'

export default {
  name: "DashboardStepsFilters",
  components: {
    SelectSingle,
    SelectMulti,
    DatePicker
  },
  props: {
    userGroup: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      vendors: [],
      allClientsNames: [],
      stepStatuses: [ 'Created', 'Approved', 'Rejected', 'Request Sent', 'Ready to Start', 'Waiting to Start', 'In progress' ]
    }
  },
  methods: {
    replaceRoute(key, value) {
      let query = this.$route.query
      delete query[key]
      this.$router.replace({ path: this.$route.path, query: { ...query, [key]: value } })
    },
    getLanguageIdByLang(option) {
      const { _id } = this.languages.find(({ lang }) => lang === option)
      return _id
    },
    getServicesIdByTitle(option) {
      const { _id } = this.steps.find(({ title }) => title === option)
      return _id
    },
    getVendorsIdByFullName(option) {
      const { _id } = this.vendors.find(({ firstName, surname }) => `${ firstName } ${ surname }` === option)
      return _id
    },
    getClientsIdByName(option) {
      const { _id } = this.allClientsNames.find(({ name }) => `${ name }` === option)
      return _id
    },
    setFilter(e, fieldName) {
      const { value } = e.target
      this.replaceRoute(fieldName, value)
    },
    removeFromRoute(field) {
      this.replaceRoute(field, '')
    },
    setTasksStatus({ option }) {
      if (!this.$route.query.stepsStatuses) {
        this.replaceRoute('stepsStatuses', option)
        return
      }
      let statuses = this.$route.query.stepsStatuses.split(',')
      if (statuses.includes(option)) statuses = statuses.filter(status => status !== option)
      else statuses.push(option)
      this.replaceRoute('stepsStatuses', statuses.join(','))
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
    setPM({ option }) {
      const { _id } = this.users.find(({ firstName, lastName }) => `${ firstName } ${ lastName }` === option)
      this.replaceRoute('projectManager', _id)
    },
    setAM({ option }) {
      const { _id } = this.users.find(({ firstName, lastName }) => `${ firstName } ${ lastName }` === option)
      this.replaceRoute('accountManager', _id)
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
    setClients({ option }) {
      if (!this.$route.query.clients) {
        this.replaceRoute('clients', this.getClientsIdByName(option))
        return
      }
      let _ids = this.$route.query.clients.split(',')
      if (_ids.includes(this.getClientsIdByName(option))) _ids = _ids.filter(_id => _id !== this.getClientsIdByName(option))
      else _ids.push(this.getClientsIdByName(option))
      this.replaceRoute('clients', _ids.join(','))
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
    setStartRange(e) {
      let query = this.$route.query
      delete query.startDateFrom
      delete query.startDateTo
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...query,
          startDateFrom: new Date(e[0]).getTime(),
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
    removeSelectedStartRange() {
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
  computed: {
    ...mapGetters({
      users: "getUsers",
      languages: "getAllLanguages",
      services: "getAllServices",
      steps: "getAllSteps",
      // industries: "getAllIndustries",
      // vendors: "getAllVendorsForOptions",
      // allClientsNames: "getAllClientsForOptions"
    }),
    selectedStartRange() {
      return this.$route.query.startDateFrom
          ? [ new Date(+this.$route.query.startDateFrom), new Date(+this.$route.query.startDateTo) ]
          : [ null, null ]
    },
    selectedDeadlineRange() {
      return this.$route.query.deadlineFrom
          ? [ new Date(+this.$route.query.deadlineFrom), new Date(+this.$route.query.deadlineTo) ]
          : [ null, null ]
    },
    allServices() {
      return this.steps.map(({ title }) => title)
    },
    mappedLanguages() {
      return this.languages.map(({ lang }) => lang)
    },
    projectIdValue() {
      return this.$route.query.projectId || ''
    },
    projectNameValue() {
      return this.$route.query.projectName || ''
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
    allVendors() {
      return this.vendors.map(({ firstName, surname }) => `${ firstName } ${ surname }`)
    },
    allClients() {
      return this.allClientsNames.map(({ name }) => `${ name }`)
    },
    selectedStepsStatuses() {
      return this.$route.query.stepsStatuses
          ? this.$route.query.stepsStatuses.split(',')
          : []
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
      return this.$route.query.services && this.steps.length
          ? this.$route.query.services.split(',').map(_id => this.steps.find(step => _id === step._id).title)
          : []
    },
    selectedVendors() {
      return this.$route.query.vendors && this.vendors.length
          ? this.$route.query.vendors.split(',').map(_id => {
            const vendor = this.vendors.find(vendor => _id === vendor._id)
            return vendor ? `${ vendor.firstName } ${ vendor.surname }` : ''
          })
          : []

    },
    selectedClients() {
      return this.$route.query.clients && this.allClientsNames.length
          ? this.$route.query.clients.split(',').map(_id => {
            const client = this.allClientsNames.find(client => _id === client._id)
            return client ? `${ client.name }` : ''
          })
          : []

    },
    isPm() {
      return this.userGroup.name === 'Project Managers'
    }
  },
  async created() {
    this.vendors = (await this.$http.get('/pm-manage/vendors-for-options')).data
    this.allClientsNames = (await this.$http.get('/pm-manage/clients-for-options')).data

  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.filter {
  display: flex;
  flex-wrap: wrap;

  &__itemLong {
    position: relative;
    margin-bottom: 15px;
    margin-right: 25px;
    width: 342.5px;
  }

  &__item {
    position: relative;
    margin-bottom: 15px;
    margin-right: 25px;
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

.backspace-long {
  position: absolute;
  right: 34px !important;
  top: 27px !important;
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

.range-with-one-panel {
  width: 342.5px;
}
</style>