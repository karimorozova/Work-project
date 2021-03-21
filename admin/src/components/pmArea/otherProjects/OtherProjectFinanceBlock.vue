<template lang="pug">
  .project-finance
    .project-finance__title(@click="toggleFinance") Finance
      img.project-finance__icon(src="../../../assets/images/open-close-arrow-brown.png" :class="{'project-finance_reverse': isFinanceShow}")
    .project-finance__content(v-if="isFinanceShow")

      .project-finance__content-displayBlock
        .actionsButton(v-if="!project.lockedForRecalculation")
          .actionsButton__icon
            img.defaultIcon(v-if="!paramsIsEdit" :src="icons.edit.icon" @click="crudActions('edit')")
            img.opacity(v-else :src="icons.edit.icon")
          .actionsButton__icon
            img.defaultIcon(v-if="paramsIsEdit" :src="icons.cancel.icon" @click="crudActions('cancel')")
            img.opacity(v-else :src="icons.cancel.icon")
        .finance-info__bars
          .bar
            .bar__green(:style="{ width: barsStatistic.receivables.width }")
            .bar__amount
              span(v-html="returnIconCurrencyByStringCode(project.projectCurrency)")
              span {{barsStatistic.receivables.price}}
          .bar
            .bar__red(:style="{ width: barsStatistic.payables.width }")
            .bar__amount
              span(v-html="returnIconCurrencyByStringCode(project.projectCurrency)")
              span {{barsStatistic.payables.price}}

        .project-finance__dashboard
          .project-finance__dashboardItem
            .project-finance__dashboardItem-title Profit:
            .project-finance__dashboardItem-value {{financeData.profit}}
              span(v-if="project.hasOwnProperty('customer')" v-html="getSymbol(project.customer.currency)")
          .project-finance__dashboardItem
            .project-finance__dashboardItem-title Margin:
            .project-finance__dashboardItem-value {{financeData.margin}} %
          .project-finance__dashboardItem
            .project-finance__dashboardItem-title ROI:
            .project-finance__dashboardItem-value {{project.finance.roi || '-' }}

      .project-finance__content-settingBlock
        div
          .minPrice
            .minPrice-item
              .minPrice-item__title Receivables Rates:
              .minPrice-item__input {{ getStartedReceivables }}
            .minPrice-item
              .minPrice-item__title Minimum Charge:
              .minPrice-item__input
                .ratio__input
                  input(v-if="paramsIsEdit" type="number" ref="minPrice" :value="project.minimumCharge.value || 0" v-on:keyup.enter="(e) => updateMinPrice('value', e)")
                  span(v-else) {{ project.minimumCharge.value || 0 }}
                  span.ratio__input-symbol(v-if="project.hasOwnProperty('customer')" v-html="getSymbol(project.customer.currency)")
            .minPrice-item
              .minPrice-item__title Ignore Min. Charge:
              .rates-item__checkbox
                .checkbox
                  input(type="checkbox" id="ignoreMinPrice" :checked="project.minimumCharge.toIgnore || false" @change="(e) => updateMinPrice('bool', e)")
                  label.labelDisabled(v-if="!paramsIsEdit" for="ignoreMinPrice" :style="checkboxStyle")
                  label(v-else for="ignoreMinPrice")

        .discounts
          Discounts(
            :paramsIsEdit="paramsIsEdit"
            :enum="'XTRFProject'"
            @updateXTRFProject="updateXTRFProject"
          )
      .project-finance__total
        .project-finance__total-title Total:
        .project-finance__total-value
          span {{ detectedFinalPrice }}
          span(v-html="returnIconCurrencyByStringCode(project.projectCurrency)")

</template>

