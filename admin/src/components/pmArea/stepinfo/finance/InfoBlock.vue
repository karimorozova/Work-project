<template lang="pug">
  .finance-info
    .finance-info__tabs
      Tabs(:tabs="tabs" :selectedTab="selectedTab" @setTab="setTab")
    Details(:financeData="financeData" :selectedTab="selectedTab" @save="checkRateChange")
    .finance-info__modal(v-if="isModal")
      ApproveModal(
        :text="'Do you want to save rate in ' + rateOwner + ' language combinations?'"
        approveValue="Yes"
        notApproveValue="No"
        @approve="approveAction"
        @notApprove="save"
        @close="save"
      )
</template>

<script>
	import ValidationErrors from "../../../ValidationErrors";
	import ApproveModal from "../../../ApproveModal";
	import Tabs from "@/components/Tabs";
	// import LabelVal from "@/components/LabelVal";
	import Details from "./Details";
	import {mapActions} from "vuex";

	export default {
		props: {
			step: {type: Object},
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

				// const {rate} = data;
				// const {clientRate, vendorRate} = this.step;
				// if (
				// 	(this.selectedTab === "Receivables" && rate !== clientRate) ||
				// 	(this.selectedTab === "Payables" && rate !== vendorRate)
				// ) {
				// 	this.isModal = true;
				// 	this.changedData = data;
				// } else {
				// 	await this.save();
				// }
			},
			async approveAction() {
				await this.save();

				// const {rateValue, minimum} = this.changedData;
				// if (this.selectedTab === "Receivables") {
				// 	return await this.updateClientRate({
				// 		step: this.step,
				// 		rate: {...this.step.clientRate, value: +rateValue, min: +minimum},
				// 	});
				// }
				// if (this.step.vendor) {
				// 	return await this.updateVendorRate({
				// 		step: this.step,
				// 		rate: {...this.step.vendorRate, value: +rateValue, min: +minimum},
				// 	});
				// }
			},
			async save() {
				const Wordcount = {
					receivables: this.changedData.receivables.quantityRelative,
					payables: this.changedData.payables.quantityRelative,
				};
				const Price = {
					receivables: this.changedData.receivables.rate * this.changedData.receivables.quantityRelative,
					payables: this.changedData.payables.rate * this.changedData.payables.quantityRelative,
				};
				const clientRate = {
					value: this.changedData.receivables.rate,
				};
				const vendorRate = {
					value: this.changedData.payables.rate,
				};
				const totalWords = this.changedData.receivables.quantityTotal;
				const quantity = this.changedData.payables.quantityTotal;

				try {
					const changedStep = {
						...this.step,
						finance: {Price, Wordcount},
						clientRate,
						vendorRate,
						totalWords,
						quantity,
					};

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
			// collectData(data) {
			// 	const {quantityTotal, quantityRelative} = data;
			// 	const Wordcount = {
			// 		receivables: +quantityTotal,
			// 		payables: +quantityRelative,
			// 	};
			// 	return {Price: {...this.step.finance.Price}, Wordcount};
			// },
		},
		computed: {
			financeData() {
				return {
					receivables: {
						rate: this.step.clientRate.value,
						quantityRelative: this.step.finance.Wordcount.receivables,
						quantityTotal: this.step.totalWords,
						total: this.step.clientRate.value * this.step.finance.Wordcount.receivables,
					},
					payables: {
						rate: this.step.vendorRate.value,
						quantityRelative: this.step.finance.Wordcount.payables,
						quantityTotal: this.step.quantity || 0,
						total: this.step.vendorRate.value * this.step.finance.Wordcount.payables
					}
				}
				// 	const stepRate =
				// 		this.selectedTab === "Receivables"
				// 			? this.step.clientRate
				// 			: this.step.vendorRate;
				//
				//
				// 	const rateValue = stepRate ? stepRate.value : 0;
				// 	const rateMin = stepRate ? stepRate.min : 0;
				// 	const quantityRelative =
				// 		this.selectedTab === "Receivables"
				// 			? +this.step.finance.Wordcount.receivables
				// 			: this.step.finance.Wordcount.payables;
				//
				//
				// 	// const stepDiscount = this.selectedTab === "Receivables" ? this.step.clientDiscount : this.step.vendorDiscount;
				// 	let subtotal =
				// 		this.selectedTab === "Receivables"
				// 			? +this.step.finance.Price.receivables
				// 			: +this.step.finance.Price.payables;
				// 	if (this.step.finance.Price.halfReceivables >= 0) {
				// 		subtotal =
				// 			this.selectedTab === "Receivables"
				// 				? +this.step.finance.Price.halfReceivables
				// 				: +this.step.finance.Price.halfPayables;
				// 	}
				// 	return {
				// 		// stepStatus: this.step.status,
				// 		// rateValue,
				// 		// quantityRelative,
				// 		// quantityTotal: this.step.totalWords || this.step.quantity,
				// 		// subtotal,
				// 		// minimum: rateMin,
				// 		// discount: stepDiscount || 0
				// 	};
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
			ValidationErrors,
			ApproveModal,
			Tabs,
			Details,
		},
	};
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors";

  .finance-info {
    position: relative;

    &__modal {
      position: absolute;
      transform: translate(50%, -200%);
    }

    &__tabs {
      margin-top: 25px;
    }
  }
</style>
