<template lang="pug">
  .details
    .details__icons(v-if="areIcons")
      img.details__icon(v-for="(icon, key) in dynamicIcons" :src="icon.src" :class="{'details_opacity-06': isActive(key)}" @click="makeAction(key)")

    .table
    .table__thead.table__header
      .table__head-row.table__header-row.tbody_visible-overflow
        .table__thead-cell
        .table__thead-cell Receivables
        .table__thead-cell Payables

    .table__tbody.tbody_visible-overflow
      .table__body-row
        .table__tbody-cell {{ financeData.title }}
        .table__tbody-cell(v-if="!isQuantityEditable") {{ financeData.quantityTotal }}
        input.details__editing-data(v-else type="number" v-model.number="currentData.quantityTotal")
        .table__tbody-cell(v-if="!isQuantityEditable && financeData.vendor") {{ financeData.quantityTotal }}
        .table__tbody-cell(v-else-if="!financeData.vendor")
        input.details__editing-data(v-else type="number" v-model.number="currentData.quantityTotal")

      .table__body-row
        .table__tbody-cell Rate
        .table__tbody-cell(v-if="!isEditing") {{ financeData.receivables.rate }}
          span(v-html="returnIconCurrencyByStringCode(projectCurrency)")
        input.details__editing-data(v-else type="number" v-model.number="currentData.receivables.rate")
        .table__tbody-cell(v-if="!isEditing && financeData.vendor") {{ financeData.payables.rate }}
          span(v-html="returnIconCurrencyByStringCode(projectCurrency)")
        .table__tbody-cell(v-else-if="!financeData.vendor")
        input.details__editing-data(v-else type="number" v-model.number="currentData.payables.rate")

      .table__body-row
        .table__tbody-cell Price
        .table__tbody-cell {{ financeData.receivables.total }}
          span(v-html="returnIconCurrencyByStringCode(projectCurrency)")
        .table__tbody-cell(v-if="financeData.vendor") {{ financeData.payables.total }}
          span(v-html="returnIconCurrencyByStringCode(projectCurrency)")
        .table__tbody-cell(v-else)


    ValidationErrors(v-if="areErrorsExist" :errors="errors" @closeErrors="closeErrorsBlock" :isAbsolute="isEditing")

</template>

<script>
	import LabelVal from "@/components/LabelVal";
	import ValidationErrors from "../../../ValidationErrors";
	import {mapGetters} from "vuex";
	import currencyIconDetected from "../../../../mixins/currencyIconDetected";

	export default {
		mixins: [currencyIconDetected],
		props: {
			financeData: {
				type: Object
			},
			selectedTab: {
				type: String,
			},
			step: {
				type: Object,
			},
			cancelSave: {
				type: Boolean,
				default: false,
			},
			projectCurrency: {
				type: String,
			}
		},
		data() {
			return {
				icons: {
					save: {
						src: require("../../../../assets/images/Other/save-icon-qa-form.png"),
					},
					edit: {
						src: require("../../../../assets/images/Other/edit-icon-qa.png"),
					},
				},
				isEditing: false,
				currentData: {
					receivables: {},
					payables: {},
				},
				areErrorsExist: false,
				nowTab: 'Receivables',
			};
		},
		methods: {
			isActive(key) {
				return key === "edit" ? this.isEditing : !this.isEditing;
			},
			makeAction(key) {
				if (key === "edit" && this.isEditing) return this.cancel();
				if (key === "edit") {
					this.isEditing = true;
					this.currentData = Object.keys(this.financeData).reduce((prev, cur) => {
						prev[cur] = this.financeData[cur];
						return {...prev};
					}, {});
				} else {
					if (!this.isEditing) return;
					this.checkForErrors();
				}
			},
			checkForErrors() {
				this.errors = [];
				if (this.financeData.vendor !== null) {
					if (!this.currentData.payables.rate) {
						this.errors.push("Set valid Payables Rate value (integer/float)");
					}
				}
				if (!this.currentData.receivables.rate) {
					this.errors.push("Set valid Receivables Rate value (integer/float)");
				}
				if (!this.currentData.quantityTotal) {
					this.errors.push("Set valid Quantity[Total] value(integer)");
				}

				if (this.errors.length) {
					return (this.areErrorsExist = true);
				}
				this.$emit("save", this.currentData);
				this.isEditing = false;
			},
			closeErrorsBlock() {
				this.areErrorsExist = false;
			},
			discardChanges() {
				const {clientRate, finance, vendorRate, quantity} = this.step
				const {Price} = finance

				this.currentData.quantityTotal = quantity

				this.currentData.receivables.rate = clientRate.value
				this.currentData.receivables.total = Price.receivables

				this.currentData.payables.rate = vendorRate.value
				this.currentData.payables.total = Price.payables
			},
			cancel() {
				this.discardChanges();
				this.isEditing = false;
				this.closeErrorsBlock();
			},
		},
		watch: {
			selectedTab(newValue) {
				if (newValue) {
					this.nowTab = newValue;
				}
			},
			cancelSave(action) {
				if (action) {
					this.discardChanges();
				}
			}
		},
		computed: {
			...mapGetters({
				userGroup: "getUserGroup",
			}),

			isQuantityEditable() {
				const groups = ["Administrators", "Developers"];
				return this.isEditing && groups.indexOf(this.userGroup.name) !== -1;
			},
			areIcons() {
				let forbidden = ["Cancelled", "Cancelled Halfway", "Completed"];
				const groups = ["Administrators", "Developers"];
				if (groups.indexOf(this.userGroup.name) !== -1) {
					return forbidden.indexOf(this.financeData.stepStatus) === -1;
				}
				return (
					[...forbidden, "Started"].indexOf(this.financeData.stepStatus) === -1
				);
			},
			dynamicIcons() {
				let result = {
					save: {
						src: require("../../../../assets/images/Other/save-icon-qa-form.png"),
					},
					edit: {
						src: require("../../../../assets/images/Other/edit-icon-qa.png"),
					},
				};
				if (this.isEditing) {
					result.edit = {
						src: require("../../../../assets/images/cancel_icon.jpg"),
					};
				}
				return result;
			},
		},
		components: {
			LabelVal,
			ValidationErrors,
		},
	};
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/FinanceTablesStyle";
  @import "../../../../assets/scss/colors";
  @import "../../../../assets/styles/settingsTable";
</style>
