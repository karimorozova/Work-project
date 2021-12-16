<template lang="pug">
  .wrapper
    .block(v-if="!!this.query.type")
      .block__header
        img.image(src="../../assets/images/latest-version/navbar-logo.svg")
      .block__details
        .block__details-title Decide on a Quote
        .block__details-title2 Quote details:

        .block__details-data
          .block__details-row
            .block__details-key Name:
            .block__details-value {{ dataToDisplay.projectName }}

          .block__details-row
            .block__details-key ID:
            .block__details-value {{ dataToDisplay.projectId }}

          .block__details-row
            .block__details-key Industry:
            .block__details-value {{ dataToDisplay.industry }}

          .block__details-row
            .block__details-key Services:
            .block__details-value {{ dataToDisplay.services }}

          .block__details-row
            .block__details-key Languages:
            .block__details-value(v-html="dataToDisplay.languages")

          .block__details-row(v-if="!!dataToDisplay.deadline")
            .block__details-key Deadline:
            .block__details-value(v-if="this.query.type === 'vendor'") {{ getVendorDateFormat(dataToDisplay.deadline) }}
            .block__details-value(v-if="this.query.type === 'client' && this.query.hasOwnProperty('tasksIds')") {{ getClientDateFormat(dataToDisplay.deadline) }}
            .block__details-value(v-if="this.query.type === 'client' && !this.query.hasOwnProperty('tasksIds')") {{ calculateNewDeadline(dataToDisplay.deadline) }}

          .block__details-row.grey
            .block__details-key Amount:
            .block__details-value {{ dataToDisplay.amount }}
              span(v-html="returnIconCurrencyByStringCode(dataToDisplay.projectCurrency)")

      .block__checks(v-if="this.query.prop === 'accept' && this.query.type === 'client' && !this.query.hasOwnProperty('tasksIds')")
        CheckBox(
          :isChecked="isCheck"
          @check="toggleCheck(row, true)"
          @uncheck="toggleCheck(row, false)"
        )
        span(style="margin-top: 3px;") I have seen the new deadline and accept it

      .block__button
        Button(
          :value="this.query.prop === 'accept' ? 'Accept' : 'Reject'"
          :color="this.query.prop === 'accept' ? '#4ba5a5' : '#d66f58'"
          :isDisabled="!isCheck && this.query.prop !== 'reject' && this.query.type === 'client' && !this.query.hasOwnProperty('tasksIds')"
          @clicked="makeAction"
        )

</template>

<script>
	import CheckBox from "../CheckBox"
	import Button from "../Button"
	import currencyIconDetected from "../../mixins/currencyIconDetected"
	import moment from 'moment'

	export default {
		mixins: [ currencyIconDetected ],
		name: "QuoteDecision",
		data() {
			return {
				isCheck: false,
				query: {},
				dataToDisplay: '',
				mandatoryKeys: [ 't', 'projectId', 'from' ],
				lengthThinkingTime: 0
			}
		},
		methods: {
			calculateNewDeadline(deadline) {
				this.lengthThinkingTime = +new Date().getTime() - +this.query.from
				return moment(new Date(deadline).getTime() + this.lengthThinkingTime).format('LLL')
			},
			getVendorDateFormat(deadline) {
				return moment(deadline).format('DD-MM-YYYY, HH:mm')
			},
			getClientDateFormat(deadline) {
				return moment(deadline).format('LLL')
			},
			toggleCheck() {
				this.isCheck = !this.isCheck
			},
			async makeAction() {
				let code = 0
				const { t, projectId, from, prop, tasksIds, stepId, vendorId } = this.query

				if (this.query.type === 'client') {
					const { data } = this.query.hasOwnProperty('tasksIds')
							? await this.$http.get(`/quotesApi/client-decide-tasks?t=${ t }&projectId=${ projectId }&from=${ from }&prop=${ prop }&tasksIds=${ tasksIds }`)
							: await this.$http.get(`/quotesApi/client-decide?t=${ t }&projectId=${ projectId }&from=${ from }&prop=${ prop }&lengthThinkingTime=${ +this.lengthThinkingTime }`)

					code = data.code
				} else {
					const { data } = await this.$http.get(`/quotesApi/vendor-decide?projectId=${ projectId }&vendorId=${ vendorId }&stepId=${ stepId }&from=${ from }&t=${ t }&prop=${ prop }`)
					code = data.code
				}
        if(code === -5){
          window.location.href = 'https://vendor.pangea.global/dashboard'
          return
        }
				if (code > 0) window.location.href = `/quotesApi/get-error-message?code=${ code }`
				if (code < 0) window.location.href = `/quotesApi/get-success-message?code=${ code }`
			},
			async getClientFullData() {
				const { t, projectId } = this.query
				try {
					this.dataToDisplay = (await this.$http.get(`/quotesApi/client-data-to-display?t=${ t }&projectId=${ projectId }`)).data
				} catch (e) {
					window.location.href = '/quotesApi/get-error-message?code=1'
				}
			},
			async getClientTasksData() {
				const { t, projectId, tasksIds } = this.query
				try {
					this.dataToDisplay = (await this.$http.get(`/quotesApi/client-data-tasks-to-display?t=${ t }&projectId=${ projectId }&tasksIds=${ tasksIds }`)).data
				} catch (e) {
					window.location.href = '/quotesApi/get-error-message?code=2'
				}
			},
			async getVendorJobData() {
				const { t, projectId, stepId, vendorId } = this.query
				try {
					this.dataToDisplay = (await this.$http.get(`/quotesApi/vendor-data-to-display?t=${ t }&projectId=${ projectId }&vendorId=${ vendorId }&stepId=${ stepId }`)).data
				} catch (e) {
					window.location.href = '/quotesApi/get-error-message?code=9'
				}
			}
		},
		created() {
			const { query } = this.$route
			this.query = query

			this.mandatoryKeys.forEach(el => {
				if (!Object.keys(this.query).length || Object.keys(this.query).indexOf(el) === -1) window.location.href = '/quotesApi/get-error-message?code=12'
			})

			if (this.query.type === 'client') {
				this.query.hasOwnProperty('tasksIds') ? this.getClientTasksData() : this.getClientFullData()
			} else {
				this.getVendorJobData()
			}
		},
		components: { Button, CheckBox }
	}
</script>

<style lang="scss" scoped>
  @import '../../assets/scss/colors';

  .wrapper {
    margin: 50px;
    display: flex;
    justify-content: center;
  }

  .block {
    background: white;
    border-radius: 4px;
    width: 560px;
    box-shadow: $box-shadow;

    &__header {
      background-color: $table-list-hover;
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    &__button {
      display: flex;
      justify-content: center;
      margin-bottom: 25px;
    }

    &__checks {
      display: flex;
      justify-content: center;
      gap: 10px;
      height: 20px;
      align-items: center;
      margin-bottom: 20px;
      margin-top: 10px;
    }

    &__details {
      padding: 25px;

      &-data {
        border: 1px solid $border;
      }

      &-row {
        display: flex;
        border-bottom: 1px solid $light-border;
      }

      &-key {
        width: 30%;
        padding: 10px;
        display: flex;
        align-items: center;
      }

      &-value {
        width: 70%;
        display: flex;
        justify-content: end;
        padding: 10px;
        align-items: center;
      }

      &-title {
        font-size: 14px;
        text-align: center;
        font-family: 'Myriad900';
        margin-bottom: 25px;
        text-transform: uppercase;
      }

      &-title2 {
        margin-bottom: 4px;
      }
    }
  }

  .image {
    height: 60px;
  }

  .grey {
    background: $table-list;
  }
</style>