<template lang="pug">
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
      label Client Name:
      .filter__input
        input(type="text" placeholder="Value" :value="clientNameValue" @change="clientNameSetFilter" @keyup.13="clientNameSetFilter")
        .clear-icon(v-if="clientNameValue.length" @click="removeSelectedInputs('clientName')")
          i.fas.fa-backspace

    .filter__item
      label Project Manager:
      SelectSingle(
        :hasSearch="true"
        :selectedOption="selectedPM"
        :options="allPMs"
        placeholder="Option"
        @chooseOption="setPM"
        :isRemoveOption="true"
        @removeOption="removePM"
      )

    .filter__item
      label Account Manager:
      SelectSingle(
        :hasSearch="true"
        :selectedOption="selectedAM"
        :options="allAMs"
        placeholder="Option"
        @chooseOption="setAM"
        :isRemoveOption="true"
        @removeOption="removeAM"
      )

    .filter__item
      label Start Date:
      DatepickerWithTime(
        :value="startDateValue"
        @selected="setStartDate"
        placeholder="Date"
        :isTime="false"
        :highlighted="highlighted"
        :monday-first="true"
        inputClass="datepicker-custom-filter"
        calendarClass="calendar-custom"
        :format="customFormatter"
        :isClearIcon="true"
        @removeSelectedDate="removeStartDate"
      )

    .filter__item
      label Deadline:
      DatepickerWithTime(
        :value="deadlineValue"
        @selected="setDeadline"
        placeholder="Date"
        :isTime="false"
        :highlighted="highlighted"
        :monday-first="true"
        inputClass="datepicker-custom-filter"
        calendarClass="calendar-custom"
        :format="customFormatter"
        :isClearIcon="true"
        @removeSelectedDate="removeDeadline"
      )

    .filter__item
      label Source Languages:
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

    .filter__item
      label Target Languages:
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
</template>

<script>
	import SelectSingle from "../../SelectSingle"
	import { mapGetters } from "vuex"
	import DatepickerWithTime from "../../DatepickerWithTime"
	import moment from "moment"
	import SelectMulti from "../../SelectMulti"

	export default {
		components: { SelectMulti, DatepickerWithTime, SelectSingle },
		props: {},
		data() {
			return {
				disabled: {
					to: moment().add(-1, 'day').endOf('day').toDate()
				},
				highlighted: {
					days: [ 6, 0 ]
				}
			}
		},
		methods: {
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
				// const { _id } = this.allServices.find(({ title }) => title === option)
				// this.replaceRoute('services', _id)

        if (!this.$route.query.services) {
          this.replaceRoute('services', this.getServicesIdByTitle(option))
          return
        }
        let _ids = this.$route.query.services.split(',')
        if (_ids.includes(this.getServicesIdByTitle(option))) _ids = _ids.filter(_id => _id !== this.getServicesIdByTitle(option))
        else _ids.push(this.getServicesIdByTitle(option))
        this.replaceRoute('services', _ids.join(','))
			},
			removePM() {
				this.replaceRoute('projectManager', '')
			},
			removeAM() {
				this.replaceRoute('accountManager', '')
			},
			setStartDate(data) {
				this.replaceRoute('startDate', moment(data).format('YYYY-MM-DD'))
			},
			removeStartDate() {
				this.replaceRoute('startDate', '')
			},
			setDeadline(data) {
				this.replaceRoute('deadline', moment(data).format('YYYY-MM-DD'))
			},
			removeDeadline() {
				this.replaceRoute('deadline', '')
			}
		},
		computed: {
			...mapGetters({
				users: "getUsers",
				languages: "getAllLanguages",
        services: "getAllServices",
        industries: "getAllIndustries",
			}),
			mappedLanguages() {
				return this.languages.map(({ lang }) => lang)
			},
			projectIdValue() {
				return this.$route.query.projectId || ''
			},
			projectNameValue() {
				return this.$route.query.projectName || ''
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
				return this.industries.map(({name}) => name)
			},
      allServices() {
				return this.services.map(({title}) => title)
			},
			startDateValue() {
				return this.$route.query.startDate || ''
			},
			deadlineValue() {
				return this.$route.query.deadline || ''
			},
			selectedSourceLanguages() {
				return this.$route.query.sourceLanguages
						? this.$route.query.sourceLanguages.split(',').map(_id => this.languages.find(language => _id === language._id).lang)
						: []
			},
			selectedTargetLanguages() {
				return this.$route.query.targetLanguages
						? this.$route.query.targetLanguages.split(',').map(_id => this.languages.find(language => _id === language._id).lang)
						: []
			},
      selectedIndustry() {
        if (this.$route.query.industry) {
          const {name } = this.industries.find(({ _id }) => `${ _id }` === `${ this.$route.query.industry }`)
          return name
        }
        return ''
      },
      selectedServices() {
				return this.$route.query.services
						? this.$route.query.services.split(',').map(_id => this.services.find(service => _id === service._id).title)
						: []
			},
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .filter {
    display: flex;
    flex-wrap: wrap;

    &__item {
      position: relative;
      margin-bottom: 15px;
      margin-right: 30px;
      width: 220px;
    }

    &__input {
      position: relative;
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