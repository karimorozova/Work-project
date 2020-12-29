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
    .report-filters__row
      .report-filters__item
        LabelVal(text="Vendor Name:" customClass="new-chart-label")
          .report-filters__drop
            SelectSingle(
              placeholder="Select"
              :hasSearch="true"
              customClass="height-32"
              :options="allVendors"
              :selectedOption="vendorFilter"
              @chooseOption="setVendorFilter"
            )
      .report-filters__item
        LabelVal(text="Industries:" customClass="new-chart-label")
          .report-filters__drop
            SelectSingle(
              placeholder="Select"
              :hasSearch="true"
              customClass="height-32"
              :options="industries"
              :selectedOption="industryFilter"
              @chooseOption="setIndustryFilter"
            )
      .report-filters__item
    .report-filters__row
      .button
        .button__row
          input.button__update-btn(type="submit" value="Update LQA Status Reports" @click="updateReports()")
          input.button__update-btn.button__update-aliases-btn(type="submit" value="Update Aliases" @click="updateAliases()")

</template>

<script>
	import LabelVal from "@/components/LabelVal";
	import SelectSingle from "@/components/SelectSingle";
	import Button from "@/components/Button";

	export default {
		props: {
			targetFilter: { type: String },
			sourceFilter: { type: String },
			tierFilter: { type: String },
			vendorFilter: { type: String },
			industryFilter: { type: String },
			allSources: { type: Array, default: () => [] },
			allTargets: { type: Array, default: () => [] },
			allVendors: { type: Array, default: () => [] },
		},
		data() {
			return {
        tiers: { 'All': 'All', 'Tier 1': '1', 'Tier 2': '2', 'Tier 3': '3' },
        industries: ['All', 'Finance', 'iGaming', 'Other']
      }
		},
		methods: {
      async updateReports () {
        try {
          const report = await this.$http.get('/reportsapi/restore-memoq-lqa-report');
          this.$emit('updateReport', { value: report.body });
          this.alertToggle({ message: 'Started to restore...' });
        } catch (err) {
          this.alertToggle({ message: 'Error on restoring old files', isShow: true, type: 'error' });
        }
      },
      async updateAliases () {
        try {
          const report = await this.$http.get('/reportsapi/restore-lqa-report-aliases');
          this.$emit('updateReport', { value: report.body });
          this.alertToggle({ message: 'Started to restore...' });
        } catch (err) {
          this.alertToggle({ message: 'Error on restoring old files', isShow: true, type: 'error' });
        }
      },
      setTierFilter ({ option }) {
        this.$emit('setTierFilter', { value: this.tiers[option] });
      },
      setTargetFilter ({ option }) {
        this.$emit('setTargetFilter', { option });
      },
      setSourceFilter ({ option }) {
        this.$emit('setSourceFilter', { option });
      },
      setIndustryFilter ({ option }) {
				this.$emit("setIndustryFilter", { option });
			},
			setVendorFilter({ option }) {
				this.$emit("setVendorFilter", { option });
			},

		},
		computed: {
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
    &__update-aliases-btn{
      margin-left: 15px;
    }
    &__update-btn {
      width: 194px;
      height: 34px;
      color: #fff;
      font-size: 14px;
      border-radius: 10px;
      box-shadow: 0 3px 5px rgba(0, 0, 0, .4);
      background-color: #D15F45;
      border: 1px solid #D15F45;
      cursor: pointer;
      outline: 0;
      line-height: 32px;

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
