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
              :isBodyShort="true"
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
				steps: []

			}
		},
		methods: {
			getStepsPayables(stepFinance) {
				return stepFinance.reduce((sum, step) => {
					sum += step.nativeFinance.Price.payables || 0
					return sum
				}, 0)
			},
			formattedDate(date) {
				return moment(date).format("DD-MM-YYYY")
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
				console.log(this.reportDetailsInfo)
			},
			async getSteps() {
				this.steps = (await this.$http.post('/invoicing-reports/not-selected-steps-list/' + this.reportDetailsInfo.vendor._id)).data.map(i => ({ ...i, isCheck: false }))
			}
		},
		created() {
			this.openDetails(this.$route.params.id)
		},
		components: {
			Button,
			GeneralTable,
			AddStepsToInvoicing,
			ApproveModal
		}
	}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    &__text {
      font-size: 21px;
      font-family: 'Myriad600';
    }

    &__button {

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
      font-size: 16px;
      font-family: Myriad300;
      width: 300px;
      line-height: 1.2;
      padding-bottom: 10px;
      letter-spacing: .3px;
    }

    &__title {
      width: 100px;
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