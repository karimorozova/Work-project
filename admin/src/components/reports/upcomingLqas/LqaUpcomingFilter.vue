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
              :options="allIndustry"
              :selectedOption="industryFilter"
              @chooseOption="setIndustryFilter"
            )
      .report-filters__item
        LabelVal(text="LQA:" customClass="new-chart-label")
          .report-filters__drop
            SelectSingle(
              customClass="height-32"
              :options="lqas"
              :selectedOption="lqaFilter"
              @chooseOption="setLqaFilter"
            )

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
    lqaFilter: { type: String },
    allSources: { type: Array, default: () => [] },
    allTargets: { type: Array, default: () => [] },
    allVendors: { type: Array, default: () => [] },
    allIndustry: { type: Array, default: () => [] },
  },
  data() {
    return {
      tiers: { 'All': 'All', 'Tier 1': '1', 'Tier 2': '2', 'Tier 3': '3' },
      lqas: ['All', 'tqi', 'lqa1', 'lqa2', 'lqa3']
    }
  },
  methods: {
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
    setLqaFilter({ option }) {
      this.$emit("setLqaFilter", { option });
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
    border-radius: 2px;
    box-shadow: 0 3px 5px rgba(0, 0, 0, .4);
    background-color: #d66f58;
    border: 1px solid #d66f58;
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
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 2px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  &__drop {
    position: relative;
    height: 32px;
    width: 220px;
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
