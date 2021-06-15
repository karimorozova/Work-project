<template lang="pug">
  .project-finance
    //.project-finance__title(@click="toggleFinance") Finance
      //img.project-finance__icon(src="../../assets/images/open-close-arrow-brown.png" :class="{'project-finance_reverse': isFinanceShow}")
    //.project-finance__content(v-if="isFinanceShow")

    .project-finance__header
      .project-finance__titleFinance Finance
      .actionsButton(v-if="!isProjectFinished")
        .actionsButton__icon
          img.defaultIcon(v-if="!paramsIsEdit" :src="icons.edit.icon" @click="crudActions('edit')")
          img.opacity(v-else :src="icons.edit.icon")
        .actionsButton__icon
          img.defaultIcon(v-if="paramsIsEdit" :src="icons.cancel.icon" @click="crudActions('cancel')")
          img.opacity(v-else :src="icons.cancel.icon")

    .project-finance__details
      .project-finance__empty(v-if="!currentProject.tasks.length")
        span No information available.
      .project-finance__noEmpty(v-else)
        .project-finance__content-displayBlock
          .finance-info__bars
            .bar
              .bar__green(:style="{ width: barsStatistic.receivables.width }")
              .bar__amount
                span(v-html="returnIconCurrencyByStringCode(currentProject.customer.currency)")
                span {{barsStatistic.receivables.price}}
            .bar
              .bar__red(:style="{ width: barsStatistic.payables.width }")
              .bar__amount
                span(v-html="returnIconCurrencyByStringCode(currentProject.customer.currency)")
                span {{barsStatistic.payables.price}}
          .project-finance__dashboard
            .project-finance__dashboardItem
              .project-finance__dashboardItem-title Profit:
              .project-finance__dashboardItem-value {{financeData.profit}}
                span(v-html="returnIconCurrencyByStringCode(currentProject.customer.currency)")
            .project-finance__dashboardItem
              .project-finance__dashboardItem-title Margin:
              .project-finance__dashboardItem-value {{financeData.margin}} %
            .project-finance__dashboardItem
              .project-finance__dashboardItem-title ROI:
              .project-finance__dashboardItem-value {{currentProject.roi || '-' }}

        .project-finance__content-settingBlock
          div
            .minPrice
              .minPrice-item
                .minPrice-item__title Receivables Rates:
                .minPrice-item__input {{ getStartedReceivables }}
              .minPrice-item__forIgnore
                .minPrice-item
                  .minPrice-item__title Minimum Charge:
                  .minPrice-item__input
                    .ratio__input
                      input(v-if="paramsIsEdit" type="number" ref="minPrice" :value="currentProject.minimumCharge.value" @change="(e) => updateMinPrice('value', e)")
                      span(v-else) {{ currentProject.minimumCharge.value }}
                      span.ratio__input-symbol(v-html="returnIconCurrencyByStringCode(currentProject.customer.currency)")
                .minPrice-item-check
                  .minPrice-item-check__title Ignore:
                  .rates-item__checkbox
                    .checkbox
                      input(type="checkbox" id="ignoreMinPrice" :checked="currentProject.minimumCharge.toIgnore" @change="(e) => updateMinPrice('bool', e)")
                      label.labelDisabled(v-if="!paramsIsEdit" for="ignoreMinPrice" :style="checkboxStyle")
                      label(v-else for="ignoreMinPrice")

          .discounts
            Discounts(
              :paramsIsEdit="paramsIsEdit"
              :enum="'PngSysProject'"
            )

        .project-finance__total
          .project-finance__total-title Total:
          .project-finance__total-value
            span {{ detectedFinalPrice }}
            span(v-html="returnIconCurrencyByStringCode(currentProject.customer.currency)")

