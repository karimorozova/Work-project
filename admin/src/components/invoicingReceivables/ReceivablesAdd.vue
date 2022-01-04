<template lang="pug">
  .invoicing-payables-add
    .invoicing-payables-add__container
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
          label Step:
          .filter__input
            SelectSingle(
              :selectedOption="selectedStep"
              :options="allSettingSteps"
              placeholder="Option"
              @chooseOption="setSettingStep"
              :isRemoveOption="true"
              @removeOption="removeSettingStep"
            )

      .invoicing-payables-add__table
        LayoutsTable(
          :fields="fields",
          :tableData="steps",
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
            .table__data(style="word-break: break-word; padding-right: 15px;")
              router-link(class="link-to" target='_blank' :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
                span {{ row.projectName.length > 46 ? (row.projectName.substring(0, 40) + '...') : row.projectName }}

          template(slot="client" slot-scope="{ row, index }")
            .table__data
              router-link(class="link-to" target='_blank' :to="{path: `/pangea-clients/all/details/${row.customer._id}`}")
                span {{ row.customer.name }}

          template(slot="bn" slot-scope="{ row, index }")
            .table__data {{ row.selectedBillingInfo.officialName }}

          template(slot="pt" slot-scope="{ row, index }")
            .table__data {{ row.selectedBillingInfo.paymentType }}

          template(slot="stepId" slot-scope="{ row, index }")
            .table__data {{ row.steps.stepId }}

          template(slot="startDate" slot-scope="{ row, index }")
            .table__data {{ formattedDate(row.startDate) }}

          template(slot="deadline" slot-scope="{ row, index }")
            .table__data {{ formattedDate(row.deadline) }}

          template(slot="billingDate" slot-scope="{ row, index }")
            .table__data {{ formattedDate(row.billingDate) }}

          template(slot="step" slot-scope="{ row, index }")
            .table__data {{ row.steps.stepAndUnit.step.title }}

          template(slot="jobStatus" slot-scope="{ row, index }")
            .table__data {{ row.steps.status }}

          template(slot="langPair" slot-scope="{ row, index }")
            .table__data(v-if="row.steps.sourceLanguage === row.steps.targetLanguage") {{ row.steps.targetLanguage }}
            .table__data(v-else) {{ row.steps.sourceLanguage }}
              span(style="font-size: 12px;color: #9c9c9c;margin: 0 4px;")
                i(class="fas fa-angle-double-right")
              | {{ row.steps.targetLanguage }}

          template(slot="price" slot-scope="{ row, index }")
            .table__data
              span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
              span {{ row.steps.finance.Price.receivables | roundTwoDigit }}

        .table__empty(v-if="!steps.length") Nothing found...

      .footer
        .footer__button
          Button(value="Create Report" :isDisabled="!isOptionToCreateReport" @clicked="sendSteps")
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
      steps: [],
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
          style: { width: "180px" }
        },
        {
          label: "Client",
          headerKey: "headerClient",
          key: "client",
          style: { width: "157px" }
        },
        {
          label: "Billing name",
          headerKey: "headerBN",
          key: "bn",
          style: { width: "128px" }
        },
        {
          label: "Payment type",
          headerKey: "headerPT",
          key: "pt",
          style: { width: "110px" }
        },
        {
          label: "Step ID",
          headerKey: "headerStepId",
          key: "stepId",
          style: { width: "190px" }
        },
        {
          label: "Step",
          headerKey: "headerService",
          key: "step",
          style: { width: "110px" }
        },
        {
          label: "Language pair",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { width: "120px" }
        },
        {
          label: "Start date",
          headerKey: "headerStartDate",
          key: "startDate",
          style: { width: "90px" }
        },
        {
          label: "Deadline",
          headerKey: "headerDeadline",
          key: "deadline",
          style: { width: "90px" }
        },
        {
          label: "Billing date",
          headerKey: "headerBillingDate",
          key: "billingDate",
          style: { width: "90px" }
        },
        {
          label: "Status",
          headerKey: "headerJobStatus",
          key: "jobStatus",
          style: { width: "90px" }
        },
        {
          label: "Fee",
          headerKey: "headerPrice",
          key: "price",
          style: { width: "80px" }
        }
      ],

      clients: '',
      sourceLanguages: '',
      targetLanguages: '',
      to: '',
      from: '',
      step: '',

      dataVariables: [
        'clients',
        'sourceLanguages',
        'targetLanguages',
        'to',
        'from',
        'step'
      ]
    }
  },
  methods: {
    // getCompanyNameAndPaymentType({ customer, clientBillingInfo }) {
    // 	if (!clientBillingInfo) return buildReturn('-', '-')
    // 	if (!customer.billingInfo) return buildReturn('-', '-')
    //
    // 	const { name, paymentType } = customer.billingInfo.find(({ _id }) => _id.toString() === clientBillingInfo)
    // 	return buildReturn(name, paymentType)
    //
    // 	function buildReturn(name, paymentType) {
    // 		return {
    // 			getName: () => name,
    // 			getPaymentType: () => paymentType
    // 		}
    // 	}
    // },
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
    async sendSteps() {
      const checkedSteps = this.steps.filter(i => i.isCheck)
      try {
        await this.$http.post('/invoicing-receivables/create-report', { checkedSteps, createdBy: this.user._id })
        await this.getSteps()
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
      this.steps[index].isCheck = val
    },
    toggleAll(val) {
      this.steps = this.steps.reduce((acc, cur) => {
        acc.push({ ...cur, isCheck: val })
        return acc
      }, [])
    },
    async getSteps() {
      this.steps = (
          await this.$http.post('/invoicing-receivables/not-selected-steps-list', {
            countToSkip: 0,
            countToGet: 100,
            filters: this.allFilters
          })
      ).data.map(i => ({ ...i, isCheck: false }))
    },
    async bottomScrolled() {
      if (this.isDataRemain) {
        const result = await this.$http.post("/invoicing-receivables/not-selected-steps-list", {
          filters: this.allFilters,
          countToSkip: this.steps.length,
          countToGet: 100
        })
        this.steps.push(...result.data.map(i => ({ ...i, isCheck: false })))
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
    setSettingStep({ option }) {
      const { title } = this.settingSteps.find(({ title }) => title === option)
      this.replaceRoute('step', title)
    },
    removeSettingStep() {
      this.replaceRoute('step', '')
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
      settingSteps: "getAllSteps"
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
      if (this.steps.length) {
        return this.steps.some(item => item.isCheck)
      }
      return false
    },
    allSettingSteps() {
      return this.settingSteps.map(({ title }) => title)
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
    selectedStep() {
      return this.$route.query.step || ''
    },
    fromDateValue() {
      return this.$route.query.from || ''
    },
    toDateValue() {
      return this.$route.query.to || ''
    },
    isAllSelected() {
      if (this.steps && this.steps.length) return this.steps.every(i => i.isCheck)
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
      vm.getSteps()
    })
  },
  watch: {
    $route(to, from) {
      if (to.path === from.path) {
        this.querySetter(this, to)
        this.getSteps()
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

.invoicing-payables-add {
  width: 1530px;
  margin: 50px 0 0 50px;
  background: #fff;

  &__container {
    border-radius: 4px;
    padding: 25px;
    box-sizing: border-box;
    box-shadow: $box-shadow;
  }

  &__table {
    margin-top: 15px;
    margin-bottom: 25px;
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