<template lang="pug">
.priceFilter
    .priceFilter__drop-menu
        SelectSingle(
            :hasSerch="true"
            :selectedOption="source"
            :options="sources"
            placeholder="Source"
            @chooseOption="(e) => setValue(e, 'sourceLangFilter')"
        )
    .priceFilter__drop-menu
        SelectSingle(
            :hasSerch="true"
            :selectedOption="target"
            :options="targets"
            placeholder="Target"
            @chooseOption="(e) => setValue(e, 'targetLangFilter')"
        )
    .priceFilter__drop-menu
        SelectSingle(
            :selectedOption="form"
            :options="forms"
            placeholder="Form"
            @chooseOption="(e) => setValue(e, 'formLangFilter')"
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
      forms: ["Mono", "Duo"]
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
    width: 120px;
    height: 50px;
    margin-right: 15px;
    margin-top: 5px;
  }
}
</style>