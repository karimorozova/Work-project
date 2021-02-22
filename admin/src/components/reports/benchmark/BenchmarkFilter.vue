<template lang="pug">
  .report-filters
    .report-filters__row
      .report-filters__item
        LabelVal(text="Source Language:" customClass="new-chart-label")
          .report-filters__drop
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="sourceFilter",
              :options="allSources",
              @chooseOptions="(e) => setFilter(e, 'sourceFilter')"
              :allOptionsButtons="false"
            )
      .report-filters__item
        LabelVal(text="Target Language:" customClass="new-chart-label")
          .report-filters__drop
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="targetFilter",
              :options="allTargets",
              @chooseOptions="(e) => setFilter(e, 'targetFilter')"
              :allOptionsButtons="false"
            )
      .report-filters__item
        LabelVal(text="Step:" customClass="new-chart-label")
          .report-filters__drop
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="stepFilter",
              :options="allSteps",
              @chooseOptions="(e) => setFilter(e, 'stepFilter')"
              :allOptionsButtons="false"
            )
    .report-filters__row
      .report-filters__item
        LabelVal(text="Vendor Name:" customClass="new-chart-label")
          .report-filters__drop
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="vendorFilter",
              :options="allVendors",
              @chooseOptions="(e) => setFilter(e, 'vendorFilter')"
              :allOptionsButtons="false"
            )
      .report-filters__item
        LabelVal(text="Industries:" customClass="new-chart-label")
          .report-filters__drop
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="industryFilter",
              :options="allIndustries",
              @chooseOptions="(e) => setFilter(e, 'industryFilter')"
              :allOptionsButtons="false"
            )
      .report-filters__item
        LabelVal(text="Unit:" customClass="new-chart-label")
          .report-filters__drop
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="unitFilter",
              :options="allUnits",
              @chooseOptions="(e) => setFilter(e, 'unitFilter')"
              :allOptionsButtons="false"
            )
    .report-filters__row
      .button
        .button__row
          input.button__update-btn(type="submit" value="Update Benchmark" @click="updateBenchmark()")

</template>

<script>
	import LabelVal from "@/components/LabelVal";
	import Button from "@/components/Button";
  import SelectMulti from "../../SelectMulti"

	export default {
		props: {
			targetFilter: { type: Array, default: () => [] },
			sourceFilter: { type: Array, default: () => [] },
			tierFilter: { type: Array, default: () => [] },
			vendorFilter: { type: Array, default: () => [] },
			industryFilter: { type: Array, default: () => [] },
			stepFilter: { type: Array, default: () => [] },
			unitFilter: { type: Array, default: () => [] },
			allSources: { type: Array, default: () => [] },
			allTargets: { type: Array, default: () => [] },
			allVendors: { type: Array, default: () => [] },
			allIndustries: { type: Array, default: () => [] },
			allSteps: { type: Array, default: () => [] },
			allUnits: { type: Array, default: () => [] },
		},
		methods: {
      async updateBenchmark () {
        try {
          const report = await this.$http.post('/reportsapi/update-vendor-benchmark-cost');
          this.$emit('updateBenchmark', { value: report.body });
          // this.alertToggle({ message: 'Started to update...' });
        } catch (err) {
          // this.alertToggle({ message: 'Error on updating benchmark', isShow: true, type: 'error' });
        }
      },
      setFilter ({ option }, field) {
        const eventName = 'set' + field[0].toUpperCase() + field.substring(1)

        if (option === 'All'){
          this.$emit(eventName, { option: ["All"] });
          return
        }

        const position = this[field].findIndex((item) => item === option)

        if (position !== -1) {
          this[field].splice(position, 1);
        } else {
          this[field].push(option);
        }

        this.$emit(eventName, { option: this[field].filter(items => items !== 'All') });
      },
		},
		computed: {
			tierNames() {
				return Object.keys(this.tiers);
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

  .button {
    &__update-aliases-btn{
      margin-left: 15px;
    }
    &__update-btn {
      min-width: 120px;
      padding: 0 24px 0 24px;
      height: 34px;
      color: $white;
      font-size: 14px;
      border-radius: 7px;
      background-color: $orange;
      border: none;
      transition: .1s ease;
      outline: none;
      letter-spacing: 0.2px;

      &:hover {
        cursor: pointer;
        box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
      }

      &:active {
        transform: scale(.98);
      }
    }
  }

  .report-filters {
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
      width: 191px;
      height: 32px;
      padding: 0 5px;
      outline: none;
      border: 1px solid $main-color;
      border-radius: 5px;
      margin-left: 5px;
    }

    &__drop {
      position: relative;
      height: 32px;
      width: 191px;
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
