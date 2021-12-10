<template lang="pug">
  .manWrapper
    // PROJECT =================================================================================================================================================>
    .mainSides
      .sideRight(v-if="currentProject._id")
        .details
          .details__header
            .details__name {{ currentProject.projectName }}
            .details__body
              .d-col
                .d-row
                  .d-key Project ID:
                  .d-val {{ currentProject.projectId }}
                .d-row
                  .d-key Status:
                  .d-val {{ currentProject.status }}
              .d-col
                .d-row
                  .d-key Start:
                  .d-val {{ customFormatter(currentProject.startDate) }}
                .d-row
                  .d-key Industry:
                  .d-val {{ currentProject.industry.name }}
              .d-col
                .d-row
                  .d-key Deadline:
                  .d-val {{ customFormatter(currentProject.deadline) }}

          .details__steps
            .details__steps-title Jobs:
            GeneralTable(
              :fields="fields"
              :tableData="finalData"
              :isFilterShow="true"
              :isBodyShort="true"

              @addSortKey="addSortKey"
              @changeSortKey="changeSortKey"
              @removeSortKey="removeSortKey"
              @setFilter="setFilter"
              @removeFilter="removeFilter"
              @clearAllFilters="clearAllFilters"
            )
              template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
                .table__header {{ field.label }}

              template(slot="step", slot-scope="{ row, index }")
                .table__data {{ row.step.title }}

              template(slot="language" slot-scope="{ row }")
                .table__data(v-html="getStepPair(row)")

              template(slot="status" slot-scope="{ row, index }")
                .table__statusAndProgress(v-if="isNowQuoteStatus") {{ currentProject.status }}
                .table__statusAndProgress(v-else)
                  .status {{ row.status }}
                  .progress
                    ProgressLineStep(:progress="progress(row.progress)" :status="row.status")

              template(slot="quantity", slot-scope="{ row, index }")
                .table__data {{ +(row.quantity).toFixed(1) }}

              template(slot="clientRate", slot-scope="{ row, index }")
                .table__data(v-if="!currentProject.minimumCharge.isUsed")
                  span.currency(v-html="currencyIconDetected(currentProject.projectCurrency)" )
                  span {{ +(row.clientRate).toFixed(4) }}
                .table__data(v-else) -

              template(slot="price", slot-scope="{ row, index }")
                .table__data(v-if="!currentProject.minimumCharge.isUsed")
                  span.currency(v-html="currencyIconDetected(currentProject.projectCurrency)" )
                  span {{ +(row.price).toFixed(2) }}
                .table__data(v-else) -

          .details__deliverables(v-if="currentProject.tasksDeliverables.length")
            DeliveryTable(
              :project="currentProject"
            )
      .sideLeft(v-if="currentProject._id")
        .user(v-if="currentProject.accountManager" )
          .user__image
            img(v-if="currentProject.accountManager.photo && !currentProject.accountManager.photo.includes('https://')" :src="domain+currentProject.accountManager.photo")
            .user__fakeImage(:style="{'--bgColor': getBgColor(currentProject.accountManager._id)[0], '--color':getBgColor(currentProject.accountManager._id)[1]  }" v-else) {{ currentProject.accountManager.firstName[0].toUpperCase() }}
          .user__name {{currentProject.accountManager.firstName + ' ' + currentProject.accountManager.lastName || ''}}
          .user__who Account Manager
          a(:href="'mailto:' + currentProject.accountManager.email")
            .user__email
              .email__icon
                i(class="far fa-envelope")
              .email__text Send a message

        .progress__bar(v-if="currentProject.status === 'In progress' || currentProject.status === 'Approved' || currentProject.status === 'Rejected' || currentProject.status === 'Closed' " )
          CircleProgress(:percent="progressProject()")

        .priceExplanation(v-if="currentProject.additionsSteps.length || currentProject.discounts.length || getTMDiscounts" )
          .priceExplanation__title Services
          .priceExplanation__row
            .priceExplanation__key Sub-total:
            .priceExplanation__value
              span {{ getProjectSubTotal }}
              span.currency2(v-html="currencyIconDetected(currentProject.projectCurrency)")

        .priceExplanation(v-if="(!currentProject.minimumCharge.isUsed) && (currentProject.discounts.length || getTMDiscounts)")
          .priceExplanation__title Discounts and Surcharges

          div(v-if="getTMDiscounts")
            .priceExplanation__row
              .priceExplanation__key TM Discount:
              .priceExplanation__value -{{getTMDiscounts}}
                span.currency2(v-html="currencyIconDetected(currentProject.projectCurrency)")

          div(v-if="currentProject.discounts.length")
            .priceExplanation__row(v-for="item in currentProject.discounts" )
              .priceExplanation__key {{item.name}}:
              .priceExplanation__value {{ calculateDiscountPercent(item.value) }}
                span.currency2(v-html="currencyIconDetected(currentProject.projectCurrency)")

        .priceExplanation(v-if="currentProject.additionsSteps.length" )
          .priceExplanation__title Additional Charges:
          .priceExplanation__row(v-for="item in currentProject.additionsSteps" )
            .priceExplanation__key {{item.title}}
            .priceExplanation__value
              span {{item.finance.Price.receivables}}
              span.currency2(v-html="currencyIconDetected(currentProject.projectCurrency)")

        .total
          .total__row
            .total__key Total:
            .total__value
              span {{this.getProjectTotal}}
              span.currency2(v-html="currencyIconDetected(currentProject.projectCurrency)")


        .quote(v-if="currentProject.status === 'Quote sent' && isHaveAccessForQuote" )
          Button(:value="'I accept'" :color="'#4ba5a5'" @clicked="approveQuote")
          Button(:value="'I reject'"  @clicked="rejectQuote")
    // PROJECT <================================================================================================================================================


    // QUOTES =================================================================================================================================================>
    .mainSides(v-if="isExtraQuoteJobs && isHaveAccessForQuote" style="margin-top: 50px; padding-top: 50px; border-top: 1px solid #BFBFBF;")
      .sideRight(v-if="currentProject._id")
        .details
          .details__header
            .details__name
              span Decide on a Quote:
              span(style="margin-left: 6px;") {{ currentProject.projectName }}
            .details__body
              .d-col
                .d-row
                  .d-key Project ID:
                  .d-val {{ currentProject.projectId }}
                .d-row
                  .d-key Status:
                  .d-val Quote sent
              .d-col
                .d-row
                  .d-key Start:
                  .d-val {{ customFormatter(currentProject.startDate) }}
                .d-row
                  .d-key Industry:
                  .d-val {{ currentProject.industry.name }}
              .d-col
                .d-row
                  .d-key Deadline:
                  .d-val {{ customFormatter(currentProject.deadline) }}

          .details__steps
            .details__title Incoming Jobs:
            GeneralTable(
              :fields="fields2"
              :tableData="currentProject.incomingSteps"
              :isBodyShort="true"
            )
              template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
                .table__header {{ field.label }}

              template(slot="step", slot-scope="{ row, index }")
                .table__data {{ row.step.title }}

              template(slot="language" slot-scope="{ row }")
                .table__data(v-html="getStepPair(row)")

              template(slot="status" slot-scope="{ row, index }")
                .table__statusAndProgress -

              template(slot="quantity", slot-scope="{ row, index }")
                .table__data {{ +(row.quantity).toFixed(1) }}

              template(slot="clientRate", slot-scope="{ row, index }")
                .table__data(v-if="!currentProject.minimumCharge.isUsed")
                  span.currency(v-html="currencyIconDetected(currentProject.projectCurrency)" )
                  span {{ +(row.clientRate).toFixed(4) }}
                .table__data(v-else) Quote sent

              template(slot="price", slot-scope="{ row, index }")
                .table__data(v-if="!currentProject.minimumCharge.isUsed")
                  span.currency(v-html="currencyIconDetected(currentProject.projectCurrency)" )
                  span {{ +(row.price).toFixed(2) }}
                .table__data(v-else) -

      .sideLeft(v-if="currentProject._id")
        .priceExplanation(v-if="currentProject.discounts.length || getTMDiscountsExtraQuote")
          .priceExplanation__title Services
          .priceExplanation__row
            .priceExplanation__key Sub-total:
            .priceExplanation__value
              span {{ getProjectSubTotalExtraQuote }}
              span.currency2(v-html="currencyIconDetected(currentProject.projectCurrency)")

        .priceExplanation(v-if="(!currentProject.minimumCharge.isUsed) && (currentProject.discounts.length || getTMDiscountsExtraQuote)")
          .priceExplanation__title Discounts and Surcharges

          div(v-if="getTMDiscountsExtraQuote")
            .priceExplanation__row
              .priceExplanation__key TM Discount:
              .priceExplanation__value -{{getTMDiscountsExtraQuote}}
                span.currency2(v-html="currencyIconDetected(currentProject.projectCurrency)")

          div(v-if="currentProject.discounts.length")
            .priceExplanation__row(v-for="item in currentProject.discounts" )
              .priceExplanation__key {{item.name}}:
              .priceExplanation__value {{ calculateDiscountPercentQuote(item.value) }}
                span.currency2(v-html="currencyIconDetected(currentProject.projectCurrency)")

        .total
          .total__row
            .total__key Total:
            .total__value
              span {{this.getProjectTotalExtraQuote}}
              span.currency2(v-html="currencyIconDetected(currentProject.projectCurrency)")

        .quote
          Button(:value="'I accept'" :color="'#4ba5a5'" @clicked="approveQuoteExtra")
          Button(:value="'I reject'"  @clicked="rejectQuoteExtra")

    // QUOTES <=================================================================================================================================================