</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import Discounts from "../clients/pricelists/Discounts"
	import currencyIconDetected from "../../mixins/currencyIconDetected"

	export default {
		mixins: [currencyIconDetected],
		props: {},
		data() {
			return {
				icons: {
					edit: { icon: require("../../assets/images/Other/edit-icon-qa.png") },
					cancel: { icon: require("../../assets/images/cancel-icon.png") }
				},
				isFinanceShow: true,
				paramsIsEdit: false,
				checkboxStyle: { 'pointer-events': 'none', 'filter': 'opacity(0.4)' }
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				addFinanceProperty: "addFinanceProperty",
				setCurrentProject: "setCurrentProject"
			}),
			crudActions(actionType) {
				switch (actionType) {
					case 'cancel':
						this.paramsIsEdit = false
						break
					case 'edit':
						this.paramsIsEdit = true
						break
				}
			},
			toggleFinance() {
				this.isFinanceShow = !this.isFinanceShow
			},
			async updateMinPrice(prop, e) {
				try {
					const result = await this.$http.post('/pm-manage/update-minimum-charge', {
						_id: this.currentProject._id,
						value: (+this.$refs.minPrice.value).toFixed(2) || 0,
						toIgnore: prop === 'value' ? this.currentProject.minimumCharge.toIgnore : e.target.checked
					})
					this.setCurrentProject(result.data)
					this.alertToggle({ message: "Minimum Price saved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: 'Project minimum price is not updated!', isShow: true, type: 'error' })
				}
			},
			detectedHigherMinPrice() {
				if (this.currentProject.hasOwnProperty('minimumCharge') &&
						this.currentProject.minimumCharge.value > this.currentProject.finance.Price.receivables &&
						!this.currentProject.minimumCharge.toIgnore
				) {
					return +this.currentProject.minimumCharge.value
				} else {
					return +this.currentProject.finance.Price.receivables
				}
			}
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject"
			}),
			detectedFinalPrice() {
				const { minimumCharge, finance } = this.currentProject
				return minimumCharge.value > finance.Price.receivables && !minimumCharge.toIgnore ?
						+minimumCharge.value :
						parseFloat(finance.Price.receivables).toFixed(2)
			},
			getStartedReceivables() {
				if (this.currentProject) {
					return this.currentProject.steps.reduce((acc, curr) => acc + curr.defaultStepPrice, 0).toFixed(2)
				}
			},
			barsStatistic() {
				if (this.currentProject) {
					const { finance } = this.currentProject
					const { Price } = finance
					let payblesPercents
					let receivablesPercents
					let basePrice = this.detectedHigherMinPrice()

					if (basePrice >= Price.payables) {
						payblesPercents = Math.ceil((Price.payables / basePrice) * 100)
						receivablesPercents = basePrice === 0 ? '0' : '100'
					} else {
						receivablesPercents = Math.ceil((basePrice / Price.payables) * 100)
						payblesPercents = +Price.payables === 0 ? '0' : '100'
					}

					return {
						receivables: {
							width: `${ receivablesPercents }%`,
							price: parseFloat(basePrice).toFixed(2)
						},
						payables: {
							width: `${ payblesPercents }%`,
							price: parseFloat(Price.payables).toFixed(2)
						}
					}
				}
			},
			financeData() {
				const finance = { ...this.currentProject.finance }
				const { Price } = finance
				let basePrice = this.detectedHigherMinPrice()
				return {
					profit: (basePrice - Price.payables).toFixed(2),
					margin: ((1 - (Price.payables / basePrice)) * 100).toFixed(2)
				}
			},
			isProjectFinished(){
				const { status } = this.currentProject
				return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
			},
		},
		components: {
			Discounts
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .actionsButton {
    display: flex;

    &__icon {
      margin-left: 5px;
    }
  }

  .defaultIcon {
    cursor: pointer;
  }

  .opacity {
    opacity: .4;
    cursor: default;
  }

  .minPrice {
    display: flex;
    padding: 5px 5px 2px 5px;
    background: #f4f2f1;
    border: 2px solid #938676;
    flex-direction: column;
    margin-bottom: 20px;

    .minPrice-item-check {
      min-height: 30px;
      display: flex;
      padding-right: 10px;
      align-items: center;

      &__title {
        width: 60px;
      }
    }

    .minPrice-item {
      width: 250px;
      min-height: 30px;
      display: flex;
      align-items: center;

      &__forIgnore {
        display: flex;
      }

      &__title {
        width: 150px;
      }
    }
  }

  .project-finance {
    box-sizing: border-box;
    width: 400px;
    margin-top: 40px;
    padding: 20px;
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;

    &__titleFinance{
      font-size: 21px;
      font-family: Myriad600;
    }
    &__header{
      margin-bottom: 20px;
      border-bottom: 1px solid #c5bfb5;
      width: 100%;
      padding-bottom: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__details {
      //padding: 0 20px 20px 20px;

      &-displayBlock {
        position: relative;
      }

      &-settingBlock {
        margin-bottom: 20px;
      }
    }

    &__total {
      padding-top: 20px;
      border-top: 1px solid #C5BFB5;
      display: flex;
      font-family: Myriad900;
      margin-top: 10px;

      &-title {
        width: 60px;
      }
    }

    &__title {
      padding: 20px;
      font-size: 21px;
      display: flex;
      font-family: Myriad600;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
    }

    &__icon {
      transition: all 0.1s;
    }

    &_reverse {
      transform: rotate(180deg);
    }

    &__dashboard {
      display: flex;
      border: 1px solid #c1bbb1;
      border-radius: 4px;
      align-items: center;
      margin-bottom: 20px;
    }

    &__dashboardItem {
      width: 33%;
      display: flex;
      justify-content: center;
      border-left: 1px solid #66563d;
      padding: 6px 3px;

      &:first-child {
        border-left: none;
      }

      &-title {
        min-width: 10%;
      }

      &-value {
        min-width: 10%;
        margin-left: 6px;

      }
    }
  }

  .bar {
    display: flex;
    height: 16px;
    align-items: center;

    &__amount {
      margin-left: 5px;
    }

    &__green {
      background: #4CA553;
      height: 8px;
    }

    &__red {
      background: #D15F46;
      height: 8px;
    }
  }

  .finance-info {
    position: relative;

    &__bars {
      margin-bottom: 20px;
    }
  }

  .checkbox {
    display: flex;
    height: 20px;
    margin-top: -3px;

    input[type="checkbox"] {
      opacity: 0;
      width: 0px;

      + {
        label {
          &::after {
            content: none;
          }
        }
      }

      &:checked {
        + {
          label {
            &::after {
              content: "";
            }
          }
        }
      }
    }

    label {
      position: relative;
      display: inline-block;

      &::before {
        position: absolute;
        content: "";
        display: inline-block;
        height: 16px;
        width: 16px;
        border: 1px solid;
        left: 0px;
        top: 3px;
        background: white;
      }

      &::after {
        position: absolute;
        content: "";
        display: inline-block;
        height: 5px;
        width: 9px;
        border-left: 2px solid;
        border-bottom: 2px solid;
        transform: rotate(-45deg);
        left: 4px;
        top: 7px;
      }
    }
  }

  input {
    color: #66563d;
    height: 22px;
    border-radius: 4px;
    width: 70px;
    border: 1px solid #c1bbb1;
  }

  input {
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  input:focus {
    outline: none;
  }
</style>
