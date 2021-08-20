<template lang="pug">
  .invoicing-details
    .invoicing-details__wrapper(v-if="reportDetailsInfo.hasOwnProperty('vendor')")
      .invoicing-details__details
        .title
          .title__text {{reportDetailsInfo.vendor.firstName + ' ' + reportDetailsInfo.vendor.surname}}
          .title__button(v-if="!toggleAddSteps")
            Button(value="Add jobs" @clicked="changeToggleAddSteps")

        .invoicing-details__body
          .invoicing-details__text
            .text__address Office 333, Block B 55A, Mezhyhirska Street, 04000 Kyiv, Ukraine
            .text__block
              .text__title Report Id:
              .text__value {{reportDetailsInfo.reportId}}
            .text__block
              .text__title Status:
              .text__value {{reportDetailsInfo.status}}
            .text__block
              .text__title Created At:
              .text__value {{ formattedDate(reportDetailsInfo.createdAt) }}
            .text__block
              .text__title Date range:
              .text__value {{ formattedDate(reportDetailsInfo.firstPaymentDate) + ' / ' + formattedDate(reportDetailsInfo.lastPaymentDate)  }}
            .text__block
              .text__title Jobs:
              .text__value {{ reportDetailsInfo.steps.length }}
            .text__block
              .text__title Total amount:
              .text__value
                span(style="margin-right: 4px;") {{ getStepsPayables(reportDetailsInfo.steps) | roundTwoDigit }}
                span(v-html="'&euro;'")

            .payment-info
              .payment-info__block-title Payment information
              .payment-info__block
                .payment-info__title
                  span Paid Amount:
                  .check-box
                    CheckBox(:isChecked="isFull" :isWhite="true" @check="togglePaidFull(true)" @uncheck="togglePaidFull(false)")
                    span(class="check-box__text") paid full
                input(:value="amount" @change="updatePaidAmount" class="payment-info__input" :disabled="isFull")
              .payment-info__block-flex
                .payment-info__title Unpaid Amount:
                .payment-info__value {{ (getStepsPayables(reportDetailsInfo.steps) - this.getPaymentRemainder) | roundTwoDigit}} €
              .payment-info__block
                .payment-info__title Payment Method:
                .payment-info__select
                  SelectSingle(
                    :selectedOption="paymentMethod"
                    :options="['1', '2', '3' ]"
                    placeholder="Option"
                    @chooseOption="setPaymentMethod"
                  )
              .payment-info__block
                .payment-info__title Payment Date:
                DatepickerWithTime(
                  :value="paymentDate"
                  @selected="setFromDate"
                  placeholder="Date"
                  :isTime="true"
                  :highlighted="highlighted"
                  :monday-first="true"
                  inputClass="datepicker-custom-filter"
                  calendarClass="calendar-custom"
                  :format="customFormatter"
                )
              .payment-info__block
                .payment-info__title Notes:
                textarea(v-model="notes")
              Button(value="Submit" @clicked="reportToPayment")


          .invoicing-details__table
            ApproveModal(
              v-if="isDeletingStep"
              class="absolute-middle"
              text="Are you sure?"
              approveValue="Yes"
              notApproveValue="No"
              @approve="deleteStep"
              @close="closeModalStep"
              @notApprove="closeModalStep"
            )
            GeneralTable(
              :fields="fields",
              :tableData="reportDetailsInfo.steps",
              :isFilterShow="false"
              :isFilterAbsolute="false"
            )

              template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
                .table__header {{ field.label }}

              template(slot="stepId" slot-scope="{ row, index }")
                .table__data {{ row.stepId }}

              template(slot="service" slot-scope="{ row, index }")
                .table__data {{ row.service.title }}

              template(slot="langPair" slot-scope="{ row, index }")
                .table__data {{ row.sourceLanguage}}
                  span(style="font-size: 12px;color: #999999; margin: 0 4px;")
                    i(class="fas fa-angle-double-right")
                  | {{ row.targetLanguage }}

              template(slot="billing" slot-scope="{ row, index }")
                .table__data {{ formattedDate(row.billingDate) }}

              template(slot="payables" slot-scope="{ row, index }")
                .table__data
                  span.currency(v-html="'&euro;'")
                  span {{ row.nativeFinance.Price.payables | roundTwoDigit}}

              template(slot="icons", slot-scope="{ row, index }")
                .table__icons
                  i(class="fas fa-trash" @click="requestToDelete(row._id)")

      .invoicing-details__add-steps
        .add-steps__body
          AddStepsToInvoicing.add-steps__table(
            v-if="toggleAddSteps"
            :steps="steps"
            :invoicingEditId="reportDetailsInfo._id"
            @refreshReports="refreshReports"
            @closeTable="changeToggleAddSteps"
          )


