<template lang="pug">
  .finance-info
    .finance-info__row
      .finance-info__table
        .finance-info__bars
          .bar
            .bar__green(:style="{width: barsStatistic.receivables.width}")
            .bar__amount &euro;&nbsp;{{barsStatistic.receivables.price}}
          .bar
            .bar__red(:style="{width: barsStatistic.payables.width }")
            .bar__amount &euro;&nbsp;{{barsStatistic.payables.price}}

        DetailsTranslation(
          v-if="getUnitTypeByUnitId === 'CAT Wordcount'"
          :financeData="financeDataTranslation"
          :step="step"
          :cancelSave="cancelSave"
          :selectedTab="selectedTab"
          @save="checkRateChange"
        )
        DetailsPackages(
          v-if="getUnitTypeByUnitId === 'Packages'"
          :financeData="financeDataPackages"
          :step="step"
          :cancelSave="cancelSave"
          :selectedTab="selectedTab"
          @save="checkRateChange"
        )
        DetailsHours(
          v-if="getUnitTypeByUnitId !== 'CAT Wordcount' && getUnitTypeByUnitId !== 'Packages'"
          :financeData="financeDataHours"
          :step="step"
          :cancelSave="cancelSave"
          :selectedTab="selectedTab"
          @save="checkRateChange"
        )
      .finance-info__result
        Results(:step="step" :profitAndMargin="profitAndMargin")

    .finance-info__modal(v-if="isModal")
      ApproveModal(
        :text="'Are you sure you wish to change the default ' + rateOwner + ' rate'"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approveAction"
        @notApprove="noSave"
        @close="noSave"
      )

    .finance-info__tabs(v-if="getUnitTypeByUnitId === 'CAT Wordcount'")
      Tabs(:tabs="tabs" :selectedTab="selectedTab" @setTab="setTab")
    TableMatrix(v-if="getUnitTypeByUnitId === 'CAT Wordcount'", :step="step" :selectedTab="selectedTab")

</template>

