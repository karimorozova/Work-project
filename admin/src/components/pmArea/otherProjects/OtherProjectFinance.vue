<template lang="pug">
  .project-finance
    .project-finance__title(@click="toggleFinance") Finance
      img.project-finance__icon(src="../../../assets/images/open-close-arrow-brown.png" :class="{'project-finance_reverse': isFinanceShow}")

    .wordcount(v-if="isFinanceShow")
      .wordcount__title Total Word Count:
      .wordcount__value {{ project.totalWordCount }}
    .project-finance__table(v-if="isFinanceShow")
      DataTable(
        :fields="fields"
        :tableData="financeData"
        bodyRowClass="steps-table-row"
        bodyClass="tbody_visible-overflow"
        tableheadRowClass="tbody_visible-overflow"
      )
        template(slot="headerTitle" slot-scope="{ field }")
        template(slot="headerReceivables" slot-scope="{ field }")
          span.project-finance__label {{ field.label }}
        template(slot="headerPayables" slot-scope="{ field }")
          span.project-finance__label {{ field.label }}
        template(slot="headerMargin" slot-scope="{ field }")
          span.project-finance__label {{ field.label }}
        template(slot="headerRoi" slot-scope="{ field }")
          span.project-finance__label {{ field.label }}

        template(slot="title" slot-scope="{ row }")
          .project-finance__data-title {{ row.title }}

        template(slot="receivables" slot-scope="{ row }")
          span.project-finance__data &euro; {{ row.receivables }}

        template(slot="payables" slot-scope="{ row }")
          span.project-finance__data &euro; {{ row.payables }}

        template(slot="margin" slot-scope="{ row }")
          span.project-finance__data &euro; {{ row.margin }}

        template(slot="roi" slot-scope="{ row }")
          span.project-finance__data {{ row.roi }}


</template>

<script>
	import DataTable from "../../DataTable";
	import Add from "../../Add";
	import SelectSingle from "../../SelectSingle";

	export default {
		props: {
			project: {
				type: Object,
			}
		},
		data() {
			return {
				isFinanceShow: false,
				fields: [
					{ label: "Title", headerKey: "headerTitle", key: "title", width: "20%", cellClass: "project-finance_no-padding" },
					{ label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "20%" },
					{ label: "Payables", headerKey: "headerPayables", key: "payables", width: "20%" },
					{ label: "Margin", headerKey: "headerMargin", key: "margin", width: "20%" },
					{ label: "ROI", headerKey: "headerRoi", key: "roi", width: "20%" },
				],
				additionalValue: 5
			}
		},
		methods: {
			toggleFinance() {
				this.isFinanceShow = !this.isFinanceShow;
			},
			showEuroSign(data) {
				return data.title !== 'Wordcount';
			}
		},
		computed: {
			financeData() {
				if(this.project) {
					const { finance } = this.project;
					const { Price, profit, ROI } = finance;
					const { receivables, payables } = Price
					return [{
						title: 'Price',
						receivables,
						payables,
						margin: profit,
						roi: ROI,
					}]
				}
			}
		},
		components: {
			DataTable,
			SelectSingle,
			Add
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";
  .wordcount{
    display: flex;
    padding: 0 20px 10px;
    font-size: 16px;
    &__value{
      margin-left: 10px;
      font-weight: bold;
    }
  }
  .project-finance {
    box-sizing: border-box;
    min-width: 1000px;
    box-shadow: 0 0 10px #67573e9d;
    margin: 40px;

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

    &_reverse {
      transform: rotate(180deg);
    }

    &__table {
      padding: 0 20px 20px 20px;
    }

    &__drop-menu {
      position: relative;
      height: 26px;
      top: 0;
    }

    &__percent-value {
      outline: 1px solid $blue-outline;
      border: none;
      padding-left: 5px;
      width: 24px;
      margin-right: 3px;
      color: $main-color;

      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    &__data-title {
      padding: 7px 6px;
    }
  }
</style>
