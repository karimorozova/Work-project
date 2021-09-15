<template lang="pug">
  .invoicing-details
    .invoicing-details__wrapper(v-if="reportDetailsInfo.hasOwnProperty('vendor')")
      .invoicing-details__details
        .title
          .title__text {{reportDetailsInfo.vendor.firstName + ' ' + reportDetailsInfo.vendor.surname}}

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
            .text__block(v-if="this.reportDetailsInfo.status === 'Invoice Received' || this.reportDetailsInfo.status === 'Partially Paid' ")
              .text__title Invoice:
              .text__value
                .file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.paymentDetails.file.path)")
                  i(class="fas fa-download")

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


      //.invoicing-details__add-steps
      //  .add-steps__body
      //    AddStepsToInvoicing.add-steps__table(
      //      v-if="toggleAddSteps"
      //      :steps="steps"
      //      :invoicingEditId="reportDetailsInfo._id"
      //      @refreshReports="refreshReports"
      //      @closeTable="changeToggleAddSteps"
      //    )

    .invoicing-details__cards(v-if="reportDetailsInfo && reportDetailsInfo.paymentInformation.length")
      .invoicing-details__card(v-for="cardInfo in reportDetailsInfo.paymentInformation")
        ReceivablesPaymentInformationCard(
          :cardInfo="cardInfo"
          :paymentDetails="reportDetailsInfo.paymentDetails"
        )

</template>

