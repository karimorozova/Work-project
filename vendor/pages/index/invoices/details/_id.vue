<template lang="pug">
  .container
    .title Invoice Details
    .report
      .body
        .body__details
          .row
            .row__vendor
              span(v-if="Object.keys(vendor).length") {{ vendor.firstName + ' ' + vendor.surname || '' }}
          .row
            .row__address FOOO 333, Block B 55A, BAARRR Street, 04000 Kyiv, Ukraine
          .row
            .row__title Report Id:
            .row__value {{ reportDetailsInfo.reportId }}
          .row
            .row__title Status:
            .row__value {{ reportDetailsInfo.status }}
          .row
            .row__title Created On:
            .row__value(v-if="reportDetailsInfo.firstPaymentDate") {{ formattedDate(reportDetailsInfo.createdAt) }}
          .row
            .row__title Date range:
            .row__value(v-if="reportDetailsInfo.firstPaymentDate") {{ formattedDate(reportDetailsInfo.firstPaymentDate) + ' / ' + formattedDate(reportDetailsInfo.lastPaymentDate)  }}
          .row
            .row__title Jobs:
            .row__value(v-if="reportDetailsInfo.steps") {{ reportDetailsInfo.steps.length}}
          .row
            .row__title Total amount:
            .row__value(v-if="reportDetailsInfo.steps")
              span(style="margin-right: 4px;") {{ getStepsPayables(reportDetailsInfo.steps).toFixed(2) }}
              span(v-html="'&euro;'")

          .body__approve(v-if="reportDetailsInfo.status === 'Sent'")
            Button(value="Confirm" @clicked="approveReport")

        .body__table
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
                span {{ (row.nativeFinance.Price.payables).toFixed(2) }}

</template>

<script>

	import { mapGetters } from "vuex"
	import GeneralTable from "../../../../components/pangea/GeneralTable"
	import moment from 'moment'
	import Button from "../../../../components/pangea/Button"

	export default {
		components: { Button, GeneralTable },
		data() {
			return {
				reportDetailsInfo: {},
				fields: [
					{
						label: "Step Id",
						headerKey: "headerStepId",
						key: "stepId",
						style: { width: "31%" }
					},
					{
						label: "Step",
						headerKey: "headerService",
						key: "service",
						style: { width: "20%" }
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
						style: { width: "20%" }
					},
					{
						label: "Fee ",
						headerKey: "headerPayables",
						key: "payables",
						style: { width: "12%" }
					}
				]
			}
		},
		methods: {
			async approveReport() {
				try {
					const result = await this.$axios.post(`/vendor/approve-report`, {
						reportsIds: [ this.reportDetailsInfo._id.toString() ],
						nextStatus: 'Approved'
					})
					const decode = window.atob(result.data)
					const data = JSON.parse(decode)
					this.getReport(data)
				} catch (err) {
				}
			},
			formattedDate(date) {
				return moment(date).format("DD-MM-YYYY")
			},
			getStepsPayables(steps) {
				return steps.reduce((sum, finance) => {
					sum += finance.nativeFinance.Price.payables || 0
					return sum
				}, 0)
			},
			async getReport() {
				try {
					const result = await this.$axios.get(`/vendor/get-report?reportId=${ this.$route.params.id }`)
					const decode = window.atob(result.data)
					this.reportDetailsInfo = JSON.parse(decode)[0]
				} catch (e) {

				}
			}
		},
		async created() {
			await this.getReport()
		},
		computed: {
			...mapGetters({
				vendor: "getVendor"
			})
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors";

  .row {
    display: flex;
    margin-bottom: 8px;

    &__vendor {
      font-size: 18px;
      font-family: 'Myriad900';
      height: 27px;
      width: 290px;
    }

    &__address {
      font-size: 15px;
      font-family: Myriad300;
      width: 290px;
      line-height: 1.2;
      padding-bottom: 10px;
      letter-spacing: .2px;
    }

    &__title {
      width: 120px;
      font-family: Myriad600;
    }

    &__value {
      width: 170px;
    }
  }

  .body {
    display: flex;
    justify-content: space-between;

    &__approve {
      display: flex;
      -webkit-box-pack: center;
      justify-content: center;
      margin-top: 20px;
      border-top: 1px solid $border;
      margin-right: 20px;
      padding-top: 20px;
    }

    &__details {
      width: 34%;
    }

    &__table {
      width: 66%;
    }
  }

  .container {
    margin: 50px;
  }

  .title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 10px;
  }

  .report {
    box-shadow: $box-shadow;
    padding: 20px;
    margin-bottom: 50px;
    border-radius: 4px;
    width: 1000px;
    box-sizing: border-box;
  }

  .table {
    &__header {
      padding: 0 0 0 7px;
    }

    &__icon {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    &__data {
      padding: 0 7px;
    }
  }

  .currency {
    margin-right: 4px;
    color: $dark-border;
  }
</style>