<script>
	import { mapActions } from 'vuex';
	import Discounts from "../../clients/pricelists/Discounts";
	import currencyIconDetected from "../../../mixins/currencyIconDetected"

	export default {
		mixins: [currencyIconDetected],
		props: {
			isUpdateProject: {
				type: Boolean,
			}
		},
		data() {
			return {
				icons: {
					edit: { icon: require("../../../assets/images/Other/edit-icon-qa.png") },
					cancel: { icon: require("../../../assets/images/cancel-icon.png") },
				},
				isFinanceShow: true,
				paramsIsEdit: false,
				project: {},
				checkboxStyle: { 'pointer-events': 'none', 'filter': 'opacity(0.4)' },
			}
		},
		methods: {
			...mapActions(['alertToggle']),
			toggleFinance() {
				this.isFinanceShow = !this.isFinanceShow;
			},
			crudActions(actionType) {
				switch (actionType) {
					case 'cancel':
						this.paramsIsEdit = false;
						break;
					case 'edit':
						this.paramsIsEdit = true;
						break;
				}
			},
			async getProject() {
				try {
					const result = await this.$http.get(`/memoqapi/other-project?id=${ this.$route.params.id }`);
					this.project = result.data;
				} catch (err) {
				}
			},
			getSymbol(currency) {
				return currency === 'USD' ? '&nbsp;&#36;' : currency === 'EUR' ? '&nbsp;&euro;' : '&nbsp;&pound';
			},
			async updateMinPrice(prop, e) {
				try {
					const result = await this.$http.post('/memoqapi/update-minimum-charge', {
						_id: this.project._id,
						value: (+this.$refs.minPrice.value).toFixed(2) || 0,
						toIgnore: prop === 'value' ? this.project.minimumCharge.toIgnore : e.target.checked,
					});
					this.project = result.data;
					this.alertToggle({ message: "Minimum Price saved!", isShow: true, type: "success" });
				} catch (err) {
					this.alertToggle({ message: 'Project minimum price is not updated!', isShow: true, type: 'error' });
				}
			},
			detectedHigherMinPrice() {
				if(this.project.hasOwnProperty('minimumCharge') &&
						+this.project.minimumCharge.value > +this.project.finance.Price.receivables &&
						!this.project.minimumCharge.toIgnore
				) {
					return +this.project.minimumCharge.value;
				} else {
					return +this.project.finance.Price.receivables;
				}
			},
			updateXTRFProject(data) {
				this.project = data;
				this.$emit('updateXTRFProject', data);
			}
		},
		watch: {
			isUpdateProject(newValue) {
				newValue && this.getProject()
			},
		},
		created() {
			this.getProject()
		},
		computed: {
			barsStatistic() {
				if(this.project) {
					const { finance } = this.project;
					const { Price } = finance;
					let payblesPercents;
					let receivablesPercents;
					let basePrice = this.detectedHigherMinPrice();

					if(basePrice >= +Price.payables) {
						payblesPercents = Math.ceil((+Price.payables / basePrice) * 100);
						receivablesPercents = basePrice === 0 ? '0' : '100'
					} else {
						receivablesPercents = Math.ceil((basePrice / +Price.payables) * 100);
						payblesPercents = +Price.payables === 0 ? '0' : '100'
					}

					return {
						receivables: {
							width: `${ receivablesPercents }%`,
							price: basePrice.toFixed(2)
						},
						payables: {
							width: `${ payblesPercents }%`,
							price: parseFloat(Price.payables).toFixed(2)
						}
					}
				}
			},
			financeData() {
				const finance = { ...this.project.finance };
				const { Price } = finance;
				let basePrice = this.detectedHigherMinPrice();

				return {
					profit: (basePrice - +Price.payables).toFixed(2),
					margin: ((1 - (+Price.payables / basePrice)) * 100).toFixed(2)
				};
			},
			getStartedReceivables() {
				if(this.project) {
					return this.project.steps.reduce((acc, curr) => acc + +curr.finance.priceReceivables, 0).toFixed(2)
				}
			},
			detectedFinalPrice() {
				if(this.project.finance && this.project.minimumCharge) {
					const { minimumCharge, finance } = this.project;
					return minimumCharge.value > finance.Price.receivables && !minimumCharge.toIgnore ?
							+minimumCharge.value :
							+parseFloat(finance.Price.receivables).toFixed(2);
				} else {
					return '-'
				}
			},
		},
		components: { Discounts },
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .actionsButton {
    display: flex;
    position: absolute;
    right: -195px;

    &__icon {
      margin-left: 5px;
    }
  }

  .defaultIcon {
    cursor: pointer;
  }

  .opacity {
    opacity: .5;
    cursor: default;
  }

  .minPrice {
    display: flex;
    padding: 16px 30px;
    background: #F2EFEB;
    border: 2px solid #938676;
    flex-direction: column;
    margin-right: 40px;

    .minPrice-item {
      width: 300px;
      min-height: 30px;
      display: flex;
      align-items: center;

      &__title {
        width: 150px;
      }
    }
  }

  .project-finance {
    box-sizing: border-box;
    min-width: 1000px;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    margin: 40px;

    &_reverse {
      transform: rotate(180deg);
    }

    &__content {
      padding: 0 20px 20px 20px;

      &-displayBlock {
        width: 80%;
        position: relative;
      }

      &-settingBlock {
        display: flex;
        margin-bottom: 20px;
      }
    }

    &__total {
      padding-top: 20px;
      border-top: 2px solid #C5BFB5;
      display: flex;
      font-family: Myriad900;

      &-title {
        width: 60px;
      }
    }

    &__title {
      padding: 20px;
      font-size: 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
    }

    &__icon {
      transition: all 0.1s;
    }

    &__dashboard {
      display: flex;
      border: 2px solid #938676;
      border-radius: 8px;
      align-items: center;
      margin-bottom: 20px;
    }

    &__dashboardItem {
      width: 33%;
      display: flex;
      justify-content: center;
      border-left: 2px solid #938676;
      padding: 6.5px;

      &:first-child {
        border-left: none;
      }

      &-title {
        min-width: 10%;
      }

      &-value {
        min-width: 10%;
        margin-left: 10px;

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
    color: #67573e;
    height: 22px;
    border-radius: 5px;
    width: 70px;
    border: 1px solid #67573e;
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