<template lang="pug">
  .filters
    .filters__row
      .filters__item
        LabelVal(text="Source Language:" customClass="new-chart-label")
          .filters__drop
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="sourceFilter",
              :options="allSources",
              @chooseOptions="(e) => setFilter(e, 'sourceFilter')"
              :allOptionsButtons="false"
            )
      .filters__item
        LabelVal(text="Target Language:" customClass="new-chart-label")
          .filters__drop
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="targetFilter",
              :options="allTargets",
              @chooseOptions="(e) => setFilter(e, 'targetFilter')"
              :allOptionsButtons="false"
            )
      .filters__item
        LabelVal(text="Urgency:" customClass="new-chart-label")
          .filters__drop
            SelectMulti(
              :isTableDropMenu="isTableDropMenu"
              placeholder="Select"
              :hasSearch="true"
              :selectedOptions="urgencyFilter"
              :options="allUrgency"
              @chooseOptions="(e) => setFilter(e, 'urgencyFilter')"
              :allOptionsButtons="false"
            )

    .filters__row
      .filters__item
        LabelVal(text="Vendor Status:" customClass="new-chart-label")
          .filters__drop
            SelectMulti(
              :isTableDropMenu="isTableDropMenu"
              placeholder="Select"
              :hasSearch="true"
              :selectedOptions="vendorStatusFilter"
              :options="allVendorStatus"
              @chooseOptions="(e) => setFilter(e, 'vendorStatusFilter')"
              :allOptionsButtons="false"
            )
      .filters__item
        LabelVal(text="Industries:" customClass="new-chart-label")
          .filters__drop
            SelectMulti(
              :isTableDropMenu="isTableDropMenu"
              placeholder="Select"
              :hasSearch="true"
              :selectedOptions="industryFilter"
              :options="allIndustries"
              @chooseOptions="(e) => setFilter(e, 'industryFilter')"
              :allOptionsButtons="false"
            )
      .filters__item
        LabelVal(text="Step:" customClass="new-chart-label")
          .filters__drop
            SelectMulti(
              :isTableDropMenu="isTableDropMenu"
              placeholder="Select"
              :hasSearch="true"
              :selectedOptions="stepFilter"
              :options="allSteps"
              @chooseOptions="(e) => setFilter(e, 'stepFilter')"
              :allOptionsButtons="false"
            )

</template>

<script>
	import LabelVal from "@/components/LabelVal"
	import Button from "@/components/Button"
	import SelectMulti from "../../SelectMulti"

	export default {
		props: {
			targetFilter: { type: Array, default: () => [] },
			sourceFilter: { type: Array, default: () => [] },
			vendorStatusFilter: { type: Array, default: () => [] },
			industryFilter: { type: Array, default: () => [] },
			stepFilter: { type: Array, default: () => [] },
			urgencyFilter: { type: Array, default: () => [] },

			allSources: { type: Array, default: () => [] },
			allTargets: { type: Array, default: () => [] },
			allIndustries: { type: Array, default: () => [] },
			allSteps: { type: Array, default: () => [] },
			allVendorStatus: { type: Array, default: () => [] },
			allUrgency: { type: Array, default: () => [] }
		},
		methods: {
			setFilter({ option }, field) {
				const eventName = "set" + field[0].toUpperCase() + field.substring(1)
				const position = this[field].findIndex(item => item === option)

				if (position !== -1) this[field].splice(position, 1)
				else this[field].push(option)

				if (option === "All") {
					this.$emit(eventName, { option: [ "All" ] })
				} else {
					this.$emit(eventName, {
						option: this[field].filter(items => items !== "All")
					})
				}
			}
		},
		components: {
			SelectMulti,
			LabelVal,
			Button
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .filters {
    display: flex;
    flex-direction: column;

    &__row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      box-sizing: border-box;
    }

    &__item {
      width: 28%;
    }

    &__text {
      box-sizing: border-box;
      color: $main-color;
      width: 200px;
      height: 32px;
      padding: 0 5px;
      outline: none;
      border: 1px solid #c1bbb1;
      border-radius: 4px;
      margin-left: 5px;
    }

    &__drop {
      position: relative;
      height: 32px;
      width: 200px;
      margin-left: 8px;
    }

    &_no-space {
      justify-content: flex-start;
    }

    &_right-margin-80 {
      margin-right: 80px;
    }

    &_width-300 {
      width: 300px;
    }

    &_width-280 {
      width: 280px;
    }
  }

  input::placeholder {
    color: $main-color;
    opacity: 0.7;
  }
</style>
