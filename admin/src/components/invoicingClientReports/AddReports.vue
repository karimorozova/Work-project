<template lang="pug">
  .invoicing-payables-add
    .add-button
      Button(value="Create Report" :isDisabled="!isOptionToCreateReport" @clicked="sendSteps" :outline="true")

    LayoutsListWrapper(
      :hasFilterButton="true"
      :hasClearButton="true"
      :isFilterActive="isFilterActive"
      @toggleFilters="toggleFilters"
      @clearFilters="clearFilters"
    )
      template(slot="table")
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
            .table__data
              router-link(class="link-to" target='_blank' :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
                .short {{row.projectName }}

          template(slot="client" slot-scope="{ row, index }")
            .table__data
              router-link(class="link-to" target='_blank' :to="{path: `/pangea-clients/all/details/${row.customer._id}`}")
                span {{ row.customer.name }}

          template(slot="bn" slot-scope="{ row, index }")
            .table__data {{ row.selectedBillingInfo.officialName }}

          template(slot="pt" slot-scope="{ row, index }")
            .table__data {{ row.selectedBillingInfo.paymentType }}

          template(slot="stepId" slot-scope="{ row, index }")
            .table__data {{ row.steps.stepId || '-' }}

          template(slot="startDate" slot-scope="{ row, index }")
            .table__data {{ formattedDate(row.startDate) }}

          template(slot="deadline" slot-scope="{ row, index }")
            .table__data {{ formattedDate(row.deadline) }}

          template(slot="billingDate" slot-scope="{ row, index }")
            .table__data {{ formattedDate(row.billingDate) }}

          template(slot="step" slot-scope="{ row, index }")
            .table__data {{ row.type === 'Classic' ? row.steps.stepAndUnit.step.title : row.steps.title }}

          template(slot="jobStatus" slot-scope="{ row, index }")
            .table__data {{ row.steps.status || 'Completed' }}

          template(slot="langPair" slot-scope="{ row, index }")
            span(v-if="row.type === 'Classic'" )
              .table__data(v-if="row.steps.sourceLanguage === row.steps.targetLanguage") {{ row.steps.targetLanguage }}
              .table__data(v-else) {{ row.steps.sourceLanguage }}
                span(style="font-size: 12px;color: #9c9c9c;margin: 0 4px;")
                  i(class="fas fa-angle-double-right")
                | {{ row.steps.targetLanguage }}
            span(v-else) -

          template(slot="price" slot-scope="{ row, index }")
            .table__data
              span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
              span {{ +(row.steps.finance.Price.receivables).toFixed(2) }}

      template(slot="filters")
        .filter
          .filter__item
            label Clients
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
            label Source Languages
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
            label Target Languages
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
            label Step
            .filter__input
              SelectSingle(
                :selectedOption="selectedStep"
                :options="allSettingSteps"
                placeholder="Option"
                @chooseOption="setSettingStep"
                :isRemoveOption="true"
                @removeOption="removeSettingStep"
              )

          .filter__item
            label Deadline Date Range
            .filter__input
              DatePicker.range-with-one-panel(
                :value="selectedBillingDateRange"
                @input="(e) => setBillingDateRange(e)"
                format="DD-MM-YYYY, HH:mm"
                prefix-class="xmx"
                range-separator=" - "
                :clearable="false"
                type="datetime"
                range
                placeholder="Datetime range"
              )
            .clear-icon-picker(v-if="!!selectedBillingDateRange[0]" @click="removeSelectedBillingDateRange()")
              i.fas.fa-backspace.backspace
</template>

<script>
import moment from "moment"
import { mapGetters } from "vuex"
import currencyIconDetected from "../../mixins/currencyIconDetected"
import '../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'
import SelectMulti from "../SelectMulti"
import SelectSingle from "../SelectSingle"
import LayoutsTable from "../LayoutsTable"
import CheckBox from '../CheckBox'
import Button from '../Button'
import DatepickerWithTime from "../DatepickerWithTime"
import LayoutsListWrapper from "../LayoutsListWrapper"
import LayoutsListWrapperLogic from "../../mixins/LayoutsListWrapperLogic"

export default {
  name: "AddReports",
  mixins: [ currencyIconDetected, LayoutsListWrapperLogic ],
  data() {
    return {
      fields: [
        {
          label: "",
          headerKey: "headerCheck",
          key: "check",
          style: { width: "27px" }
        },
        {
          label: "Project",
          headerKey: "headerProject",
          key: "project",
          style: { width: "175px" }
        },
        {
          label: "Client",
          headerKey: "headerClient",
          key: "client",
          style: { width: "150px" }
        },
        {
          label: "Billing Name",
          headerKey: "headerBN",
          key: "bn",
          style: { width: "125px" }
        },
        {
          label: "Payment Type",
          headerKey: "headerPT",
          key: "pt",
          style: { width: "105px" }
        },
        {
          label: "Step ID",
          headerKey: "headerStepId",
          key: "stepId",
          style: { width: "180px" }
        },
        {
          label: "Step",
          headerKey: "headerService",
          key: "step",
          style: { width: "110px" }
        },
        {
          label: "Language Pair",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { width: "120px" }
        },
        {
          label: "Start Date",
          headerKey: "headerStartDate",
          key: "startDate",
          style: { width: "95px" }
        },
        {
          label: "Deadline",
          headerKey: "headerDeadline",
          key: "deadline",
          style: { width: "95px" }
        },
        {
          label: "Billing Date",
          headerKey: "headerBillingDate",
          key: "billingDate",
          style: { width: "95px" }
        },
        {
          label: "Status",
          headerKey: "headerJobStatus",
          key: "jobStatus",
          style: { width: "80px" }
        },
        {
          label: "Fee",
          headerKey: "headerPrice",
          key: "price",
          style: { width: "80px" }
        }
      ],
      isDataRemain: true,
      steps: [],
      clients: '',
      sourceLanguages: '',
      targetLanguages: '',
      deadlineDateFrom: '',
      deadlineDateTo: '',
      step: '',
      clientsList: [],
      dataVariables: [
        'clients',
        'sourceLanguages',
        'targetLanguages',
        'deadlineDateFrom',
        'deadlineDateTo',
        'step'
      ]
    }
  },
  methods: {
    replaceRoute(key, value) {
      let query = this.$route.query
      delete query[key]
      this.$router.replace({ path: this.$route.path, query: { ...query, [key]: value } })
    },
    removeSelectedBillingDateRange() {
      let query = this.$route.query
      this.$router.replace({
        path: this.$route.path,
        query: { ...query, deadlineDateFrom: '', deadlineDateTo: '' }
      })
    },
    setBillingDateRange(e) {
      let query = this.$route.query
      delete query.deadlineDateFrom
      delete query.deadlineDateTo
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...query, deadlineDateFrom: new Date(e[0]).getTime(),
          deadlineDateTo: new Date(e[1]).getTime()
        }
      })
    },
    async sendSteps() {
      const checkedSteps = this.steps.filter(i => i.isCheck)
      try {
        await this.$http.post('/invoicing-receivables/create-report', { checkedSteps, createdBy: this.user._id })
        await this.getSteps()
      } catch (e) {
        console.log(e)
      }
    },
    formattedDate(date) {
      return moment(date).format('MMM D, HH:mm')
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
      this.clientsList = (await this.$http.get('/pm-manage/clients-for-options')).data
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
      languages: "getAllLanguages",
      settingSteps: "getAllSteps"
    }),
    allFilters() {
      const filters = {}
      for (let variable of this.dataVariables) filters[variable] = this[variable]
      return filters
    },
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
    selectedBillingDateRange() {
      return this.$route.query.deadlineDateFrom
          ? [ new Date(+this.$route.query.deadlineDateFrom), new Date(+this.$route.query.deadlineDateTo) ]
          : [ null, null ]
    },
    isAllSelected() {
      if (this.steps && this.steps.length) return this.steps.every(i => i.isCheck)
    }
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
  },
  components: {
    LayoutsListWrapper,
    DatepickerWithTime,
    LayoutsTable,
    SelectSingle,
    SelectMulti,
    CheckBox,
    Button,
    DatePicker
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/LayoutFilters";

.invoicing-payables-add {
  position: relative;
}

.add-button {
  position: absolute;
  left: 130px;
  top: -40px;
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.short {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 161px;
}
</style>