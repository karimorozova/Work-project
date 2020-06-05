<template lang="pug">
.priceFilter
    .priceFilter__drop-menu
        SelectSingle(
            :selectedOption="step"
            :options="steps"
            placeholder="Step"
            @chooseOption="(e) => setValue(e, 'stepStepFilter')"
        )
    .priceFilter__drop-menu
        SelectSingle(
            :selectedOption="unit"
            :options="units"
            placeholder="Unit"
            @chooseOption="(e) => setValue(e, 'unitStepFilter')"
        )
    .priceFilter__drop-menu
        SelectSingle(
            :selectedOption="size"
            :options="sizes"
            placeholder="Size"
            @chooseOption="(e) => setValue(e, 'sizeStepFilter')"
        )
</template>
<script>
import SelectSingle from "../../SelectSingle";
export default {
  props: {
    step: {
      type: String
    },
    unit: {
      type: String
    },
    size: {
      type: String
    },
    steps: {
      type: Array
    },
    units: {
      type: Array
    },
    sizes: {
      type: Array
    }
  },
  methods: {
    setValue({ option, index }, prop) {
      this.$emit("setFilter", { option, index, prop });
    }
  },
  components: {
    SelectSingle
  }
};
</script>
<style lang="scss" scoped>
.priceFilter {
  display: flex;

  &__drop-menu {
    position: relative;
    width: 120px;
    height: 50px;
    margin-right: 15px;
    margin-top: 5px;
  }
}
</style>