<script>
	import ValidationErrors from "../../../ValidationErrors";
	import ApproveModal from "../../../ApproveModal";
	import Tabs from "@/components/Tabs";
	import DetailsTranslation from "./DetailsTranslation";
	import DetailsHours from "./DetailsHours";
	import DetailsPackages from "./DetailsPackages";
	import {mapActions} from "vuex";
	import TableMatrix from "./TableMatrix"
	import Results from "./Results";

	export default {
		props: {
			step: {
				type: Object
			},
			originallyUnits: {
				type: Array
			}
		},
		data() {
			return {
				tabs: ["Receivables", "Payables"],
				selectedTab: "Receivables",
				icons: {
					save: {
						icon: require("../../../../assets/images/Other/save-icon-qa-form.png"),
					},
					edit: {
						icon: require("../../../../assets/images/Other/edit-icon-qa.png"),
					},
				},
				errors: [],
				areErrorsExist: false,
				isModal: false,
				changedData: "",
				cancelSave: false,
			};
		},
		methods: {
			...mapActions({
				updateStepFinance: "updateStepFinance",
				updateClientRate: "updateClientRate",
				updateVendorRate: "updateVendorRate",
				alertToggle: "alertToggle",
			}),
			setTab({index}) {
				if (!this.step.vendor && index === 1) return;
				this.selectedTab = this.tabs[index];
			},
			closeErrorsBlock() {
				this.areErrorsExist = false;
				this.errors = [];
			},
			async checkRateChange(data) {
				this.changedData = data;
				this.isModal = true;
			},
			noSave() {
				this.isModal = false;
				this.cancelSave = true;
				setTimeout(() => {
					this.cancelSave = false;
				}, 500)
			},
			async approveAction() {
				await this.save();
			},
			async save() {
				const {receivables, payables} = this.changedData;
				let changedStep = {};

				const clientRate = {
					value: +receivables.rate,
				};
				const vendorRate = {
					value: +payables.rate,
				};

				if (this.getUnitTypeByUnitId === 'CAT Wordcount') {
					const Wordcount = {
						receivables: +receivables.quantityRelative,
						payables: +payables.quantityRelative,
					};
					const totalWords = +receivables.quantityTotal;
					const quantity = +payables.quantityTotal;
					changedStep = {
						...this.step,
						finance: {Wordcount},
						clientRate,
						vendorRate,
						totalWords,
						quantity,
					};
				} else if (this.getUnitTypeByUnitId === 'Packages') {
					const quantity = this.changedData.quantityTotal;
					changedStep = {
						...this.step,
						clientRate,
						vendorRate,
						quantity,
					};
				} else {
					const hours = this.changedData.quantityTotal;
					changedStep = {
						...this.step,
						clientRate,
						vendorRate,
						hours,
					};
				}
				try {
					await this.updateStepFinance(changedStep);
					this.alertToggle({
						message: "Step finance saved!",
						isShow: true,
						type: "success"
					});
				} catch (err) {
					this.alertToggle({
						message: "Server error / Cannot update step finance!",
						isShow: true,
						type: "error"
					});
				} finally {
					this.isModal = false;
				}
			},
		},
		computed: {
			getUnitTypeByUnitId() {
				return this.originallyUnits
					.find(unit => unit._id.toString() === this.step.serviceStep.unit).type;
			},

			barsStatistic() {
				const {finance} = this.step;
				const {Price} = finance;
				const payblesPercents = Math.ceil((Price.payables / Price.receivables) * 100)

				return {
					receivables: {
						width: '100%',
						price: Price.receivables,
					},
					payables: {
						width: `${payblesPercents}%`,
						price: Price.payables
					}
				}
			},

			profitAndMargin() {
				const {finance} = this.step;
				const {Price} = finance;

				let result = {profit: 0, margin: 0, roi: 0};
				result.profit = (Price.receivables - Price.payables).toFixed(2);
				result.margin = ((1 - (Price.payables / Price.receivables)) * 100).toFixed(2);
				result.roi = ((Price.receivables - Price.payables) / Price.payables).toFixed(2);

				return result;
			},

			financeDataTranslation() {
				const {clientRate, finance, status, totalWords, vendorRate, quantity, vendor} = this.step
				const {Wordcount, Price} = finance
				return {
					stepStatus: status,
					vendor,
					receivables: {
						rate: clientRate.value,
						quantityRelative: Wordcount.receivables,
						quantityTotal: totalWords,
						total: Price.receivables,
					},
					payables: {
						rate: vendorRate.value,
						quantityRelative: Wordcount.payables,
						quantityTotal: quantity || 0,
						total: Price.payables
					}
				}
			},
			financeDataPackages() {
				const {clientRate, finance, status, vendorRate, quantity, vendor} = this.step
				const {Price} = finance
				return {
					title: "Quantity",
					stepStatus: status,
					vendor,
					quantityTotal: quantity,
					receivables: {
						rate: clientRate.value,
						total: Price.receivables,
					},
					payables: {
						rate: vendorRate.value,
						total: Price.payables
					},
				}
			},
			financeDataHours() {
				const currentUnit = this.originallyUnits.find(unit => unit._id.toString() === this.step.serviceStep.unit).type;
				const {clientRate, finance, status, vendorRate, hours, vendor} = this.step
				const {Price} = finance
				return {
					title: currentUnit === "Hours" ? "Hours" : currentUnit,
					stepStatus: status,
					vendor,
					quantityTotal: hours,
					receivables: {
						rate: clientRate.value,
						total: Price.receivables,
					},
					payables: {
						rate: vendorRate.value,
						total: Price.payables
					},
				}
			},
			rateOwner() {
				return this.selectedTab === "Receivables" ? "Client's" : "Vendor's";
			},
		},
		watch: {
			step: function (val) {
				if (!val.vendor) {
					this.setTab({index: 0});
				}
			},
		},
		components: {
			Results,
			ValidationErrors,
			ApproveModal,
			Tabs,
			DetailsTranslation,
			TableMatrix,
			DetailsHours,
			DetailsPackages
		},
	};
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors";

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
      margin: 15px 0;
    }

    &__row {
      display: flex;
    }

    &__table {
      width: 100%;
      margin-right: 20px;
    }

    &__modal {
      position: absolute;
      transform: translate(50%, -200%);
    }

    &__tabs {
      margin-top: 25px;
    }
  }

</style>
