<template lang="pug">
  .invoicing-details
    .invoicing-details__wrapper(v-if="reportDetailsInfo.hasOwnProperty('client')")
      .invoicing-details__details
        .title
          .title__text {{reportDetailsInfo.client.officialCompanyName}}

        .invoicing-details__body
          .invoicing-details__text
            .text__address {{ getBillingDetails(reportDetailsInfo).getAddress1() }}
            .text__block
              .text__title Customer:
              .text__value {{reportDetailsInfo.client.name}}
            .text__block
              .text__title Report Id:
              .text__value {{reportDetailsInfo.reportId}}
            .text__block(v-if="reportDetailsInfo.externalIntegration.reportId")
              .text__title External Report Id:
              .text__value {{reportDetailsInfo.externalIntegration.reportId}}
            .text__block
              .text__title Status:
              .text__value {{firstBigLatter(reportDetailsInfo.status)}}
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
              .text__value {{ reportDetailsInfo.stepsAndProjects.length }}
            .text__block
              .text__title Total amount:
              .text__value
                span(style="margin-right: 4px;") {{ reportDetailsInfo.total | roundTwoDigit }}
                span(v-html="'&euro;'")
            .text__block(v-if="this.reportDetailsInfo.status !== 'Created'")
              .text__title Invoice:
              .text__value
                .download-file(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.invoice.path)") {{reportDetailsInfo.invoice.filename}}
                //.file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.invoice.path)")
                //  i(class="fas fa-download")

            .text__block(v-if="this.reportDetailsInfo.status !== 'Created' && reportDetailsInfo.hasOwnProperty('reportFiles') && reportDetailsInfo.reportFiles.length > 0")
              .text__title Reports:
              .text__value
                .download-file(v-for="reportFile in reportDetailsInfo.reportFiles" style="cursor: pointer"  @click="downloadFile(reportFile.path)") {{reportFile.filename}}
            //.text__block(v-if="true")
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
              notApproveValue="Cancel"
              @approve="deleteStep"
              @close="closeModalStep"
              @notApprove="closeModalStep"
            )

            .invoicing-details__project-group(v-for="[project, stepsWithProject] in Object.entries(groupByProject)")
              .title-project
                span {{project}}
                span Total: {{getProjectTotalOrMinimumCharge(stepsWithProject) + sumPaymentAdditions(stepsWithProject[0].paymentAdditions)}}

              GeneralTable(
                :fields="fields",
                :tableData="stepsWithProject",
                :isFilterShow="false"
                :isFilterAbsolute="false"
                :isBodyShort="true"
              )

                template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
                  .table__header {{ field.label }}

                template(slot="projectName" slot-scope="{ row, index }")
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
                    span.currency(v-if="!isProjectMinimumCharge(stepsWithProject)" v-html="getProjectCurrencySymbol(stepsWithProject[0].projectCurrency)")
                    span(v-if="!isProjectMinimumCharge(stepsWithProject)") {{ row.finance.Price.receivables | roundTwoDigit}}
                    span(v-else) -

                template(slot="icons", slot-scope="{ row, index }")
                  .table__icons(v-if="(reportDetailsInfo.status === 'Created')")
                    i(class="fas fa-trash" @click="requestToDelete(row._id)")

              .payment-additions__sub-totoal {{isProjectMinimumCharge(stepsWithProject) ? 'Minimum Charge' : 'Sub-Total' }}: {{getProjectTotalOrMinimumCharge(stepsWithProject)}}

              .payment-additions(v-if="stepsWithProject[0].paymentAdditions.length > 0")
                GeneralTable(
                  :fields="fieldsAdditionalPaid"
                  :tableData="stepsWithProject[0].paymentAdditions"
                  :isFilterShow="false"
                  :isFilterAbsolute="false"
                  :isBodyShort="true"
                )

                  template(v-for="field in fieldsAdditionalPaid" :slot="field.headerKey" slot-scope="{ field }")
                    .table__header {{ field.label }}

                  //template(slot="projectId" slot-scope="{ row, index }")
                  //  .table__data {{ row.projectId }}

                  template(slot="name" slot-scope="{ row, index }")
                    .table__data {{ row.name }}

                  template(slot="value" slot-scope="{ row, index }")
                    .table__data
                      span.currency(v-html="getProjectCurrencySymbol(stepsWithProject[0].projectCurrency)")
                      span {{ row.value }}

                .payment-additions__sub-totoal Sub-Total(2): {{sumPaymentAdditions(stepsWithProject[0].paymentAdditions)}}



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
          :paymentDetails="{paymentDetails: {expectedPaymentDate: 0}}"
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
  import _ from "lodash"

	export default {
		name: "InvoicingDetails",
		data() {
			return {
				reportDetailsInfo: {},
				fields: [
          {
            label: "Project Name",
            headerKey: "headerProjectName",
            key: "projectName",
            style: { width: "22%" }
          },
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
        fieldsAdditionalPaid: [
          {
            label: "Title",
            headerKey: "headerName",
            key: "name",
            style: { width: "60%" }
          },
          {
            label: "Amount",
            headerKey: "headerValue",
            key: "value",
            style: { width: "40%" }
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
      downloadFile(path) {
        let link = document.createElement('a')
        link.href = __WEBPACK__API_URL__ + '/' + path
        link.target = "_blank"
        link.click()
      },
      firstBigLatter(string) {
			  return string[0].toUpperCase() + string.slice(1).toLowerCase()
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
      getBillingDetails({ client, clientBillingInfo }) {
        const { billingInfo } = client
        const { name, officialName, paymentType, paymentTerms: { name: paymentTerms }, address: { street1, street2, country, city } } = billingInfo.find(item => item._id.toString() === clientBillingInfo.toString())
        return {
          getOfficialName: () => officialName,
          getName: () => name,
          getPaymentTerms: () => paymentTerms,
          getPaymentType: () => paymentType,
          getAddress1: () => `${ street1 || 'No street' }, ${ city || 'No city' }, ${ country || 'No country' }`
        }
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
			// 	const reuslt = (await (this.$http.post(`/invoicing-payables/report-final-status/${ this.reportDetailsInfo._id }`, data))).data
      //   if (reuslt === "Moved") {
      //     await this.$router.push('/pangea-finance/invoicing-payables/reports')
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
			// 	await this.$http.post(`/invoicing-payables/report/${ reportId }/delete/${ stepId }`)
			// 	await this.refreshReports()
      //
			// },
			closeModalStep() {
				this.deleteInfo = {}
				this.isDeletingStep = false
			},
			async openDetails(id) {
				this.reportDetailsInfo = (await this.$http.post('/invoicing-receivables/paid-report/' + id)).data[0]
			},
			async getSteps() {
				this.steps = (await this.$http.post('/invoicing-payables/not-selected-steps-list/' + this.reportDetailsInfo.vendor._id)).data.map(i => ({ ...i, isCheck: false }))
				console.log('steps', this.steps)
			},

      isProjectMinimumCharge(stepsWithProject) {
        const receivablesAmount = stepsWithProject.reduce((acc, { finance }) => acc += finance.Price.receivables, 0).toFixed(2)
        const minimumCharge = stepsWithProject[0].minimumCharge
        return !minimumCharge.isIgnore && receivablesAmount < minimumCharge.value
      },
      getProjectTotalOrMinimumCharge(stepsWithProject){
        const receivablesAmount = stepsWithProject.reduce((acc, { finance }) => acc += finance.Price.receivables, 0).toFixed(2)
        const minimumCharge = stepsWithProject[0].minimumCharge
        return this.isProjectMinimumCharge(stepsWithProject) ? minimumCharge.value : receivablesAmount
      },
      getProjectCurrencySymbol (projectCurrency) {
        const currencies = {
          'EUR': '€',
          'USD': '$',
        }
        return currencies[projectCurrency]
      },
      sumPaymentAdditions (paymentAdditions) {
        return paymentAdditions.reduce((acc, {value}) => acc += value, 0)
      },
		},
		computed: {
			//Todo: show status "Invoice Received" and "Partially Paid"1
			getPaymentRemainder() {
			  return 10
				const { paymentInformation = [] } = this.reportDetailsInfo
				return paymentInformation.reduce((sum, item) => {
					sum += item.paidAmount
					return sum
				}, 0)
			},
			getUnpaidAmount() {
				const rawUnpaidAmount = this.getStepsPayables(this.reportDetailsInfo.stepsWithProject) - (+this.getPaymentRemainder)
				return +(parseFloat(rawUnpaidAmount)).toFixed(2)
			},
      groupByProject() {
        const groupedByProject = _.groupBy(this.reportDetailsInfo.stepsWithProject, (item) => {
          return item.projectId
        })
        console.log(groupedByProject)
        return groupedByProject
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

  .payment-additions {
    width: 450px;
    margin: 20px 0;
    margin-left: auto;

    &__sub-totoal {
      text-align: right;
      font-size: 16px;
      margin-top: 5px;
    }
  }
  .download-file {
    color: $red;
    &:hover {
      text-decoration: underline;
    }
  }

  .title-project{
    font-size: 18px;
    font-family: Myriad600;
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }


  .download-file {
    color: $red;
    &:hover {
      text-decoration: underline;
    }
  }

  .title-project{
    font-size: 18px;
    font-family: Myriad600;
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
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
      border: 1px solid #d66f5847;
      padding: 0 7px;
      height: 32px;
      display: flex;
      align-items: center;
      width: 100px;
      box-sizing: border-box;
      color: $red;
    }
  }

  .payment-additions {
    width: 470px;
    margin: 20px 0;
    margin-left: auto;


    & span {
      //float: right;

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
      font-size: 18px;
      font-family: 'Myriad600';
    }
  }

  .invoicing-details {
    position: relative;
    width: 1530px;
    margin: 50px;


    &__project-group {
      margin-bottom: 40px;
    }

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
      width: 65%;
      position: relative;
      max-height: 600px;
      overflow: auto;
      padding: 25px;
      border-radius: 4px;
      border: 2px solid #bfbfbf;
    }

    &__text {
      width: 30%;
    }

    &__title {
      font-size: 18px;
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
      width: 120px;
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
  .link-to {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
</style>