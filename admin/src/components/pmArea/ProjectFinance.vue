<template lang="pug">
  .project-finance
    .project-finance__title(@click="toggleFinance") Finance
      img.project-finance__icon(src="../../assets/images/open-close-arrow-brown.png" :class="{'project-finance_reverse': isFinanceShow}")
    .project-finance__content(v-if="isFinanceShow")

      .project-finance__content-displayBlock
        .actionsButton
          .actionsButton__icon
            img.defaultIcon(v-if="!paramsIsEdit" :src="icons.edit.icon" @click="crudActions('edit')")
            img.opacity(v-else :src="icons.edit.icon")
          .actionsButton__icon
            img.defaultIcon(v-if="paramsIsEdit" :src="icons.cancel.icon" @click="crudActions('cancel')")
            img.opacity(v-else :src="icons.cancel.icon")
        .finance-info__bars
          .bar
            .bar__green(:style="{ width: barsStatistic.receivables.width }")
            .bar__amount &euro;&nbsp;{{barsStatistic.receivables.price}}
          .bar
            .bar__red(:style="{ width: barsStatistic.payables.width }")
            .bar__amount &euro;&nbsp;{{barsStatistic.payables.price}}
        .project-finance__dashboard
          .project-finance__dashboardItem
            .project-finance__dashboardItem-title Profit:
            .project-finance__dashboardItem-value {{financeData.profit}}
              span(v-html="getSymbol(currentProject.customer.currency)")
          .project-finance__dashboardItem
            .project-finance__dashboardItem-title Margin:
            .project-finance__dashboardItem-value {{financeData.margin}} %
          .project-finance__dashboardItem
            .project-finance__dashboardItem-title ROI:
            .project-finance__dashboardItem-value ?? %

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
                  input(v-if="paramsIsEdit" type="number" ref="minPrice" :value="currentProject.minimumCharge.value" v-on:keyup.enter="updateMinPrice")
                  span(v-else) {{ currentProject.minimumCharge.value }}
                  span.ratio__input-symbol(v-html="getSymbol(currentProject.customer.currency)")
            .minPrice-item
              .minPrice-item__title Ignore Min. Charge:
              .rates-item__checkbox
                .checkbox
                  input(type="checkbox" id="ignoreMinPrice" :checked="currentProject.minimumCharge.toIgnore" @change="updateMinPrice")
                  label.labelDisabled(v-if="!paramsIsEdit" for="ignoreMinPrice" :style="checkboxStyle")
                  label(v-else for="ignoreMinPrice")

        .discounts
          Discounts(
            :paramsIsEdit="paramsIsEdit"
            :enum="'PngSysProject'"
          )

      .project-finance__total
        .project-finance__total-title Total:
        .project-finance__total-value {{ (currentProject.finance.Price.receivables).toFixed(2) }} &nbsp;&euro;

</template>

<script>
	import { mapGetters, mapActions } from "vuex";
	import Discounts from "../clients/pricelists/Discounts";

	export default {
		props: {},
		data() {
			return {
				icons: {
					edit: { icon: require("../../assets/images/Other/edit-icon-qa.png") },
					cancel: { icon: require("../../assets/images/cancel-icon.png") },
				},
				isFinanceShow: false,
				paramsIsEdit: false,
				checkboxStyle: { 'pointer-events': 'none', 'filter': 'opacity(0.4)' },
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				addFinanceProperty: "addFinanceProperty"
			}),
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
			getSymbol(currency) {
				return currency === 'USD' ? '&nbsp;&#36;' : currency === 'EUR' ? '&nbsp;&euro;' : '&nbsp;&pound';
			},
			toggleFinance() {
				this.isFinanceShow = !this.isFinanceShow;
			},
			async updateMinPrice(e) {
				try {
					const result = await this.$http.post('/pm-manage/update-minimum-charge', {
						_id: this.currentProject._id,
						value: +this.$refs.minPrice.value || 0,
						toIgnore: e.target.checked,
					});
					console.log(result)
					// this.storeClientProperty({ prop: 'minPrice', value: this.$refs.minPrice.value });
					this.alertToggle({ message: "Minimum Price saved!", isShow: true, type: "success" });
				} catch (err) {
					this.alertToggle({ message: 'Project minimum price is not updated!', isShow: true, type: 'error' });
				}
			},
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject"
			}),
			getStartedReceivables() {
				return "??"
				// if(this.currentProject) {
				// 	const cost = this.currentProject.finance.Price.receivables;
				// 	const finalValue = this.currentProject.discounts.reduce((acc, curr) => {
				// 		acc = acc + curr.value;
				// 		return acc;
				// 	}, 0);
				// 	console.log(finalValue)
				// 	console.log()
				// 	const foo =  finalValue === 0 ?
				// 			cost :
				// 			finalValue > 0 ?
				// 					cost - (cost * (finalValue / 100)) :
				// 					cost + (cost * (finalValue / 100));
				// 	console.log(foo)
				//   return foo;
				// }
			},
			barsStatistic() {
				if(this.currentProject) {
					const { finance } = this.currentProject;
					const { Price } = finance;
					let payblesPercents;
					let receivablesPercents;

					if(Price.receivables >= Price.payables) {
						payblesPercents = Math.ceil((Price.payables / Price.receivables) * 100);
						receivablesPercents = Price.receivables === 0 ? '0' : '100'
					} else {
						receivablesPercents = Math.ceil((Price.receivables / Price.payables) * 100);
						payblesPercents = Price.payables === 0 ? '0' : '100'
					}

					return {
						receivables: {
							width: `${ receivablesPercents }%`,
							price: Price.receivables.toFixed(2),
						},
						payables: {
							width: `${ payblesPercents }%`,
							price: Price.payables.toFixed(2)
						}
					}
				}
			},
			financeData() {
				const finance = { ...this.currentProject.finance };
				const { Price } = finance;
				return {
					profit: (Price.receivables - Price.payables).toFixed(2),
					margin: ((1 - (Price.payables / Price.receivables)) * 100).toFixed(2)
				};
			}
		},
		components: {
			Discounts,
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

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
    background: #f4f0ee;
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
    box-shadow: 0 0 10px #67573e9d;
    margin: 40px;

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
      border-top: 2px solid #c7c0b7;
      display: flex;

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
      transition: all 0.2s;
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
