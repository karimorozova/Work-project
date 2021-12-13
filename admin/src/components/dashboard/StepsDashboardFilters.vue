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
          @removeOption="removeFromRoute('tasksStatuses')"
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
      allTasksStatuses: [ 'Created', 'Approved', 'Rejected', 'Request Sent', 'Ready to Start', 'Waiting to Start', 'In progress', 'Completed', 'Cancelled', 'Cancelled Halfway' ],
      dataVariables: [
        'projectId',
        'projectName',
        'clientName',
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
        'tasksStatuses',
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
      const { _id } = this.services.find(({ title }) => title === option)
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
      if (!this.$route.query.tasksStatuses) {
        this.replaceRoute('tasksStatuses', option)
        return
      }
      let statuses = this.$route.query.tasksStatuses.split(',')
      if (statuses.includes(option)) statuses = statuses.filter(status => status !== option)
      else statuses.push(option)
      this.replaceRoute('tasksStatuses', statuses.join(','))
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
      if (this.$route.query.hasOwnProperty('projectManager') || this.$route.query.hasOwnProperty('accountManager')) return
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
      // industries: "getAllIndustries",
      // vendors: "getAllVendorsForOptions"
    }),

    allServices() {
      return this.services.map(({ title }) => title)
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
    selectedTasksStatuses() {
      return this.$route.query.tasksStatuses
          ? this.$route.query.tasksStatuses.split(',')
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
      return this.$route.query.services && this.services.length
          ? this.$route.query.services.split(',').map(_id => this.services.find(service => _id === service._id).title)
          : []
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