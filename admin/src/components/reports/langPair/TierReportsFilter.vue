<template lang="pug">
  .report-filters
    .report-filters__row
      .report-filters__item
        LabelVal(text="Source Language:" customClass="new-chart-label")
          .report-filters__drop
            SelectSingle(
              placeholder="Select"
              :hasSearch="true"
              customClass="height-32"
              :options="allSources"
              :selectedOption="sourceFilter"
              @chooseOption="setSourceFilter"
            )
      .report-filters__item
        LabelVal(text="Target Language:" customClass="new-chart-label")
          .report-filters__drop
            SelectSingle(
              placeholder="Select"
              :hasSearch="true"
              customClass="height-32"
              :options="allTargets"
              :selectedOption="targetFilter"
              @chooseOption="setTargetFilter"
            )
      .report-filters__item
        LabelVal(text="Tier:" customClass="new-chart-label")
          .report-filters__drop
            SelectSingle(
              customClass="height-32"
              :options="tierNames"
              :selectedOption="tierFilter"
              @chooseOption="setTierFilter"
            )
    .button
      .button__row
          input.button__update-btn(type="submit" value="Update Lang Tier Reports" @click="updateReports()")
</template>

<script>
	import LabelVal from "@/components/LabelVal";
	import SelectSingle from "@/components/SelectSingle";
	import Button from "@/components/Button";

	export default {
		props: {
			targetFilter: { type: String },
			sourceFilter: { type: String },
			allSources: { type: Array, default: () => [] },
			allTargets: { type: Array, default: () => [] },
			tierFilter: { type: String },
		},
		data() {
			return {
				tiers: { "All": "All", "Tier 1": "1", "Tier 2": "2", "Tier 3": "3" },
			}
		},
		methods: {
			updateReports(){
				this.$emit('updateReports');
      },
			setTierFilter({ option }) {
				this.$emit('setTierFilter', { value: this.tiers[option] });
			},
			setTargetFilter({ option }) {
				this.$emit("setTargetFilter", { option });
			},
			setSourceFilter({ option }) {
				this.$emit("setSourceFilter", { option });
			},
		},
		computed: {
			selectedLangs() {
				return this.targetFilter.map(item => item.symbol);
			},
			tierNames() {
				return Object.keys(this.tiers);
			}
		},
		components: {
			LabelVal,
			SelectSingle,
			Button
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .button {
    &__row {
      margin-bottom: 20px;
    }
    &__update-btn {
      width: 188px;
      height: 34px;
      color: #fff;
      font-size: 14px;
      border-radius: 10px;
      box-shadow: 0 3px 5px rgba(0, 0, 0, .4);
      background-color: #D15F45;
      border: 1px solid #D15F45;
      cursor: pointer;
      outline: 0;
      line-height: 34px;

      &:active {
        transform: scale(.98);
        outline: none !important;
        outline-color: none;
        border: none;
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