</template>

<script>
import { mapGetters, mapActions } from "vuex"
import getBgColor from "../../../../mixins/getBgColor"
import moment from "moment"
import GeneralTable from "../../../../components/pangea/GeneralTable"
import tableSortAndFilter from "../../../../mixins/tableSortAndFilter"
import ProgressLineStep from "../../../../components/pangea/ProgressLineStep"
import currencyIconDetected from '../../../../mixins/currencyIconDetected'
import CircleProgress from "../../../../components/CircleProgress"
import DeliveryTable from "../../../../components/DeliveryTable"
import Button from "../../../../components/pangea/Button"

export default {
  mixins: [ tableSortAndFilter, getBgColor, currencyIconDetected ],
  data() {
    return {
      domain: '',
      adminUrl: '',
      fields2: [
        {
          label: "Service",
          headerKey: "header1",
          key: "step",
          style: { width: "20%" }
        },
        {
          label: "Languages",
          headerKey: "header2",
          key: "language",
          style: { "width": "20%" }
        },
        {
          label: "Status",
          headerKey: "header3",
          key: "status",
          style: { "width": "18%" }
        },
        {
          label: "Size",
          headerKey: "header4",
          key: "quantity",
          style: { "width": "14%" }
        },
        {
          label: "Rate",
          headerKey: "header5",
          key: "clientRate",
          style: { "width": "14%" }
        },
        {
          label: "Total",
          headerKey: "header6",
          key: "price",
          style: { "width": "14%" }
        }
      ],
      fields: [
        {
          label: "Service",
          headerKey: "header1",
          key: "step",
          sortInfo: { isSort: true, order: 'default' },
          dataKey: "title",
          filterInfo: { isFilter: true },
          style: { width: "20%" }
        },
        {
          label: "Languages",
          headerKey: "header2",
          key: "language",
          style: { "width": "20%" }
        },
        {
          label: "Status",
          headerKey: "header3",
          key: "status",
          sortInfo: { isSort: true, order: 'default' },
          filterInfo: { isFilter: true },
          style: { "width": "18%" }
        },
        {
          label: "Size",
          headerKey: "header4",
          key: "quantity",
          sortInfo: { isSort: true, order: 'default' },
          style: { "width": "14%" }
        },
        {
          label: "Rate",
          headerKey: "header5",
          key: "clientRate",
          sortInfo: { isSort: true, order: 'default' },
          style: { "width": "14%" }
        },
        {
          label: "Total",
          headerKey: "header6",
          key: "price",
          sortInfo: { isSort: true, order: 'default' },
          style: { "width": "14%" }
        }
      ],
      currentProject: {}
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      getClient: "getClient"
    }),

    getQuoteLink(prop, date) {
      // this.adminUrl
      let href = `${ 'http://localhost:3001' }/quote-decision?projectId=${ this.currentProject._id }&from=${ date }&t=${ this.token }&prop=${ prop }&type=client`
      return href
    },

    approveQuoteExtra() {
      if (this.currentProject.incomingSteps.length) {
        let link = this.getQuoteLink('accept', new Date().getTime())
        const tasks = this.currentProject.incomingSteps.map(i => i.taskId).join('*').replace(/[' ']/g, '_')
        link += `&tasksIds=${ tasks }`
        window.location.replace(link)
      }
    },
    rejectQuoteExtra() {
      if (this.currentProject.incomingSteps.length) {
        let link = this.getQuoteLink('reject', new Date().getTime())
        const tasks = this.currentProject.incomingSteps.map(i => i.taskId).join('*').replace(/[' ']/g, '_')
        link += `&tasksIds=${ tasks }`
        window.location.replace(link)
      }
    },
    approveQuote() {
      let link = this.getQuoteLink('accept', new Date(this.currentProject.startDate).getTime())
      window.location.replace(link)
    },
    rejectQuote() {
      let link = this.getQuoteLink('reject', new Date(this.currentProject.startDate).getTime())
      window.location.replace(link)
    },
    calculateDiscountPercent(val) {
      return +(((this.getProjectSubTotal - this.getTMDiscounts) * +val) / 100).toFixed(2)
    },
    calculateDiscountPercentQuote(val) {
      return +(((this.getProjectSubTotalExtraQuote - this.getTMDiscountsExtraQuote) * +val) / 100).toFixed(2)
    },
    getStepPair(step) {
      return step.sourceLanguage === step.targetLanguage
          ? `${ step.targetLanguage }`
          : `<span>${ step.sourceLanguage }</span><span style="font-size: 12px;color: #9c9c9c;margin: 0 4px;"><i class="fas fa-angle-double-right"></i></span><span>${ step.targetLanguage }</span>`
    },
    progress(progress) {
      return progress.hasOwnProperty('totalWordCount') ? +((progress.wordsDone / progress.totalWordCount) * 100).toFixed(2) : +progress
    },
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    async getCurrentProject() {
      const { id } = this.$route.params
      try {
        const res = await this.$axios.get('/portal/project/' + id + '?customer=' + this.client._id)
        this.currentProject = res.data
        console.log(res.data)
      } catch (err) {
      }
    },
    progressProject() {
      let progresses = []
      const isObject = (key) => typeof key === "object"
      const calculatePercentage = (step) => (+step.progress.wordsDone / +step.progress.totalWordCount) * 100
      const steps = this.currentProject.steps.filter(({ status }) => status !== 'Cancelled Halfway')
      if (!steps.length) return 0
      steps.forEach(step => {
        isObject(step.progress) ? progresses.push(calculatePercentage(step)) : progresses.push(step.progress)
      })
      if (steps.length && progresses.every(item => item === 0)) return 0
      const progress = progresses.reduce((a, b) => a + b) / steps.length
      return Math.ceil(progress) > 100 ? 100 : Math.ceil(progress)
    }
  },
  computed: {
    ...mapGetters({
      client: "getClientInfo",
      user: "getUserInfo",
      token: "getToken"
    }),
    isExtraQuoteJobs() {
      return this.currentProject._id && this.currentProject.incomingSteps && this.currentProject.incomingSteps.length
    },
    isHaveAccessForQuote() {
      return this.currentProject.clientContacts && this.currentProject.clientContacts.length && this.currentProject.clientContacts.map(i => i._id).includes(this.user._id)
    },
    isNowQuoteStatus() {
      return this.currentProject.status === 'Quote sent' || this.currentProject.status === 'Cost Quote'
    },
    rawData() {
      return this.currentProject.steps
    },
    getProjectSubTotal() {
      let subTotal = 0
      for (let curStep of this.currentProject.steps) {
        const { type } = curStep.receivablesUnit
        if (type === 'CAT Wordcount') {
          subTotal += +curStep.totalWords * +curStep.clientRate
        } else {
          subTotal += +curStep.quantity * +curStep.clientRate
        }
      }
      return +(subTotal).toFixed(2)
    },
    getProjectSubTotalExtraQuote() {
      let subTotal = 0
      for (let curStep of this.currentProject.incomingSteps) {
        const { type } = curStep.receivablesUnit
        if (type === 'CAT Wordcount') {
          subTotal += +curStep.totalWords * +curStep.clientRate
        } else {
          subTotal += +curStep.quantity * +curStep.clientRate
        }
      }
      return +(subTotal).toFixed(2)
    },
    getProjectTotal() {
      let price = this.currentProject.steps.reduce((acc, curr) => acc += +curr.finance.Price.receivables, 0)
      if (this.currentProject.additionsSteps.length) {
        price += this.currentProject.additionsSteps.reduce((acc, curr) => acc += +curr.finance.Price.receivables, 0)
      }
      return +(price).toFixed(2)
    },
    getProjectTotalExtraQuote() {
      let price = this.currentProject.incomingSteps.reduce((acc, curr) => acc += +curr.finance.Price.receivables, 0)
      return +(price).toFixed(2)
    },
    getTMDiscounts() {
      if (!this.currentProject.steps.length) return 0
      if (this.currentProject.steps.some(({ receivablesUnit }) => receivablesUnit.type === 'CAT Wordcount')) {
        const CATSteps = this.currentProject.steps.filter(({ receivablesUnit, step }) => receivablesUnit.type === 'CAT Wordcount' && step.title === 'Translation')
        if (!CATSteps.length) return 0
        const nativePrice = CATSteps.reduce((acc, curr) => acc += +curr.clientRate * +curr.totalWords, 0)
        const relativePrice = CATSteps.reduce((acc, curr) => acc += +curr.clientRate * +curr.quantity, 0)
        return +(nativePrice - relativePrice).toFixed(2)
      }
      return 0
    },
    getTMDiscountsExtraQuote() {
      if (!this.currentProject.incomingSteps.length) return 0
      if (this.currentProject.incomingSteps.some(({ receivablesUnit }) => receivablesUnit.type === 'CAT Wordcount')) {
        const CATSteps = this.currentProject.incomingSteps.filter(({ receivablesUnit, step }) => receivablesUnit.type === 'CAT Wordcount' && step.title === 'Translation')
        if (!CATSteps.length) return 0
        const nativePrice = CATSteps.reduce((acc, curr) => acc += +curr.clientRate * +curr.totalWords, 0)
        const relativePrice = CATSteps.reduce((acc, curr) => acc += +curr.clientRate * +curr.quantity, 0)
        return +(nativePrice - relativePrice).toFixed(2)
      }
      return 0
    }
    // title() {
    //   let result = "Quote Details"
    //   let statuses = [ 'Quote sent', 'Requested' ]
    //   if (statuses.indexOf(this.project.status) === -1) {
    //     result = 'Project Details'
    //   }
    //   return result
    // }
  },
  components: { Button, DeliveryTable, CircleProgress, ProgressLineStep, GeneralTable },
  async created() {
    this.domain = process.env.domain
    this.adminUrl = process.env.adminUrl
    await this.getClient()
    await this.getCurrentProject()
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.mainSides {
  display: flex;
  width: fit-content;
}

.quote {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.priceExplanation {
  margin-top: 20px;

  &__title {
    font-family: Myriad600;
    text-align: center;
    margin-bottom: 20px;
    background: $table-list-hover;
    padding: 4px;
  }

  &__row {
    width: 100%;
    justify-content: space-between;
    display: flex;
    margin-top: 10px;
    gap: 20px;
    align-items: center;
  }

  &__key {
    width: 155px;
  }

  &__value {
    width: 65px;
    display: flex;
    justify-content: end;
  }
}

.total {
  margin-top: 20px;
  //padding-top: 20px;
  //border-top: 1px solid $light-border;

  &__row {
    width: 100%;
    justify-content: center;
    display: flex;
  }

  &__key {
    font-family: Myriad900;
  }

  &__value {
    margin-left: 15px;
    font-family: Myriad900;
  }
}

.d {
  &-row {
    display: flex;
    margin-bottom: 20px;
  }

  &-key {
    font-family: Myriad600;
  }

  &-val {
    margin-left: 15px;
  }

}

.details {
  &__title {
    font-size: 14px;
    font-family: Myriad600;
    margin: 6px 0 14px;
  }

  &__steps {
    position: relative;
    padding-top: 10px;
    border-top: 1px solid $light-border;

    &-title {
      font-size: 14px;
      position: absolute;
      top: 16px;
      font-family: Myriad600;
    }
  }

  &__header {
    width: 100%;
  }

  &__body {
    display: flex;
    justify-content: space-between;
  }

  &__name {
    font-size: 16px;
    font-family: Myriad600;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid $light-border;
  }
}

.sideLeft {
  padding: 25px;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  box-sizing: border-box;
  width: 290px;
  margin-left: 25px;
  height: fit-content;
}

.sideRight {
  padding: 25px;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  box-sizing: border-box;
  width: 680px;
  height: fit-content;
}

.user {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid $light-border;
  padding-bottom: 20px;
  margin-bottom: 20px;

  &__who {
    margin-top: 4px;
    color: #3333;
  }

  &__email {
    display: flex;
    gap: 5px;
    margin-top: 5px;
  }

  &__fakeImage {
    cursor: default;
    height: 32px;
    width: 32px;
    border-radius: 32px;
    background-color: var(--bgColor);
    color: var(--color);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }

  &__image {
    cursor: default;
    height: 32px;
    width: 32px;
    border-radius: 32px;
    margin-bottom: 5px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 32px;
    }
  }
}

.table {
  &__header {
    padding: 0 0 0 7px;
  }

  &__data {
    padding: 0 7px;
    width: 100%;
  }

  &__actions {
    justify-content: center;
  }

  &__icons {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  &__statusAndProgress {
    width: 100%;
    padding: 0 7px;
  }
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.currency2 {
  margin-left: 4px;
  color: $dark-border;
  font-family: Myriad400;
}

.progress__bar {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid $light-border;
}

a {
  color: $text;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}
</style>
