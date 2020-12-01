<template lang="pug">
  .project-finance
    .project-finance__title(@click="toggleFinance") Finance
      img.project-finance__icon(src="../../assets/images/open-close-arrow-brown.png" :class="{'project-finance_reverse': isFinanceShow}")
    .project-finance__content(v-if="true")
      .project-finance__content-displayBlock
        .finance-info__bars
          .bar
            .bar__green(:style="{width: barsStatistic.receivables.width}")
            .bar__amount &euro;&nbsp;{{barsStatistic.receivables.price}}
          .bar
            .bar__red(:style="{width: barsStatistic.payables.width }")
            .bar__amount &euro;&nbsp;{{barsStatistic.payables.price}}

        .project-finance__dashboard
          .project-finance__dashboardItem
            .project-finance__dashboardItem-title asdasd
            .project-finance__dashboardItem-value 23
          .project-finance__dashboardItem
            .project-finance__dashboardItem-title asdw3q3dd
            .project-finance__dashboardItem-value 67
          .project-finance__dashboardItem
            .project-finance__dashboardItem-title ergtdfg
            .project-finance__dashboardItem-value 987

      .project-finance__content-settingBlock

        .minPrice
          .minPrice-item
            .minPrice-item__title Receivables Rates:
            .minPrice-item__input 4545
          .minPrice-item
            .minPrice-item__title Minimum Charge:
            .minPrice-item__input
              //.ratio__input
                input(v-if="ratesParamsIsEdit" type="number" v-model="minPrice" v-on:keyup.enter="updateMinPrice" :value="minPrice" )
                span(v-else) {{ minPrice }}
                span.ratio__input-symbol(v-html="getSymbol(currentClient.currency)")
        .discounts
          Discounts(
            :paramsIsEdit="true"
            :enum="'PngSysProject'"
          )

      .project-finance__total
        .project-finance__total-title Total:
        .project-finance__total-value 345234 &nbsp;&euro;

      //.project-finance__add-row
        Add(@add="addRow")
</template>

<script>
	import DataTable from "../DataTable";
	import Add from "../Add";
	import { mapGetters, mapActions } from "vuex";
	import SelectSingle from "../SelectSingle";
	import Discounts from "../clients/pricelists/Discounts";

	export default {
		props: {},
		data() {
			return {
				isFinanceShow: false,
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				addFinanceProperty: "addFinanceProperty"
			}),
			// addRow() {
			// 	this.addFinanceProperty({ receivables: "", payables: "" });
			// },
			toggleFinance() {
				this.isFinanceShow = !this.isFinanceShow;
			},
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject"
			}),
			barsStatistic() {
				if(this.currentProject) {
					const { finance } = this.currentProject;
					const { Price } = finance;
					const payblesPercents = Math.ceil((Price.payables / Price.receivables) * 100);

					return {
						receivables: {
							width: Price.receivables === 0 ? '0%' : '100%',
							price: Price.receivables,
						},
						payables: {
							width: `${ payblesPercents }%`,
							price: Price.payables
						}
					}
				}
			},
			financeData() {
				// const finance = { ...this.currentProject.finance };
				// let result = Object.keys(finance).map(key => {
				// 	let margin = (finance[key].receivables - finance[key].payables).toFixed(2);
				// 	return {
				// 		title: key,
				// 		receivables: finance[key].receivables,
				// 		payables: finance[key].payables,
				// 		margin: margin
				// 	}
				// })
				// return result;
			}
		},
		components: {
			Discounts,
			DataTable,
			SelectSingle,
			Add
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .minPrice {
    display: flex;
    padding: 16px 30px;
    background: #f4f0ee;
    border: 2px solid #938676;
    flex-direction: column;

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
      }

      &-settingBlock {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }
    }

    &__total {
      padding-top: 20px;
      border-top: 2px solid #c7c0b7;
      display: flex;

      &-title {
        width: 100px;
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
      border: 2px solid;
      border-radius: 10px;
      align-items: center;
      margin-bottom: 20px;
    }

    &__dashboardItem {
      width: 33%;
      display: flex;
      justify-content: center;
      border-left: 2px solid;
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
</style>
