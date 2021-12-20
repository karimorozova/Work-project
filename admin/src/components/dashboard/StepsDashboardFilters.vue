<template lang="pug">
  .filter
    //.filter__item(v-if="filter === 'projectId'")
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

</template>

<script>
import { mapGetters } from "vuex"
import SelectSingle from "../SelectSingle"
import SelectMulti from "../SelectMulti"

export default {
  name: "DashboardStepsFilters",
  components: {
    SelectSingle,
    SelectMulti,
  },
  props: {
    userGroup: {
      type: Object,
      required: true
    },
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      stepStatuses: [ 'Created', 'Approved', 'Rejected', 'Request Sent', 'Ready to Start', 'Waiting to Start', 'In progress' ],
      dataVariables: [
        'projectId',
        'projectName',
        'clients',
        'projectManager',
        'accountManager',
        'startDate',
        'deadline',
        'sourceLanguages',
        'targetLanguages',
        'industry',
        'services',
        'isTest',
        'projectCurrency',
        'paymentProfile',
        'vendors',
        'stepsStatuses',
        'requestId'
      ],
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
    querySetter(vm, to) {
      for (let variable of this.dataVariables) if (to.query[variable] != null) vm[variable] = to.query[variable]
    },
    defaultSetter() {
      for (let variable of this.dataVariables) this[variable] = ''
    },
    setTasksStatus({ option }){
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
    setCurrentAmOrPm() {
      if ( this.$route.query.hasOwnProperty('accountManager')) return
      if( this.userGroup.name === 'Project Managers')
        this.replaceRoute('projectManager', this.userId)
      if(this.userGroup.name === 'Account Managers')
        this.replaceRoute('accountManager', this.userId)
    }

  },
  computed: {
    ...mapGetters({
      users: "getUsers",
      languages: "getAllLanguages",
      services: "getAllServices",
      steps: "getAllSteps",
      // industries: "getAllIndustries",
      vendors: "getAllVendorsForOptions",
      allClientsNames: "getAllClientsForOptions",
    }),

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
    },

  },
  mounted() {
    this.setCurrentAmOrPm()
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.filter {
  display: flex;
  flex-wrap: wrap;

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