<template lang="pug">
  .invoicing-details
    .invoicing-details__wrapper(v-if="Object.keys(reportDetailsInfo).length")
      .invoicing-details__details
        .title
          .title__text
            router-link(class="link-to" target= '_blank' :to="{path: `/pangea-clients/all/details/${reportDetailsInfo.client._id}`}")
              span {{ reportDetailsInfo.client.name }}
          .title__button(v-if='!toggleAddSteps && reportDetailsInfo.status === "Created"')
            .flex-wrapper
              Button(value="Generate Invoice" @clicked="generateInvoice")
              Button(value="Add jobs" @clicked="changeToggleAddSteps")

        .invoicing-details__body
          .invoicing-details__text
            .text__address {{ getBillingDetails(reportDetailsInfo).getAddress1() }}
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
              .text__title Billing name:
              .text__value {{ getBillingDetails(reportDetailsInfo).getName() }}
            .text__block
              .text__title Payment type:
              .text__value {{ getBillingDetails(reportDetailsInfo).getPaymentType() }}
            .text__block
              .text__title Payment terms:
              .text__value {{ getBillingDetails(reportDetailsInfo).getPaymentTerms() }}
            .text__block
              .text__title Projects:
              .text__value {{ getReportProjectsCount(reportDetailsInfo) }}
            .text__block
              .text__title Jobs:
              .text__value {{ reportDetailsInfo.stepsWithProject.length }}
            .text__block
              .text__title Total amount:
              .text__value
                span(style="margin-right: 4px;") {{ getTotalAmount(reportDetailsInfo) | roundTwoDigit }}
                span(v-html="'&euro;'")
            //.text__block(v-if="true")
              .text__title Invoice:
              .text__value
                .file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.paymentDetails.file.path)")
                  i(class="fas fa-download")


            // .payment-info(v-if="true")

            //   .payment-info__doublePay
            //     .payment-info__payBlock
            //       .amount__title Paid Amount:
            //       input(:value="amount" @change="updatePaidAmount" class="payment-info__input" :disabled="isFull")
            //     .check-box
            //       CheckBox(:isChecked="isFull" :isWhite="true" @check="togglePaidFull(true)" @uncheck="togglePaidFull(false)")
            //       span(class="check-box__text") Paid full

            //   .payment-info__amountAndFile
            //     .payment-info__amount
            //       .amount__title Unpaid Amount:
            //       .amount__value(:class="{'green-value': +getUnpaidAmount === 0 }") {{ getUnpaidAmount }} €

            //   .payment-info__double
            //     .payment-info__block
            //       .payment-info__title Payment Method:
            //       .payment-info__select
            //         SelectSingle(
            //           :selectedOption="paymentMethod"
            //           :options="['test1', 'test2', 'test3' ]"
            //           placeholder="Option"
            //           @chooseOption="setPaymentMethod"
            //         )
            //     .payment-info__block
            //       .payment-info__title Payment Date:
            //       DatepickerWithTime(
            //         :value="paymentDate"
            //         @selected="setFromDate"
            //         placeholder="Date"
            //         :isTime="true"
            //         :highlighted="highlighted"
            //         :monday-first="true"
            //         inputClass="datepicker-custom-filter-185"
            //         calendarClass="calendar-custom"
            //         :format="customFormatter"
            //         :disabled="disabled"
            //       )


            //   .payment-info__notes
            //     .payment-info__title Notes:
            //     textarea(type="text" rows="3" v-model="notes")

            //   Button(style="display: flex; justify-content: center; margin-top: 20px;" v-if="amount" :value="'Submit ' + `${amount} €`" @clicked="reportToPayment")

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
              :tableData="reportDetailsInfo.stepsWithProject",
              :isFilterShow="false"
              :isFilterAbsolute="false"
            )

              template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
                .table__header {{ field.label }}

              template(slot="project" slot-scope="{ row, index }")
                .table__data(style="word-break: break-word;")
                  router-link(class="link-to" target= '_blank' :to="{path: `/pangea-projects/all-projects/All/details/${row.projectNativeId}`}")
                    span {{ row.projectName.length > 30 ? (row.projectName.substring(0, 30) + '...') : row.projectName }}

              template(slot="stepId" slot-scope="{ row, index }")
                .table__data {{ row.stepId }}

              template(slot="service" slot-scope="{ row, index }")
                .table__data {{ row.name }}

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
                  span {{ row.finance.Price.receivables | roundTwoDigit}}

              template(slot="icons", slot-scope="{ row, index }")
                .table__icons(v-if="(reportDetailsInfo.status === 'Created')")
                  i(class="fas fa-trash" @click="requestToDelete(row._id)")

      .invoicing-details__add-steps
        .add-steps__body
          ReceivablesAddStepsTo.add-steps__table(
            v-if="toggleAddSteps"
            :steps="steps"
            @refreshReports="refreshReports"
            @closeTable="changeToggleAddSteps"
          )

    // .invoicing-details__cards(v-if="reportDetailsInfo && reportDetailsInfo.paymentInformation.length")
    //   .invoicing-details__card(v-for="cardInfo in reportDetailsInfo.paymentInformation")
    //     ReceivablesPaymentInformationCard(
    //       :cardInfo="cardInfo"
    //       :paymentDetails="reportDetailsInfo.paymentDetails"
    //     )

