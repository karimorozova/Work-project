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
import LabelVal from "@/components/LabelVal"
import SelectSingle from "@/components/SelectSingle"
import Button from "@/components/Button"

export default {
  props: {
    targetFilter: { type: String },
    sourceFilter: { type: String },
    allSources: { type: Array, default: () => [] },
    allTargets: { type: Array, default: () => [] },
    tierFilter: { type: String }
  },
  data() {
    return {
      tiers: { "All": "All", "Tier 1": "1", "Tier 2": "2", "Tier 3": "3" }
    }
  },
  methods: {
    updateReports() {
      this.$emit('updateReports')
    },
    setTierFilter({ option }) {
      this.$emit('setTierFilter', { value: this.tiers[option] })
    },
    setTargetFilter({ option }) {
      this.$emit("setTargetFilter", { option })
    },
    setSourceFilter({ option }) {
      this.$emit("setSourceFilter", { option })
    }
  },
  computed: {
    selectedLangs() {
      return this.targetFilter.map(item => item.symbol)
    },
    tierNames() {
      return Object.keys(this.tiers)
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
    min-width: 120px;
    padding: 0 24px 0 24px;
    height: 32px;
    color: $white;
    font-size: 14px;
    border-radius: 4px;
    background-color: $orange;
    border: none;
    transition: .1s ease;
    outline: none;
    letter-spacing: 0.2px;

    &:hover {
      cursor: pointer;
      box-shadow: $box-shadow;
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
    width: 220px;
    height: 32px;
    padding: 0 5px;
    outline: none;
    border: 1px solid $border;
    border-radius: 4px;
    margin-left: 5px;
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
