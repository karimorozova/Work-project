<template lang="pug">
  .invoicing-reports-add
    .invoicing-reports-add__container
      .filter
        .filter__item
          label Clients:
          .filter__input
            SelectMulti(
              :selectedOptions="selectedClients"
              :options="allClients"
              :hasSearch="true"
              placeholder="Options"
              @chooseOptions="setClient"
              :isSelectedWithIcon="true"
              :isRemoveOption="true"
              @removeOption="removeClients"
            )
        .filter__item
          label Billing Date From:
          .filter__input
            DatepickerWithTime(
              :value="fromDateValue"
              @selected="setFromDate"
              placeholder="Date"
              :isTime="false"
              :highlighted="highlighted"
              :monday-first="true"
              inputClass="datepicker-custom-filter"
              calendarClass="calendar-custom"
              :format="customFormatter"
              :isClearIcon="true"
              @removeSelectedDate="removeFromDate"
            )
        .filter__item
          label Billing Date To:
          .filter__input
            DatepickerWithTime(
              :value="toDateValue"
              @selected="setToDate"
              placeholder="Date"
              :isTime="false"
              :highlighted="highlighted"
              :monday-first="true"
              inputClass="datepicker-custom-filter"
              calendarClass="calendar-custom"
              :format="customFormatter"
              :isClearIcon="true"
              @removeSelectedDate="removeToDate"
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
          label Service:
          .filter__input
            SelectSingle(
              :hasSearch="true"
              :selectedOption="selectedService"
              :options="allSettingServices"
              placeholder="Option"
              @chooseOption="setSettingService"
              :isRemoveOption="true"
              @removeOption="removeSettingService"
            )

      .invoicing-reports-add__table
        LayoutsTable(
          :fields="fields",
          :tableData="tasks",
          :customNumberOfFilterRows="2"
          @bottomScrolled="bottomScrolled"
        )

          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .table__header(v-if="field.headerKey === 'headerCheck'")
              CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
            .table__header(v-else) {{ field.label }}

          template(slot="check" slot-scope="{ row, index }")
            .table__data
              CheckBox(:isChecked="row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

          template(slot="project" slot-scope="{ row, index }")
            .table__data(style="word-break: break-word; padding-right: 20px;") {{ row.projectName.length > 46 ? (row.projectName.substring(0, 45) + '...') : row.projectName }}

          template(slot="taskId" slot-scope="{ row, index }")
            .table__data {{ row.tasks.taskId }}

          template(slot="company" slot-scope="{ row, index }")
            .table__data {{ getCompanyName(row) }}

          template(slot="startDate" slot-scope="{ row, index }")
            .table__data {{ formattedDate(row.startDate) }}

          template(slot="deadline" slot-scope="{ row, index }")
            .table__data {{ formattedDate(row.deadline) }}

          template(slot="billingDate" slot-scope="{ row, index }")
            .table__data {{ formattedDate(row.billingDate) }}

          template(slot="service" slot-scope="{ row, index }")
            .table__data {{ row.tasks.service.title }}

          template(slot="jobStatus" slot-scope="{ row, index }")
            .table__data {{ row.tasks.status }}

          template(slot="langPair" slot-scope="{ row, index }")
            .table__data(v-if="row.tasks.sourceLanguage === row.tasks.targetLanguage") {{ row.tasks.targetLanguage }}
            .table__data(v-else) {{ row.tasks.sourceLanguage }}
              span(style="font-size: 12px;color: #9c9c9c;margin: 0 4px;")
                i(class="fas fa-angle-double-right")
              | {{ row.tasks.targetLanguage }}

          template(slot="price" slot-scope="{ row, index }")
            .table__data
              span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
              span {{ row.tasks.finance.Price.receivables | roundTwoDigit }}

        .table__empty(v-if="!tasks.length") Nothing found...

      .footer
        .footer__button
          Button(value="Create Report" :isDisabled="!isOptionToCreateReport" @clicked="sendTasks")
        //.footer__description(v-if="isOptionToCreateReport") {{ calculatingJobsAndClients }}


</template>

<script>
	import GeneralTable from '../GeneralTable'
	import CheckBox from '../CheckBox'
	import Button from '../Button'
	import moment from "moment"
	import { mapGetters } from "vuex"
	import SelectMulti from "../SelectMulti"
	import SelectSingle from "../SelectSingle"
	import LayoutsTable from "../LayoutsTable"
	import DatepickerWithTime from "../DatepickerWithTime"
	import currencyIconDetected from "../../mixins/currencyIconDetected"

	export default {
		mixins: [ currencyIconDetected ],
		data() {
			return {
				highlighted: {
					days: [ 6, 0 ]
				},
				isDataRemain: true,
				tasks: [],
				fields: [
					{
						label: "",
						headerKey: "headerCheck",
						key: "check",
						style: { width: "36px" }
					},
					{
						label: "Project",
						headerKey: "headerProject",
						key: "project",
						style: { width: "195px" }
					},
					{
						label: "Task ID",
						headerKey: "headerTaskId",
						key: "taskId",
						style: { width: "180px" }
					},
					{
						label: "Company name",
						headerKey: "headerCompany",
						key: "company",
						style: { width: "190px" }
					},
					{
						label: "Start Date",
						headerKey: "headerStartDate",
						key: "startDate",
						style: { width: "110px" }
					},
					{
						label: "Deadline",
						headerKey: "headerDeadline",
						key: "deadline",
						style: { width: "110px" }
					},
					{
						label: "Billing Date",
						headerKey: "headerBillingDate",
						key: "billingDate",
						style: { width: "110px" }
					},
					{
						label: "Service",
						headerKey: "headerService",
						key: "service",
						style: { width: "140px" }
					},
					{
						label: "Status",
						headerKey: "headerJobStatus",
						key: "jobStatus",
						style: { width: "140px" }
					},
					{
						label: "Language Pair",
						headerKey: "headerLangPair",
						key: "langPair",
						style: { width: "140px" }
					},
					{
						label: "Fee ",
						headerKey: "headerPrice",
						key: "price",
						style: { width: "120px" }
					}
				],

				clients: '',
				sourceLanguages: '',
				targetLanguages: '',
				to: '',
				from: '',
				service: '',

				dataVariables: [
					'clients',
					'sourceLanguages',
					'targetLanguages',
					'to',
					'from',
					'service'
				]
			}
		},
		methods: {
			getCompanyName({ customer, clientBillingInfo }) {
				if (!clientBillingInfo) return '-'
				if (!customer.billingInfo) return '-'
				const { officialName } = customer.billingInfo.find(({ _id }) => _id.toString() === clientBillingInfo)
				return officialName
			},
			replaceRoute(key, value) {
				let query = this.$route.query
				delete query[key]
				this.$router.replace({ path: this.$route.path, query: { ...query, [key]: value } })
			},
			removeFromDate() {
				this.replaceRoute('from', '')
			},
			removeToDate() {
				this.replaceRoute('to', '')
			},
			setFromDate(data) {
				this.replaceRoute('from', moment(data).format('YYYY-MM-DD'))
			},
			setToDate(data) {
				this.replaceRoute('to', moment(data).format('YYYY-MM-DD'))
			},
			async sendTasks() {
				alert("FOO BOO")
				const checkedProjects = this.tasks.filter(i => i.isCheck)
				try {
					await this.$http.post('/invoicing-receivables/create-report', { checkedProjects, createdBy: this.user._id })
					await this.getTasks()
					// TODO: ???? emit
					// this.$emit('refreshReports')
				} catch (e) {
					console.log(e)
				}
			},
			formattedDate(date) {
				return moment(date).format("DD-MM-YYYY")
			},
			toggleCheck(index, val) {
				this.tasks[index].isCheck = val
			},
			toggleAll(val) {
				this.tasks = this.tasks.reduce((acc, cur) => {
					acc.push({ ...cur, isCheck: val })
					return acc
				}, [])
			},
			async getTasks() {
				this.tasks = (
						await this.$http.post('/invoicing-receivables/not-selected-tasks-list', {
							countToSkip: 0,
							countToGet: 100,
							filters: this.allFilters
						})
				).data.map(i => ({ ...i, isCheck: false }))
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post("/invoicing-receivables/not-selected-tasks-list", {
						filters: this.allFilters,
						countToSkip: this.tasks.length,
						countToGet: 100
					})
					this.tasks.push(...result.data.map(i => ({ ...i, isCheck: false })))
					this.isDataRemain = result.data.length === 100
				}
			},
			setClient({ option }) {
				if (!this.$route.query.clients) {
					this.replaceRoute('clients', this.getClientsIdByName(option))
					return
				}
				let _ids = this.$route.query.clients.split(',')
				if (_ids.includes(this.getClientsIdByName(option))) _ids = _ids.filter(_id => _id !== this.getClientsIdByName(option))
				else _ids.push(this.getClientsIdByName(option))
				this.replaceRoute('clients', _ids.join(','))
			},
			getClientsIdByName(option) {
				const { _id } = this.clientsList.find(({ name }) => `${ name }` === option)
				return _id
			},
			removeClients() {
				this.replaceRoute('clients', '')
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
			removeSourceLanguages() {
				this.replaceRoute('sourceLanguages', '')
			},
			removeTargetLanguages() {
				this.replaceRoute('targetLanguages', '')
			},
			setSettingService({ option }) {
				const { title } = this.settingServices.find(({ title }) => title === option)
				this.replaceRoute('service', title)
			},
			removeSettingService() {
				this.replaceRoute('service', '')
			},
			querySetter(vm, to) {
				for (let variable of this.dataVariables) if (to.query[variable] != null) vm[variable] = to.query[variable]
			},
			defaultSetter() {
				for (let variable of this.dataVariables) this[variable] = ''
			}
		},
		computed: {
			...mapGetters({
				user: "getUser",
				clientsList: "getAllClientsForOptions",
				languages: "getAllLanguages",
				settingServices: "getAllServices"
			}),
			allFilters() {
				const filters = {}
				for (let variable of this.dataVariables) filters[variable] = this[variable]
				return filters
			},
			// calculatingJobsAndClients() {
			// 	if (this.isOptionToCreateReport) {
			// 		const vendors = [ ...new Set(this.steps.filter(item => item.isCheck).map(item => item.currentVendor._id.toString())) ].length
			// 		const steps = this.steps.filter(item => item.isCheck).length
			// 		return `Vendors Selected : ${ vendors }, Jobs Selected: ${ steps }`
			// 	}
			// },
			isOptionToCreateReport() {
				if (this.tasks.length) {
					return this.tasks.some(item => item.isCheck)
				}
				return false
			},
			allSettingServices() {
				return this.settingServices.map(({ title }) => title)
			},
			allClients() {
				return this.clientsList.map(({ name }) => `${ name }`)
			},
			selectedClients() {
				return this.$route.query.clients && this.clientsList.length
						? this.$route.query.clients.split(',').map(_id => {
							const client = this.clientsList.find(item => _id === item._id)
							return client ? `${ client.name }` : ''
						})
						: []
			},
			mappedLanguages() {
				return this.languages.map(({ lang }) => lang)
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
			selectedService() {
				return this.$route.query.service || ''
			},
			fromDateValue() {
				return this.$route.query.from || ''
			},
			toDateValue() {
				return this.$route.query.to || ''
			},
			isAllSelected() {
				if (this.tasks && this.tasks.length) return this.tasks.every(i => i.isCheck)
			}
		},
		components: {
			DatepickerWithTime,
			LayoutsTable,
			SelectSingle,
			SelectMulti,
			GeneralTable,
			CheckBox,
			Button
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				vm.defaultSetter()
				vm.querySetter(vm, to)
				vm.getTasks()
			})
		},
		watch: {
			$route(to, from) {
				if (to.path === from.path) {
					this.querySetter(this, to)
					this.getTasks()
				}
			}
		}
	}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__description {
      opacity: 0.5;
    }
  }

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

  .invoicing-reports-add {
    width: 1530px;
    margin: 50px 0 0 50px;
    background: #fff;

    &__container {
      border-radius: 4px;
      padding: 20px;
      box-sizing: border-box;
      box-shadow: 0 1px 2px 0 rgba(99, 99, 99, .3), 0 1px 3px 1px rgba(99, 99, 99, .15);
    }

    &__table {
      margin-top: 15px;
      margin-bottom: 15px;
    }

    &__title {
      display: flex;
      justify-content: end;
      margin-bottom: 10px;
    }
  }

  .table__header {
    padding: 0 0 0 7px;
  }

  .table__empty {
    margin-top: 10px;
  }

  .icon-button {
    font-size: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: .2s ease-out;
    justify-content: center;
    color: $dark-border;

    &:hover {
      color: $text;

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

  a {
    color: inherit;
    text-decoration: none;
    transition: .2s ease-out;

    &:hover {
      text-decoration: underline;
    }
  }

  .currency {
    margin-right: 4px;
    color: $dark-border;
  }
</style>