</template>

<script>
	import GeneralTable from '../GeneralTable'
	import moment from "moment"
	import ReceivablesAddStepsTo from "./ReceivablesAddStepsTo"
	import ApproveModal from '../ApproveModal'
	import Button from "../Button"
	import SelectSingle from "../SelectSingle"
	import DatepickerWithTime from "../DatepickerWithTime"
	import CheckBox from "../CheckBox"
	import ReceivablesPaymentInformationCard from "./ReceivablesPaymentInformationCard"
	import { mapActions } from "vuex"

	export default {
		name: "InvoicingDetails",
		data() {
			return {
				reportDetailsInfo: {},
				fields: [
					{
						label: "Project",
						headerKey: "headerStepId",
						key: "project",
						style: { width: "22%" }
					},
					{
						label: "Step ID",
						headerKey: "headerStepId",
						key: "stepId",
						style: { width: "19%" }
					},
					{
						label: "Step",
						headerKey: "headerService",
						key: "service",
						style: { width: "14%" }
					},
					{
						label: "Billing Date",
						headerKey: "headerBilling",
						key: "billing",
						style: { width: "14%" }
					},
					{
						label: "Language Pair",
						headerKey: "headerLangPair",
						key: "langPair",
						style: { width: "14%" }
					},
					{
						label: "Fee ",
						headerKey: "headerPayables",
						key: "payables",
						style: { width: "10%" }
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

				isFull: false,

				disabled: {
					to: moment().add(-1, 'day').endOf('day').toDate()
				}
			}
		},
		methods: {
			getBillingDetails({ client, clientBillingInfo }) {
				const { billingInfo } = client
				const { name, paymentType, paymentTerms: { name: paymentTerms }, address: { street1, street2, country, city } } = billingInfo.find(item => item._id.toString() === clientBillingInfo.toString())
				return {
					getName: () => name,
					getPaymentTerms: () => paymentTerms,
					getPaymentType: () => paymentType,
					getAddress1: () => `${ street1 || 'No street' }, ${ city || 'No city' }, ${ country || 'No country' }`
				}
			},
			getReportProjectsCount({ stepsAndProjects }) {
				const { length } = [ ...new Set(stepsAndProjects.map(i => i.project)) ]
				return length
			},
			getTotalAmount({ stepsWithProject }) {
				return stepsWithProject.reduce((sum, i) => {
					sum += i.finance.Price.receivables || 0
					return sum
				}, 0)
			},
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
			// 		unpaidAmount: (this.getUnpaidAmount - +this.amount).toFixed(2),
			// 		paymentMethod: this.paymentMethod,
			// 		paymentDate: this.paymentDate,
			// 		notes: this.notes
			// 	}
			// 	const reuslt = (await (this.$http.post(`/invoicing-payables/report-final-status/${ this.reportDetailsInfo._id }`, data))).data
			//   if (reuslt === "Moved") {
			//     await this.$router.push('/pangea-finance/invoicing-payables/paid-invoices/' + this.reportDetailsInfo._id)
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
      async generateInvoice() {
				try {
					const result = await this.$http.post('/invoicing-receivables/zoho/createInvoice', { _id: this.$route.params.id })
          this.alertToggle()
				}catch (e) {

				}
      },
			formattedDate(date) {
				return moment(date).format("DD-MM-YYYY ")
			},
			async refreshReports() {
				await this.getReportDetails(this.$route.params.id)
				await this.callDesiredStepsMethod()
			},
			changeToggleAddSteps() {
				this.toggleAddSteps = !this.toggleAddSteps
				if (this.toggleAddSteps) this.callDesiredStepsMethod()
			},
			requestToDelete(stepId) {
				this.deleteInfo = { reportId: this.reportDetailsInfo._id, stepId }
				this.isDeletingStep = true
			},
			async deleteStep() {
				const { reportId, stepId } = this.deleteInfo
				this.closeModalStep()
				await this.$http.post(`/invoicing-receivables/report/${ reportId }/delete/${ stepId }`)
				await this.refreshReports()
			},
			closeModalStep() {
				this.deleteInfo = {}
				this.isDeletingStep = false
			},
			callDesiredStepsMethod() {
				const PT = this.getBillingDetails(this.reportDetailsInfo).getPaymentType()
				PT === 'PPP' || PT === 'Pre-Payment'
						? this.getStepsMonoProject()
						: this.getStepsMultiProject()
			},
			async getStepsMonoProject() {
				const { stepsAndProjects, clientBillingInfo } = this.reportDetailsInfo
				try {
					this.steps = (await this.$http.post('/invoicing-receivables/not-selected-steps-list-mono-project/', {
						projectId: stepsAndProjects[0].project,
						clientBillingInfo
					})).data.map(i => ({ ...i, isCheck: false }))
				} catch (err) {
					this.alertToggle({ message: "Error on getting details", isShow: true, type: "error" })
				}
			},
			async getStepsMultiProject() {
				const { clientBillingInfo } = this.reportDetailsInfo
				try {
					this.steps = (await this.$http.post('/invoicing-receivables/not-selected-steps-list-multi-project/', {
						clientBillingInfo
					})).data.map(i => ({ ...i, isCheck: false }))
				} catch (err) {
					this.alertToggle({ message: "Error on getting details", isShow: true, type: "error" })
				}
			},
			async getReportDetails(id) {
				try {
					this.reportDetailsInfo = (await this.$http.post('/invoicing-receivables/report/' + id)).data
				} catch (err) {
					this.alertToggle({ message: "Error on getting details", isShow: true, type: "error" })
				}
			},
			...mapActions([ 'alertToggle' ])
		},
		computed: {
			// getPaymentRemainder() {
			// 	const { paymentInformation = [] } = this.reportDetailsInfo
			// 	return paymentInformation.reduce((sum, item) => {
			// 		sum += item.paidAmount
			// 		return sum
			// 	}, 0)
			// },
			// getUnpaidAmount() {
			// 	const rawUnpaidAmount = this.getStepsPayables(this.reportDetailsInfo.steps) - (+this.getPaymentRemainder)
			// 	return +(parseFloat(rawUnpaidAmount)).toFixed(2)
			// }
		},
		async created() {
			await this.getReportDetails(this.$route.params.id)
			// this.paymentMethod = this.reportDetailsInfo.paymentDetails.paymentMethod
		},
		components: {
			Button,
			GeneralTable,
			ReceivablesAddStepsTo,
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
      font-size: 22px;
      font-family: 'Myriad600';

      a {
        color: inherit;
        text-decoration: none;
        transition: .2s ease-out;

        &:hover {
          text-decoration: underline;
        }
      }
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
      padding: 25px;
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
      letter-spacing: 0.1px;
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

      a {
        color: inherit;
        text-decoration: none;
        transition: .2s ease-out;

        &:hover {
          text-decoration: underline;
        }
      }
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
  .flex-wrapper {
    display: flex;
  }
</style>