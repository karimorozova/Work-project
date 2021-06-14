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
            :selectedOption="form"
            :options="forms"
            placeholder="Form"
            @chooseOption="(e) => setValue(e, 'typeFilter')"
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
    form: {
      type: String
    },
    sources: {
      type: Array
    },
    targets: {
      type: Array
    }
  },
  data() {
    return {
      forms: ["All", "Mono", "Duo"]
    };
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
    width: 191px;
    height: 30px;
  }
}
</style>