</template>

<script>
	import GeneralTable from '../GeneralTable'
	import moment from "moment"
	import AddStepsToInvoicing from "./AddStepsToInvoicing"
	import ApproveModal from '../ApproveModal'
	import Button from "../Button"
	import SelectSingle from "../SelectSingle"
	import DatepickerWithTime from "../DatepickerWithTime"
	import CheckBox from "../CheckBox"

	export default {
		name: "InvoicingDetails",
		data() {
			return {
				reportDetailsInfo: {},
				fields: [
					{
						label: "Step Id",
						headerKey: "headerStepId",
						key: "stepId",
						style: { width: "25%" }
					},
					{
						label: "Step",
						headerKey: "headerService",
						key: "service",
						style: { width: "17%" }
					},
					{
						label: "Billing Date",
						headerKey: "headerBilling",
						key: "billing",
						style: { width: "17%" }
					},
					{
						label: "Language Pair",
						headerKey: "headerLangPair",
						key: "langPair",
						style: { width: "17%" }
					},
					{
						label: "Fee ",
						headerKey: "headerPayables",
						key: "payables",
						style: { width: "17%" }
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						style: { width: "7%" }
					}
				],
				toggleAddSteps: false,
				deleteInfo: {},
				isDeletingStep: false,
				steps: [],
        paymentMethod: '',
        paymentDate: new Date(),
        amount: 0,
        notes: '',

        isFull: false

			}
		},
		methods: {
			getStepsPayables(stepFinance) {
				return stepFinance.reduce((sum, step) => {
					sum += step.nativeFinance.Price.payables || 0
					return sum
				}, 0)
			},
      setPaymentMethod({option}) {
        this.paymentMethod = option
      },
      setFromDate(e) {
			  this.paymentDate = e
      },
      customFormatter(date) {
        return moment(date).format('DD-MM-YYYY, HH:mm')
      },
      async reportToPayment() {
        const data = {
          paidAmount: this.amount,
          unpaidAmount: this.getPaymentRemainder - this.amount,
          paymentMethod: this.paymentMethod,
          paymentDate: this.paymentDate,
          notes: this.notes,
        }
        await this.$http.post(`/invoicing-reports/report-final-status/${this.reportDetailsInfo._id}` , data)
        this.amount = 0
        await this.refreshReports()
      },
      updatePaidAmount(event) {
        const value = event.target.value
        console.log(value, this.amount)
        if (value <= (this.getStepsPayables(this.reportDetailsInfo.steps) - this.getPaymentRemainder)) {
          this.amount = value
        }
        this.$forceUpdate()
      },
      togglePaidFull(val) {
			  this.isFull = val
        if (val) {
          this.amount = this.getStepsPayables(this.reportDetailsInfo.steps) - this.getPaymentRemainder
        }
      },
			formattedDate(date) {
				return moment(date).format("DD-MM-YYYY ")
			},
			async refreshReports() {
				await this.openDetails(this.$route.params.id)
				await this.getSteps()
			},
			changeToggleAddSteps() {
				this.toggleAddSteps = !this.toggleAddSteps
				if (this.toggleAddSteps) {
					this.getSteps()
				}
			},
			requestToDelete(stepId) {
				this.deleteInfo = { reportId: this.reportDetailsInfo._id, stepId }
				this.isDeletingStep = true
			},
			async deleteStep() {
				const { reportId, stepId } = this.deleteInfo
				this.closeModalStep()
				await this.$http.post(`/invoicing-reports/report/${ reportId }/delete/${ stepId }`)
				await this.refreshReports()

			},
			closeModalStep() {
				this.deleteInfo = {}
				this.isDeletingStep = false
			},
			async openDetails(id) {
				this.reportDetailsInfo = (await this.$http.post('/invoicing-reports/report/' + id)).data[0]
			},
			async getSteps() {
				this.steps = (await this.$http.post('/invoicing-reports/not-selected-steps-list/' + this.reportDetailsInfo.vendor._id)).data.map(i => ({ ...i, isCheck: false }))
				console.log('steps', this.steps)
			}
		},
    computed: {
      getPaymentRemainder() {
        const {paymentInformation = []} = this.reportDetailsInfo
        return paymentInformation.reduce((sum, item) => {
          sum += item.paidAmount
          return sum
        } ,0)
      },
    },
		created() {
			this.openDetails(this.$route.params.id)
		},
		components: {
			Button,
			GeneralTable,
			AddStepsToInvoicing,
			ApproveModal,
      SelectSingle,
      DatepickerWithTime,
      CheckBox,
		}
	}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";
  .payment-info {
    &__block-title {
      font-size: 18px;
      font-family: Myriad600;
    }
    &__block {
      margin: 10px 0;
      width: 220px;
    }
    &__block-flex {
      margin: 10px 0;
      display: flex;
      width: 220px;
      justify-content: space-between;
    }
    &__select{
      position: relative;
      height: 31px;
    }
    &__title {
      display: flex;
      justify-content: space-between;
      font-family: Myriad600;
    }
    &__input {
      font-size: 14px;
      color: #3d3d3d;
      border: 1px solid #bfbfbf;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 0 7px;
      outline: none;
      width: 220px;
      height: 32px;
      transition: .1s ease-out;
    }
  }
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    height: 32px;

    &__text {
      font-size: 21px;
      font-family: 'Myriad600';
    }
  }

  .invoicing-details {
    position: relative;
    width: 1530px;
    margin: 50px;
    background: #fff;

    &__body {
      display: flex;
      justify-content: space-between;
    }

    &__wrapper {
      border-radius: 4px;
      padding: 20px;
      box-sizing: border-box;
      box-shadow: 0 1px 2px 0 rgba(99, 99, 99, .3), 0 1px 3px 1px rgba(99, 99, 99, .15);
    }

    &__table {
      width: 70%;
      position: relative;
    }

    &__text {
      width: 30%;
    }

    &__title {
      font-size: 21px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: Myriad600;
    }
  }

  .text {
    &__block {
      margin: 10px 0;
      width: 310px;
      display: flex;
      justify-content: space-between;
    }

    &__address {
      font-size: 15px;
      font-family: Myriad300;
      width: 300px;
      line-height: 1.2;
      padding-bottom: 10px;
      letter-spacing: .2px;
    }

    &__title {
      width: 100px;
      font-family: Myriad600;
    }

    &__value {
      width: 180px;
    }
  }

  .fa-trash {
    cursor: pointer;
    font-size: 15px;
  }

  .table {
    &__header,
    &__data {
      padding: 0 7px;
    }

    &__data {
      width: 100%;
    }

    &__icons {
      width: 100%;
      height: 40px;
      align-items: center;
      display: flex;
      justify-content: center;
    }
  }
  .check-box {
    display: flex;
    &__text {
      font-family: Myriad400;
    }
  }

  .absolute-middle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 5;
  }

  .currency {
    margin-right: 4px;
    color: $dark-border;
  }
</style>