<script>
	import GeneralTable from '../GeneralTable'
	import moment from "moment"
	// import AddStepsToInvoicing from "./AddStepsToInvoicing"
	import ApproveModal from '../ApproveModal'
	import Button from "../Button"
	import SelectSingle from "../SelectSingle"
	import DatepickerWithTime from "../DatepickerWithTime"
	import CheckBox from "../CheckBox"
	import ReceivablesPaymentInformationCard from "./ReceivablesPaymentInformationCard"

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
						style: { width: "19%" }
					},
					{
						label: "Billing Date",
						headerKey: "headerBilling",
						key: "billing",
						style: { width: "19%" }
					},
					{
						label: "Language Pair",
						headerKey: "headerLangPair",
						key: "langPair",
						style: { width: "19%" }
					},
					{
						label: "Fee ",
						headerKey: "headerPayables",
						key: "payables",
						style: { width: "18%" }
					},
				],
				// toggleAddSteps: false,
				deleteInfo: {},
				isDeletingStep: false,
				steps: [],
				// paymentMethod: '',
				// paymentDate: new Date(),
				amount: 0,
				// notes: '',

				isFull: false,

				disabled: {
					to: moment().add(-1, 'day').endOf('day').toDate()
				}
			}
		},
		methods: {
			getStepsPayables(stepFinance) {
				return stepFinance.reduce((sum, step) => {
					sum += step.nativeFinance.Price.payables || 0
					return sum
				}, 0)
			},
			// setPaymentMethod({ option }) {
			// 	this.paymentMethod = option
			// },
			// setFromDate(e) {
			// 	this.paymentDate = e
			// },
			// customFormatter(date) {
			// 	return moment(date).format('DD-MM-YYYY, HH:mm')
			// },
			// async reportToPayment() {
			// 	const data = {
			// 		paidAmount: this.amount,
			// 		unpaidAmount: this.getUnpaidAmount - +this.amount,
			// 		// paymentMethod: this.paymentMethod,
			// 		// paymentDate: this.paymentDate,
			// 		// notes: this.notes
			// 	}
			// 	const reuslt = (await (this.$http.post(`/invoicing-reports/report-final-status/${ this.reportDetailsInfo._id }`, data))).data
      //   if (reuslt === "Moved") {
      //     await this.$router.push('/pangea-finance/invoicing-reports/reports')
      //   }else {
      //     await this.refreshReports()
      //   }
			// 	this.amount = 0
			// },
			// updatePaidAmount(event) {
			// 	const value = event.target.value
			// 	console.log(value, this.amount)
			// 	if ((+value).toFixed(2) <= this.getUnpaidAmount && value >= 0) {
			// 		this.amount = (parseFloat(value)).toFixed(2)
			// 	}
			// 	this.$forceUpdate()
			// },
			// togglePaidFull(val) {
			// 	this.isFull = val
			// 	if (val) {
			// 		this.amount = this.getUnpaidAmount
			// 	}
			// },
			formattedDate(date) {
				return moment(date).format("DD-MM-YYYY ")
			},
			// async refreshReports() {
			// 	await this.openDetails(this.$route.params.id)
			// 	await this.getSteps()
			// },
			// changeToggleAddSteps() {
			// 	this.toggleAddSteps = !this.toggleAddSteps
			// 	if (this.toggleAddSteps) {
			// 		this.getSteps()
			// 	}
			// },
			// requestToDelete(stepId) {
			// 	this.deleteInfo = { reportId: this.reportDetailsInfo._id, stepId }
			// 	this.isDeletingStep = true
			// },
			// async deleteStep() {
			// 	const { reportId, stepId } = this.deleteInfo
			// 	this.closeModalStep()
			// 	await this.$http.post(`/invoicing-reports/report/${ reportId }/delete/${ stepId }`)
			// 	await this.refreshReports()
      //
			// },
			closeModalStep() {
				this.deleteInfo = {}
				this.isDeletingStep = false
			},
			async openDetails(id) {
				this.reportDetailsInfo = (await this.$http.post('/invoicing-payables/paid-report/' + id)).data[0]
			},
			async getSteps() {
				this.steps = (await this.$http.post('/invoicing-payables/not-selected-steps-list/' + this.reportDetailsInfo.vendor._id)).data.map(i => ({ ...i, isCheck: false }))
				console.log('steps', this.steps)
			}
		},
		computed: {
			//Todo: show status "Invoice Received" and "Partially Paid"1
			getPaymentRemainder() {
				const { paymentInformation = [] } = this.reportDetailsInfo
				return paymentInformation.reduce((sum, item) => {
					sum += item.paidAmount
					return sum
				}, 0)
			},
			getUnpaidAmount() {
				const rawUnpaidAmount = this.getStepsPayables(this.reportDetailsInfo.steps) - (+this.getPaymentRemainder)
				return +(parseFloat(rawUnpaidAmount)).toFixed(2)
			}
		},
		created() {
			this.openDetails(this.$route.params.id)
		},
		components: {
			Button,
			GeneralTable,
			// AddStepsToInvoicing,
			ApproveModal,
			SelectSingle,
			DatepickerWithTime,
			CheckBox,
      ReceivablesPaymentInformationCard
		}
	}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";

  textarea {
    width: 100%;
    border-radius: 4px;
    border: 1px solid $border;
    padding: 5px;
    color: $text;
    outline: none;
    box-sizing: border-box;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .file-fake-button {
    height: 30px;
    width: 40px;
    background-color: $red;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: white;

  }

  .green-value {
    border: 1px solid $border !important;
    color: $text !important;
  }

  .amount {
    &__title {
      font-family: Myriad600;
      width: 120px;
      align-items: center;
      display: flex;
    }

    &__value {
      border-radius: 4px;
      border: 1px solid #d15f4547;
      padding: 0 7px;
      height: 32px;
      display: flex;
      align-items: center;
      width: 100px;
      box-sizing: border-box;
      color: $red;
    }
  }

  .payment-info {
    width: 427px;
    padding: 20px;
    box-sizing: border-box;
    background: white;
    border: 2px solid $border;
    margin-top: 20px;
    border-radius: 4px;


    &__notes {
      margin-top: 10px;
    }

    &__payBlock {
      display: flex;
    }

    &__file {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    &__amountAndFile {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    &__amount {
      display: flex;
    }

    &__double {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid #ededed;
    }

    &__doublePay {
      gap: 15px;
      display: flex;
      margin-bottom: 12px;
    }

    /*&__block-title {*/
    /*  font-size: 18px;*/
    /*  font-family: Myriad600;*/
    /*}*/

    &__block {
      /*margin: 10px 0;*/
      /*width: 220px;*/
    }

    &__block-flex {
      /*margin: 10px 0;*/
      /*display: flex;*/
      /*width: 220px;*/
      /*justify-content: space-between;*/
    }

    &__select {
      position: relative;
      height: 32px;
      width: 185px;
      background-color: white;
      border-radius: 4px;
    }

    &__title {
      font-family: Myriad600;
      margin-bottom: 3px;
    }

    &__input {
      font-size: 14px;
      border: 1px solid $border;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 0 7px;
      outline: none;
      width: 100px;
      height: 32px;
      transition: .1s ease-out;

      &:focus {
        border: 1px solid $border-focus;
      }
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


    &__cards {
      display: flex;
      flex-wrap: wrap;
    }

    &__body {
      display: flex;
      justify-content: space-between;
    }

    &__wrapper {
      border-radius: 4px;
      padding: 20px;
      box-sizing: border-box;
      box-shadow: 0 1px 2px 0 rgba(99, 99, 99, .3), 0 1px 3px 1px rgba(99, 99, 99, .15);
      background: white;
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
    margin-top: 6px;

    &__text {
      font-family: Myriad400;
      margin-left: 7px;
      margin-top: 2px;
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