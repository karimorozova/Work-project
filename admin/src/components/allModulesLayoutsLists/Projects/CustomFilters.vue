<template lang="pug">
  .moduleFilters
    template(v-for="({ id, name }) in tableFilters")

      .filter(v-if="id === 'f_projectId'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace

      .filter(v-if="id === 'f_projectName'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace

      .filter(v-if="id === 'f_requestId'")
        .filter__label {{name}}
        .filter__input
          input(type="text" placeholder="Value" :value="getSimpleValue(id)"  @change="(e) => setSimpleValue(id, e.target.value)")
          .remove(v-if="getSimpleValue(id).length" @click="removeQuery(id)")
            i.fas.fa-backspace

      .filter(v-if="id === 'f_projectManager'")
        .filter__label {{name}}
        .filter__input
          SelectSingle(
            :hasSearch="true"
            :selectedOption="selectedPM"
            :options="allPMs"
            placeholder="Option"
            @chooseOption="setPM"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

      .filter(v-if="id === 'f_accountManager'")
        .filter__label {{name}}
        .filter__input
          SelectSingle(
            :hasSearch="true"
            :selectedOption="selectedAM"
            :options="allAMs"
            placeholder="Option"
            @chooseOption="setAM"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

      .filter(v-if="id === 'f_startDate'")
        .filter__label {{name}}
        .filter__input
          DatePicker(
            :value="selectedStartDateRange"
            @input="(e) => replaceRoute('f_startDate', `${ new Date(e[0]).getTime() }_${ new Date(e[1]).getTime() }`)"
            format="MMM D: HH:mm"
            prefix-class="xmx"
            range-separator=" - "
            :clearable="false"
            type="datetime"
            range
            placeholder="Datetime range"
          )
          .remove(v-if="!!selectedStartDateRange[0]" @click="removeQuery(id)")
            i.fas.fa-backspace

      .filter(v-if="id === 'f_deadline'")
        .filter__label {{name}}
        .filter__input
          DatePicker(
            :value="selectedDeadlineRange"
            @input="(e) => replaceRoute('f_deadline', `${ new Date(e[0]).getTime() }_${ new Date(e[1]).getTime() }`)"
            format="MMM D: HH:mm"
            prefix-class="xmx"
            range-separator=" - "
            :clearable="false"
            type="datetime"
            range
            placeholder="Datetime range"
          )
          .remove(v-if="!!selectedDeadlineRange[0]" @click="removeQuery(id)")
            i.fas.fa-backspace

      .filter(v-if="id === 'f_industry'")
        .filter__label {{name}}
        .filter__input
          SelectSingle(
            :hasSearch="true"
            :selectedOption="selectedIndustry"
            :options="allIndustries"
            placeholder="Option"
            @chooseOption="setIndustry"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

      .filter(v-if="id === 'f_sourceLanguages'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedSourceLanguages"
            :options="languages.map(({ lang }) => lang) | firstEnglishLanguage"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setSourceLanguages"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

      .filter(v-if="id === 'f_targetLanguages'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedTargetLanguages"
            :options="languages.map(({ lang }) => lang)"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setTargetLanguages"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

      .filter(v-if="id === 'f_vendors'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedVendors"
            :options="allVendors"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setVendors"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

      .filter(v-if="id === 'f_clients'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedClients"
            :options="allClients"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setClients"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

      .filter(v-if="id === 'f_tasksStatuses'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedTasksStatuses"
            :options="allTasksStatuses"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setTasksStatus"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

      .filter(v-if="id === 'f_stepsStatuses'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedStepsStatuses"
            :options="allStepsStatuses"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setStepsStatus"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

      .filter(v-if="id === 'f_projectCurrency'")
        .filter__label {{name}}
        .filter__input
          SelectSingle(
            :selectedOption="getSimpleValue(id)"
            :options="allCurrency"
            placeholder="Option"
            @chooseOption="({option}) => setSimpleValue(id, option)"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )
      .filter(v-if="id === 'f_isTest'")
        .filter__label {{name}}
        .filter__input
          SelectSingle(
            :selectedOption="getSimpleValue(id)"
            :options="booleanOptions"
            placeholder="Option"
            @chooseOption="({option}) => setSimpleValue(id, option)"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )
      .filter(v-if="id === 'f_tasksServices'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedTasksServices"
            :options="services.map(i => i.title)"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setTasksServices"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

      .filter(v-if="id === 'f_stepsServices'")
        .filter__label {{name}}
        .filter__input
          SelectMulti(
            :selectedOptions="selectedStepsServices"
            :options="settingSteps.map(i => i.title)"
            :hasSearch="true"
            placeholder="Options"
            @chooseOptions="setStepsServices"
            :isSelectedWithIcon="true"
            :isRemoveOption="true"
            @removeOption="removeQuery(id)"
          )

</template>

<script>
import LayoutWrapperMixin from "../../../mixins/LayoutWrapperMixin"
import { mapGetters } from "vuex"
import SelectSingle from "../../SelectSingle"
import SelectMulti from "../../SelectMulti"
import '../../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'

export default {
  name: "CustomFilters",
  components: { SelectMulti, SelectSingle, DatePicker },
  mixins: [ LayoutWrapperMixin ],
  props: {
    tableFilters: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      vendors: [],
      clients: [],
      booleanOptions: [ 'Yes', 'No' ],
      allCurrency: [ 'EUR', 'USD', 'GBP' ],
      allTasksStatuses: [ 'Created', 'Approved', 'Rejected', 'Quote Sent', 'In progress', 'Pending Approval [DR1]', 'Completed', 'Cancelled', 'Cancelled Halfway' ],
      allStepsStatuses: [ 'Created', 'Approved', 'Rejected', 'Request Sent', 'Ready to Start', 'Waiting to Start', 'In progress', 'Completed', 'Cancelled', 'Cancelled Halfway' ]
    }
  },
  methods: {
    getServicesIdByTitle(option) {
      const { _id } = this.services.find(({ title }) => title === option)
      return _id
    },
    setTasksServices({ option }) {
      if (!this.$route.query.f_tasksServices) {
        this.replaceRoute('f_tasksServices', this.getServicesIdByTitle(option))
        return
      }
      let _ids = this.$route.query.f_tasksServices.split(',')
      if (_ids.includes(this.getServicesIdByTitle(option))) _ids = _ids.filter(_id => _id !== this.getServicesIdByTitle(option))
      else _ids.push(this.getServicesIdByTitle(option))
      this.replaceRoute('f_tasksServices', _ids.join(','))
    },
    getStepsIdByTitle(option) {
      const { _id } = this.settingSteps.find(({ title }) => title === option)
      return _id
    },
    setStepsServices({ option }) {
      if (!this.$route.query.f_stepsServices) {
        this.replaceRoute('f_stepsServices', this.getStepsIdByTitle(option))
        return
      }
      let _ids = this.$route.query.f_stepsServices.split(',')
      if (_ids.includes(this.getStepsIdByTitle(option))) _ids = _ids.filter(_id => _id !== this.getStepsIdByTitle(option))
      else _ids.push(this.getStepsIdByTitle(option))
      this.replaceRoute('f_stepsServices', _ids.join(','))
    },
    setTasksStatus({ option }) {
      if (!this.$route.query.f_tasksStatuses) {
        this.replaceRoute('f_tasksStatuses', option)
        return
      }
      let statuses = this.$route.query.f_tasksStatuses.split(',')
      if (statuses.includes(option)) statuses = statuses.filter(status => status !== option)
      else statuses.push(option)
      this.replaceRoute('f_tasksStatuses', statuses.join(','))
    },
    setStepsStatus({ option }) {
      if (!this.$route.query.f_stepsStatuses) {
        this.replaceRoute('f_stepsStatuses', option)
        return
      }
      let statuses = this.$route.query.f_stepsStatuses.split(',')
      if (statuses.includes(option)) statuses = statuses.filter(status => status !== option)
      else statuses.push(option)
      this.replaceRoute('f_stepsStatuses', statuses.join(','))
    },
    getVendorsIdByFullName(option) {
      const { _id } = this.vendors.find(({ firstName, surname }) => `${ firstName } ${ surname }` === option)
      return _id
    },
    getClientsIdByFullName(option) {
      const { _id } = this.clients.find(({ name }) => `${ name }` === option)
      return _id
    },
    setClients({ option }) {
      if (!this.$route.query.f_clients) {
        this.replaceRoute('f_clients', this.getClientsIdByFullName(option))
        return
      }
      let _ids = this.$route.query.f_clients.split(',')
      if (_ids.includes(this.getClientsIdByFullName(option))) _ids = _ids.filter(_id => _id !== this.getClientsIdByFullName(option))
      else _ids.push(this.getClientsIdByFullName(option))
      this.replaceRoute('f_clients', _ids.join(','))
    },
    setVendors({ option }) {
      if (!this.$route.query.f_vendors) {
        this.replaceRoute('f_vendors', this.getVendorsIdByFullName(option))
        return
      }
      let _ids = this.$route.query.f_vendors.split(',')
      if (_ids.includes(this.getVendorsIdByFullName(option))) _ids = _ids.filter(_id => _id !== this.getVendorsIdByFullName(option))
      else _ids.push(this.getVendorsIdByFullName(option))
      this.replaceRoute('f_vendors', _ids.join(','))
    },
    setSourceLanguages({ option }) {
      if (!this.$route.query.f_sourceLanguages) {
        this.replaceRoute('f_sourceLanguages', this.getLanguageIdByLang(option))
        return
      }
      let _ids = this.$route.query.f_sourceLanguages.split(',')
      if (_ids.includes(this.getLanguageIdByLang(option))) _ids = _ids.filter(_id => _id !== this.getLanguageIdByLang(option))
      else _ids.push(this.getLanguageIdByLang(option))
      this.replaceRoute('f_sourceLanguages', _ids.join(','))
    },
    setTargetLanguages({ option }) {
      if (!this.$route.query.f_targetLanguages) {
        this.replaceRoute('f_targetLanguages', this.getLanguageIdByLang(option))
        return
      }
      let _ids = this.$route.query.f_targetLanguages.split(',')
      if (_ids.includes(this.getLanguageIdByLang(option))) _ids = _ids.filter(_id => _id !== this.getLanguageIdByLang(option))
      else _ids.push(this.getLanguageIdByLang(option))
      this.replaceRoute('f_targetLanguages', _ids.join(','))
    },
    getLanguageIdByLang(option) {
      const { _id } = this.languages.find(({ lang }) => lang === option)
      return _id
    },
    setPM({ option }) {
      const { _id } = this.users.find(({ firstName, lastName }) => `${ firstName } ${ lastName }` === option)
      this.replaceRoute('f_projectManager', _id)
    },
    setAM({ option }) {
      const { _id } = this.users.find(({ firstName, lastName }) => `${ firstName } ${ lastName }` === option)
      this.replaceRoute('f_accountManager', _id)
    },
    setIndustry({ option }) {
      const { _id } = this.industries.find(({ name }) => name === option)
      this.replaceRoute('f_industry', _id)
    }
  },
  async created() {
    this.vendors = (await this.$http.get('/pm-manage/vendors-for-options')).data
    this.clients = (await this.$http.get('/pm-manage/clients-for-options')).data
  },
  computed: {
    ...mapGetters({
      users: "getUsers",
      languages: "getAllLanguages",
      services: "getAllServices",
      settingSteps: "getAllSteps",
      industries: "getAllIndustries"
    }),
    selectedTasksServices() {
      return this.$route.query.f_tasksServices && this.services.length ? this.$route.query.f_tasksServices.split(',').map(_id => this.services.find(service => _id === service._id).title) : []
    },
    selectedStepsServices() {
      return this.$route.query.f_stepsServices && this.settingSteps.length ? this.$route.query.f_stepsServices.split(',').map(_id => this.settingSteps.find(step => _id === step._id).title) : []
    },
    selectedTasksStatuses() {
      return this.$route.query.f_tasksStatuses ? this.$route.query.f_tasksStatuses.split(',') : []
    },
    selectedStepsStatuses() {
      return this.$route.query.f_stepsStatuses ? this.$route.query.f_stepsStatuses.split(',') : []
    },
    selectedVendors() {
      return this.$route.query.f_vendors && this.vendors.length ? this.$route.query.f_vendors.split(',').map(_id => {
        const vendor = this.vendors.find(i => _id === i._id)
        return vendor ? `${ vendor.firstName } ${ vendor.surname }` : ''
      }) : []
    },
    selectedClients() {
      return this.$route.query.f_clients && this.clients.length ? this.$route.query.f_clients.split(',').map(_id => {
        const client = this.clients.find(i => _id === i._id)
        return client ? `${ client.name }` : ''
      }) : []
    },
    selectedSourceLanguages() {
      return this.$route.query.f_sourceLanguages && this.languages.length
          ? this.$route.query.f_sourceLanguages.split(',').map(_id => this.languages.find(language => _id === language._id).lang)
          : []
    },
    selectedTargetLanguages() {
      return this.$route.query.f_targetLanguages && this.languages.length
          ? this.$route.query.f_targetLanguages.split(',').map(_id => this.languages.find(language => _id === language._id).lang)
          : []
    },
    selectedIndustry() {
      if (this.$route.query.f_industry && this.industries.length) {
        const { name } = this.industries.find(({ _id }) => `${ _id }` === `${ this.$route.query.f_industry }`)
        return name
      }
      return ''
    },
    selectedStartDateRange() {
      return this.$route.query.f_startDate
          ? [ new Date(+this.$route.query.f_startDate.split('_')[0]), new Date(+this.$route.query.f_startDate.split('_')[1]) ]
          : [ null, null ]
    },
    selectedDeadlineRange() {
      return this.$route.query.f_deadline
          ? [ new Date(+this.$route.query.f_deadline.split('_')[0]), new Date(+this.$route.query.f_deadline.split('_')[1]) ]
          : [ null, null ]
    },
    selectedPM() {
      if (this.$route.query.f_projectManager && this.users.length) {
        const { firstName, lastName } = this.users.find(({ _id }) => `${ _id }` === `${ this.$route.query.f_projectManager }`)
        return `${ firstName } ${ lastName }`
      }
      return ''
    },
    selectedAM() {
      if (this.$route.query.f_accountManager && this.users.length) {
        const { firstName, lastName } = this.users.find(({ _id }) => `${ _id }` === `${ this.$route.query.f_accountManager }`)
        return `${ firstName } ${ lastName }`
      }
      return ''
    },
    allPMs() {
      return this.users.filter(({ group }) => group.name === 'Project Managers').map(({ firstName, lastName }) => `${ firstName } ${ lastName }`)
    },
    allAMs() {
      return this.users.filter(({ group }) => group.name === 'Account Managers').map(({ firstName, lastName }) => `${ firstName } ${ lastName }`)
    },
    allIndustries() {
      return this.industries.map(({ name }) => name)
    },
    allVendors() {
      return this.vendors.map(({ firstName, surname }) => `${ firstName } ${ surname }`)
    },
    allClients() {
      return this.clients.map(({ name }) => `${ name }`)
    },
    allServices() {
      return this.services.map(({ title }) => title)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/colors';

.moduleFilters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px 25px;
}

.filter {
  width: 220px;

  &__label {
    margin-bottom: 3px;
    font-family: 'Myriad600';
  }

  &__input {
    position: relative;
    height: 32px;
    width: 220px;
    background: white;
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


}

.remove {
  font-size: 15px;
  transition: .2s ease-out;
  color: $dark-border;
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 8px;
  background: white;

  &:hover {
    color: $text;
  }
}

</style>