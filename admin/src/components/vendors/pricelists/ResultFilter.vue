<template lang="pug">
  .priceFilter
    .priceFilter__drop-menu
      SelectSingle(
        :hasSearch="true"
        :selectedOption="source"
        :options="sources"
        placeholder="Source"
        @chooseOption="(e) => setValue(e, 'sourceFilter')"
      )
    .priceFilter__drop-menu
      SelectSingle(
        :hasSearch="true"
        :selectedOption="target"
        :options="targets"
        placeholder="Target"
        @chooseOption="(e) => setValue(e, 'targetFilter')"
      )
    .priceFilter__drop-menu
      SelectSingle(
        :hasSearch="true"
        :selectedOption="step"
        :options="steps"
        placeholder="Step"
        @chooseOption="(e) => setValue(e, 'stepFilter')"
      )
    .priceFilter__drop-menu
      SelectSingle(
        :hasSearch="true"
        :selectedOption="unit"
        :options="units"
        placeholder="Unit"
        @chooseOption="(e) => setValue(e, 'unitFilter')"
      )
    .priceFilter__drop-menu
      SelectSingle(
        :hasSearch="true"
        :selectedOption="industry"
        :options="industries"
        placeholder="Industry"
        @chooseOption="(e) => setValue(e, 'industryFilter')"
      )
</template>
<script>
  import SelectSingle from "../../SelectSingle";

  export default {
    props: {
      source: {
        type: String
      },
      target: {
        type: String
      },
      step: {
        type: String
      },
      unit: {
        type: String
      },
      industry: {
        type: String
      },
      steps: {
        type: Array
      },
      targets: {
        type: Array
      },
      sources: {
        type: Array
      },
      units: {
        type: Array
      },
      industries: {
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
    }
  }
</style>
